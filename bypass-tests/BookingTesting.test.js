const { Builder, By, until } = require("selenium-webdriver");
const axios = require("axios");

const FRONT_URL = "http://localhost:5173";
const API_URL = "http://localhost:3000";

// Function to perform login on the frontend using Selenium and retrieve the AuthToken from localStorage
async function loginAndGetToken(driver, email, password) {
  async function tryLogin() {
    await driver.get(`${FRONT_URL}/login`);

    const emailInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='email']")),
      10000
    );
    await emailInput.clear();
    await emailInput.sendKeys(email);

    const passwordInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='password']")),
      10000
    );
    await passwordInput.clear();
    await passwordInput.sendKeys(password);

    await driver.findElement(By.xpath("//button[@type='submit']")).click();

    // Return true if token appears, false otherwise
    try {
      await driver.wait(async () => {
        const tok = await driver.executeScript(
          "return window.localStorage.getItem('AuthToken');"
        );
        return !!tok;
      }, 5000);

      return true; // login success
    } catch (e) {
      return false; // login failed
    }
  }

  async function registerUser() {
    await driver.get(`${FRONT_URL}/register`);

    const nameInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='text']")),
      10000
    );
    await nameInput.clear();
    await nameInput.sendKeys("Test User");

    const emailInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='email']")),
      10000
    );
    await emailInput.clear();
    await emailInput.sendKeys(email);

    const passwordInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='password']")),
      10000
    );
    await passwordInput.clear();
    await passwordInput.sendKeys(password);

    await driver.findElement(By.xpath("//button[@type='submit']")).click();

    // Wait for token after registration
    await driver.wait(async () => {
      const tok = await driver.executeScript(
        "return window.localStorage.getItem('AuthToken');"
      );
      return !!tok;
    }, 10000);
  }

  //TRY LOGIN FIRST
  const loginSuccess = await tryLogin();

  if (!loginSuccess) {
    console.log(`Login failed for ${email}. Auto-registering...`);
    await registerUser();
  }

  // Retrieve the AuthToken (after login or registration)
  const token = await driver.executeScript(
    "return window.localStorage.getItem('AuthToken');"
  );

  const currentUrl = await driver.getCurrentUrl();
  console.log(`Final result for ${email}:`);
  console.log("  URL:", currentUrl);
  console.log("  AuthToken:", token ? token.slice(0, 20) + "..." : token);

  return token;
}


// Function to authenticate directly via API as a doctor and get token, slots, and doctorId
async function getDoctorDetails() {
  const email = "batman@gmail.com";
  const password = "batman";

  try {
    // Try login first
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const { token, user } = response.data;

    if (!token) {
      throw new Error("Login did not return a token");
    }
    if (!user || user.role !== "DOCTOR") {
      throw new Error("Logged in user is not a doctor");
    }

    return { token, slots: user.slots, doctorId: user._id };
  } catch (loginErr) {
    // If login failed or user is not doctor, create new doctor account with fixed slots

    const createPayload = {
      email,
      password,
      role: "DOCTOR",
      name: "Batman",
      qualifications: ["MBBS", "MD"],
      specializations: ["Cardiology", "Neurology"],
      experience: "10",
      description: "Superhero doctor",
      slots: [
        {
          timeInterval: "9am - 12pm",
          capacity: 10,
          isAvailable: true,
        },
        {
          timeInterval: "1pm - 4pm",
          capacity: 15,
          isAvailable: true,
        },
      ],
      gender: "Male",
    };

    // Create doctor account
    await axios.post(`${API_URL}/auth/register`, createPayload);

    // Login again after creation
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const { token, user } = loginResponse.data;

    if (!token) {
      throw new Error("Login after create did not return a token");
    }
    if (!user || user.role !== "DOCTOR") {
      throw new Error("Created user is not a doctor");
    }

    return { token, slots: user.slots, doctorId: user._id };
  }
}


// Function to get user ID using token via API call
async function getId(token) {
  const response = await axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user._id;
}

// Array of various unusual and potentially malicious string values for fuzz testing
const weirdStrings = [
  "",
  " ",
  "a",
  "a".repeat(500),
  "' OR 1=1 --",
  "<script>alert(1)</script>",
  "123456789012345678901234", // bogus ObjectId-shaped
];

// Generate multiple booking request payloads by fuzzing doctorID and slotID fields
function generateBookingBodies(base) {
  const bodies = [];

  // doctorID fuzzed, slotID valid
  for (const w of weirdStrings) {
    bodies.push({
      ...base,
      doctorID: w,
      slotID: base.slotID,
    });
  }

  // slotID fuzzed, doctorID valid
  for (const w of weirdStrings) {
    bodies.push({
      ...base,
      doctorID: base.doctorID,
      slotID: w,
    });
  }

  // Both doctorID and slotID fuzzed with all combinations (cartesian product)
  for (const wDoc of weirdStrings) {
    for (const wSlot of weirdStrings) {
      bodies.push({
        ...base,
        doctorID: wDoc,
        slotID: wSlot,
      });
    }
  }

  // Add payloads with wrong data types for doctorID and slotID
  bodies.push({
    ...base,
    doctorID: { bad: "object" },
    slotID: 12345,
  });

  bodies.push({
    ...base,
    doctorID: null,
    slotID: null,
  });

  // Payloads with extra unexpected fields to check resilience
  bodies.push({
    ...base,
    extraField: "<script>alert('x')</script>",
  });

  bodies.push({
    ...base,
    doctorID: base.doctorID,
    slotID: base.slotID,
    nested: { foo: "bar", inj: "' OR 1=1 --" },
  });

  return bodies;
}

// Main test function to validate booking API with multiple fuzzed inputs under two logged-in patient users
async function bookingStateTest() {
  // Create two browser instances for two separate users
  const driver1 = await new Builder().forBrowser("chrome").build();
  const driver2 = await new Builder().forBrowser("chrome").build();

  try {
    // Log in both users concurrently and retrieve their AuthTokens
    const [token1, token2] = await Promise.all([
      loginAndGetToken(driver1, "sohith@gmail.com", "sohith"),
      loginAndGetToken(driver2, "dummy@gmail.com", "dummy"),
    ]);

    if (!token1 || !token2) {
      throw new Error(
        "Failed to retrieve AuthToken for one or both patients."
      );
    }

    // Fetch patient user IDs from tokens
    const patientId1 = await getId(token1);
    const patientId2 = await getId(token2);
    console.log("Patient IDs:", patientId1, patientId2);

    // Get doctor details including valid slot IDs
    const doctorDetails = await getDoctorDetails();
    const doctorId = doctorDetails.doctorId;
    const doctorSlots = doctorDetails.slots;

    const slotId = doctorSlots[0];
    console.log("Doctor:", doctorId, "Slot:", slotId);

    // Base booking payload with valid doctorID and slotID
    const baseBookingBody = {
      doctorID: doctorId,
      slotID: slotId,
    };

    let num500 = 0; // Counter for server internal errors

    // Generate all fuzzed payloads for testing robustness of booking API
    const allPossibleBodies = generateBookingBodies(baseBookingBody);

    // Iterate through all payloads, sending PUT requests to /booking endpoint
    for (let i = 0; i < allPossibleBodies.length; i++) {
      const payload = allPossibleBodies[i];

      try {
        // Send booking request as first user with authorization header
        const r = await axios.put(`${API_URL}/booking`, payload, {
          headers: { Authorization: `Bearer ${token1}` },
          timeout: 5000,
        });

        // Log success response status for each payload
        console.log(`Response [${i}] status=${r.status} for payload: ${JSON.stringify(payload)}`);

      } catch (err) {
        // Log error status and message for failed booking attempts
        const status = err.response?.status || 0;
        const msg = err.response?.data || err.message;
        console.log(
          `[${i}] Error status=${status} for payload: ${JSON.stringify(
            payload
          )} ->`,
          msg
        );

        // Count occurrences of HTTP 500 Internal Server Error responses
        if (status === 500) {
          num500++;
        }
      }
    }

    // Log total count of server errors encountered during testing
    console.log(`Number of 500 errors encountered: ${num500}`);

  } finally {
    // Ensure both browser sessions are closed after test
    await driver1.quit();
    await driver2.quit();
  }
}

// Run the booking state test and handle uncaught exceptions
bookingStateTest().catch((e) => {
  console.error(e);
  process.exit(1);
});

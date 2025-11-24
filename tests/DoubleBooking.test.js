const { Builder, By, until } = require("selenium-webdriver");
const axios = require("axios");

const FRONT_URL = "http://localhost:5173";        
const API_URL = "http://localhost:3000";

// Log in through the frontend using Selenium and return the AuthToken from localStorage
async function loginAndGetToken(driver, email, password) {
  // Open the login page in the frontend app
  await driver.get(`${FRONT_URL}/login`);

  // Wait for the email field, clear it, then type the given email
  const emailInput = await driver.wait(
    until.elementLocated(By.xpath("//input[@type='email']")),
    10000
  );
  await emailInput.clear();
  await emailInput.sendKeys(email);

  // Wait for the password field, clear it, then type the given password
  const passwordInput = await driver.wait(
    until.elementLocated(By.xpath("//input[@type='password']")),
    10000
  );
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  // Click the login/submit button
  await driver.findElement(By.xpath("//button[@type='submit']")).click();

  // Poll until AuthToken appears in localStorage, treating that as login success
  await driver.wait(async () => {
    const tok = await driver.executeScript(
      "return window.localStorage.getItem('AuthToken');"
    );
    return !!tok;
  }, 10000);

  // Read the AuthToken from localStorage
  const token = await driver.executeScript(
    "return window.localStorage.getItem('AuthToken');"
  );

  // Log which URL the login ended up on and a shortened token preview
  const currentUrl = await driver.getCurrentUrl();
  console.log(`Login result for ${email}:`);
  console.log("  URL:", currentUrl);
  console.log(
    "  AuthToken:",
    token ? token.slice(0, 20) + "..." : token
  );

  return token;
}

// Log in as a doctor via backend API and return token and slot list
async function getDoctorDetails() {
  const email = "batman@gmail.com";
  const password = "batman";

  // Call auth/login to get a token and user info for the doctor account
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });

  const { token, user } = response.data;

  // Ensure a token exists
  if (!token) {
    throw new Error("Login did not return a token");
  }
  // Ensure the logged-in user is actually a doctor
  if (!user || user.role !== "DOCTOR") {
    throw new Error("Logged in user is not a doctor");
  }

  // Return doctor token and available slots
  return { token: token, slots: user.slots };
}

// Resolve a user ID from a token using the /user endpoint
async function getId(token){
  const response = await axios.get(`${API_URL}/user`,
  {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user._id;
}

// Query the doctor endpoint and find capacity for a specific slot
async function getSlotCapacity(doctorToken, docId, slotId) {
  // Fetch doctor details using doctor token and ID
  const resp = await axios.post(`${API_URL}/doctor`, 
    {id: docId},
    { headers: { Authorization: `Bearer ${doctorToken}` }}
  );

  // Extract the first doctor from the response
  const doctor = resp.data.doctors && resp.data.doctors[0];
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Find the matching slot by ID
  const slot = doctor.slots.find(
    (s) => String(s._id) === String(slotId)
  );
  if (!slot) {
    throw new Error("Slot not found");
  }

  // Return current capacity of that slot
  return slot.capacity;
}

// Test that two patients booking the same slot reduce capacity by exactly 2
async function doublebookTest() {
  // Start two independent browser sessions to simulate two patients
  const driver1 = await new Builder().forBrowser("chrome").build();
  const driver2 = await new Builder().forBrowser("chrome").build();

  try {
    // Log in both patients in parallel and retrieve their tokens
    const [token1, token2] = await Promise.all([
      loginAndGetToken(driver1, "sohith@gmail.com", "sohith"),
      loginAndGetToken(driver2, "dummy@gmail.com", "dummy")
    ]);

    // Fail early if either login did not yield a token
    if(!token1 || !token2) {
      throw new Error("Failed to retrieve AuthToken for one or both patients.");
    }

    console.log("Both patients logged in successfully.");

    // Get patient IDs from backend using their tokens
    const patientId1 = await getId(token1);
    const patientId2 = await getId(token2);

    console.log("Patient IDs retrieved:", patientId1, patientId2);

    // Log in as doctor via API and get slots, then fetch doctor ID from /user
    const doctorDetails = await getDoctorDetails();
    const doctorId = await getId(doctorDetails.token);
    const doctorSlots = doctorDetails.slots;

    console.log("Doctor token: ", doctorDetails.token.slice(0,20)+"...");
    
    // Build a booking request body for one specific slot
    const bookingBody = {
      doctorID: doctorId,
      slotID: doctorSlots[1],
    }

    // Capture initial capacity of the target slot before bookings
    const initialCapacity = await getSlotCapacity(
      doctorDetails.token,
      doctorId,
      doctorSlots[1]
    );

    // Attempt two concurrent bookings of the same slot by two patients
    const [bookingResp1, bookingResp2] = await Promise.allSettled([
      axios.put(`${API_URL}/booking`, bookingBody, {
        headers: { Authorization: `Bearer ${token1}` },
      }),
      axios.put(`${API_URL}/booking`, bookingBody, {
        headers: { Authorization: `Bearer ${token2}` },
      })
    ]);

    // Log the outcome for both patients (fulfilled or rejected and their data)
    console.log("Booking Responses:");
    console.log("Patient 1:", bookingResp1.status, bookingResp1.value ? bookingResp1.value.data : bookingResp1.reason.response.data);
    console.log("Patient 2:", bookingResp2.status, bookingResp2.value ? bookingResp2.value.data : bookingResp2.reason.response.data);

    // Fetch final capacity after both booking attempts
    const finalCapacity = await getSlotCapacity(
      doctorDetails.token,
      doctorId,
      doctorSlots[1]
    );

    // Compute how many seats were actually consumed
    const diff = initialCapacity - finalCapacity;
    console.log("Capacity difference:", diff);

    // Assert that exactly two bookings were counted for this slot
    if (diff === 2) {
      console.log("PASS: Slot capacity decreased by exactly 2.");
    } else {
      throw new Error(
        `FAIL: Expected slot capacity diff 2, but got ${diff} (initial=${initialCapacity}, final=${finalCapacity})`
      );
    }
  
  } finally {
    // Ensure both browser instances are closed even if the test fails
    await driver1.quit();
    await driver2.quit();
  }
}

// Run the double-booking test and exit with non-zero code on error
doublebookTest().catch((e) => {
  console.error(e);
  process.exit(1);
});

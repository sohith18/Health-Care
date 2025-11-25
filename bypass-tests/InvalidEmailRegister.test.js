const { Builder, By, until, logging } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

const FRONT_URL = "http://localhost:5173";

async function invalidEmailTest() {
    // 1. Configure Chrome to capture browser console logs
    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    const options = new chrome.Options();
    options.setLoggingPrefs(prefs);

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        await driver.get(`${FRONT_URL}/register`);

        // Generate a random unique "invalid" email (no @ symbol)
        // This ensures we don't hit "Email already exists" errors if the backend accepts it
        const randomId = Math.floor(Math.random() * 1000000);
        const uniqueInvalidEmail = `user${randomId}domain.com`; 

        // Manipulate the DOM to change the email type
        await driver.executeScript(`
            const emailInput = document.querySelector('input[type="email"]');
            if (emailInput) {
                emailInput.removeAttribute('type'); 
                emailInput.setAttribute('id', 'temp-test-email');
            }
        `);

        // 1. Fill Name
        try {
            const nameField = await driver.findElement(By.css("input[type='text']:not(#temp-test-email)"));
            await nameField.sendKeys(`Test User ${randomId}`);
        } catch (e) {
            const inputs = await driver.findElements(By.tagName("input"));
            if (inputs.length > 0) await inputs[0].sendKeys(`Test User ${randomId}`);
        }

        // 2. Fill Password
        await driver.findElement(By.css("input[type='password']")).sendKeys("SecurePassword123!");

        // 3. Fill Email with Unique Invalid Format
        try {
            const emailField = await driver.findElement(By.id('temp-test-email')); 
            await emailField.sendKeys(uniqueInvalidEmail);
            console.log(`Attempting to register with: ${uniqueInvalidEmail}`);
        } catch (err) {
            console.error("Could not find email input.");
            throw err;
        }

        // Click Submit
        await driver.findElement(By.xpath("//button[@type='submit']")).click();

        try {
            // Check for Redirect to Homepage (Successful Registration)
            await driver.wait(until.urlIs(`${FRONT_URL}/`), 5000);
            console.log("Success: Registration successful, redirected to homepage.");

        } catch (e) {
            const currentUrl = await driver.getCurrentUrl();
            
            if (currentUrl === `${FRONT_URL}/`) {
                 console.log("Success: Registration successful (URL match).");
            } else {
                console.error(`Error: Registration NOT successful. Stuck on ${currentUrl}`);
                
                try {
                    const bodyText = await driver.findElement(By.tagName('body')).getText();
                    console.log("Page content dump:", bodyText.slice(0, 200) + "..."); 
                } catch(textErr) { }
            }
        }

    } finally {
        await driver.quit();
    }
}

// Execute the test
invalidEmailTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
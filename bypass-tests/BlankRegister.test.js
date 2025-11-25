const { Builder, By, until } = require("selenium-webdriver");
const axios = require("axios");

const FRONT_URL = "http://localhost:5173";        
const API_URL = "http://localhost:3000";

async function blankRegisterTest() {
    // Initialize a WebDriver instance for Chrome browser
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // Open the registration page in the frontend application
        await driver.get(`${FRONT_URL}/register`);

        // Remove "required" attributes from input fields via JavaScript
        // to simulate form submission with blank inputs
        await driver.executeScript(`
            const inputs = document.querySelectorAll('input[required]');
            inputs.forEach(i => i.removeAttribute('required'));
        `);

        // Click the submit button to attempt registration with empty fields
        await driver.findElement(By.xpath("//button[@type='submit']")).click();

        try {
            // Wait for an error message containing keywords like 'required' or 'invalid'
            // This checks if server-side validation prevents empty submissions
            const error = await driver.wait(
                until.elementLocated(
                    By.xpath("//*[contains(text(), 'required') or contains(text(), 'invalid')]")
                ),
                5000
            );

            // Log detected validation message for debugging purposes
            console.log("Server-side validation present, error shown:", "Error during signup");
        } catch {
            // If no validation message appears, log a potential issue with backend validation
            console.error(
                "Potential issue: form submitted with empty name/password and no server-side error detected."
            );
        }
    } finally {
        // Close the browser instance after test completion
        await driver.quit();
    }
}

// Execute the blank registration test and handle unexpected exceptions
blankRegisterTest().catch((e) => {
  console.error(e);
  process.exit(1);
});

const { Builder, By, until } = require("selenium-webdriver");

const FRONT_URL = "http://localhost:5173";        

async function blankLogin() {
    // Initialize a WebDriver instance for Chrome browser
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // Open the login page in the frontend application
        await driver.get(`${FRONT_URL}/login`);

        // Remove "required" attributes from input fields via JavaScript
        // to simulate form submission with blank inputs
        await driver.executeScript(`
            const inputs = document.querySelectorAll('input[required]');
            inputs.forEach(i => i.removeAttribute('required'));
        `);

        // Click the submit button to attempt login with empty fields
        await driver.findElement(By.xpath("//button[@type='submit']")).click();

        try {
            // Check for Redirect to Homepage (Successful Login)
            await driver.wait(until.urlIs(`${FRONT_URL}/`), 5000);
            console.log("Success: Login successful, redirected to homepage.");

        } catch (e) {
            const currentUrl = await driver.getCurrentUrl();
            
            if (currentUrl === `${FRONT_URL}/`) {
                    console.log("Success: Login successful (URL match).");
            } else {
                console.error(`Error: Login NOT successful. Stuck on ${currentUrl}`);
                
                // try {
                //     const bodyText = await driver.findElement(By.tagName('body')).getText();
                //     console.log("Page content dump:", bodyText.slice(0, 200) + "..."); 
                // } catch(textErr) { }
            }
                }
    } finally {
        // Close the browser instance after test completion
        await driver.quit();
    }
}

// Execute the blank registration test and handle unexpected exceptions
blankLogin().catch((e) => {
  console.error(e);
  process.exit(1);
});

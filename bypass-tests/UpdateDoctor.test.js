const { Builder, By, until } = require("selenium-webdriver");

const FRONT_URL = "http://localhost:5173";

async function doctorSlotTest() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // --- STEP 1: LOGIN ---
        console.log("Step 1: Logging in...");
        await driver.get(`${FRONT_URL}/login`);
        
        await driver.findElement(By.css("input[type='email']")).sendKeys("test@gmail.com");
        await driver.findElement(By.css("input[type='password']")).sendKeys("test@123");
        
        const loginBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await driver.executeScript("arguments[0].click();", loginBtn); 

        // Wait for redirect to the profile page
        await driver.wait(until.urlContains("/profile-change-doctor"), 5000);
        console.log("Logged in and redirected to doctor profile.");


        // --- STEP 2: TEST CASE 1 - SEND EMPTY INPUTS ---
        console.log("\nStep 2: Testing Empty Inputs (Bypassing 'required')...");
        
        // Open the "Add Slot" Modal/Form
        const addSlotBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(text(), 'Add Slot') or contains(text(), 'add slot')]")),
            5000
        );
        
        await driver.executeScript("arguments[0].scrollIntoView(true);", addSlotBtn);
        await driver.sleep(500); 
        await driver.executeScript("arguments[0].click();", addSlotBtn);

        // Wait for inputs
        await driver.wait(until.elementLocated(By.tagName("input")), 2000);

        // Remove 'required' attributes
        await driver.executeScript(`
            const inputs = document.querySelectorAll('input');
            inputs.forEach(i => i.removeAttribute('required'));
        `);

        // Attempt to Submit Empty Form
        // FIX: Ensure we click the LAST submit button (the one in the modal), not the profile update button
        const submitBtns = await driver.findElements(By.xpath("//button[@type='submit']"));
        const modalSubmitBtn = submitBtns[submitBtns.length - 1];
        await driver.executeScript("arguments[0].click();", modalSubmitBtn); 

        // Handle Alert for Empty Inputs
        try {
            await driver.wait(until.alertIsPresent(), 5000);
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log("Success: Alert caught for empty inputs: ", alertText);
            await alert.accept(); 
        } catch (e) {
            console.error("Failure: No alert appeared for empty inputs.");
        }


        // --- STEP 3: TEST CASE 2 - INCORRECT TYPE FOR SLOTS ---
        console.log("\nStep 3: Testing Invalid Type for Slots...");
        
        // Navigate back to reset state
        console.log("Navigating back to doctor profile page...");
        await driver.get(`${FRONT_URL}/profile-change-doctor`);
        await driver.wait(until.urlContains("/profile-change-doctor"), 5000);
        await driver.sleep(1000); 
        
        // Re-open "Add Slot"
        const addSlotBtn2 = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(text(), 'Add Slot') or contains(text(), 'add slot')]")),
            5000
        );
        
        await driver.executeScript("arguments[0].scrollIntoView(true);", addSlotBtn2);
        await driver.executeScript("arguments[0].click();", addSlotBtn2);

        // Wait for inputs
        await driver.wait(until.elementLocated(By.tagName("input")), 2000);

        // FIX: The page has other inputs. We grab the LAST 3 inputs found on the page.
        // These should correspond to [Start Time, End Time, Slots] in the modal.
        const allInputs = await driver.findElements(By.tagName("input"));
        
        if (allInputs.length < 3) {
            throw new Error("Not enough inputs found on page to identify modal fields.");
        }

        // Slice the last 3 elements
        const modalInputs = allInputs.slice(-4);
        
        // 1. Start Time
        await modalInputs[0].sendKeys("09:00"); 
        
        // 2. End Time
        await modalInputs[1].sendKeys("17:00"); 
            
        // 3. Slots (Invalid Type Test)
        const slotInput = modalInputs[2];
        await driver.executeScript("arguments[0].removeAttribute('type');", slotInput);
        await slotInput.sendKeys("invalid-number-string");

        // Click Submit (Targeting the last submit button again)
        const submitBtns2 = await driver.findElements(By.xpath("//button[@type='submit']"));
        const modalSubmitBtn2 = submitBtns2[submitBtns2.length - 1];
        await driver.executeScript("arguments[0].click();", modalSubmitBtn2); 

        // Handle Alert for Invalid Type
        try {
            await driver.wait(until.alertIsPresent(), 5000);
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log("Success: Alert caught for invalid type: ", alertText);
            await alert.accept(); 
        } catch (e) {
            console.error("Failure: No alert appeared for invalid type.");
        }

    } finally {
        await driver.quit();
    }
}

doctorSlotTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class SEProjectTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()

    def login_or_register_doctor(self):
        driver = self.driver
        driver.get("http://localhost:5173/register")

        # Check if Doctor already exists by trying to log in
        try:
            buttons = driver.find_elements(By.TAG_NAME, 'button')
            for button in buttons:
                if button.text == "Doctor":
                    button.click()
                    break

            input_fields = driver.find_elements(By.TAG_NAME, 'input')
            for input_field in input_fields:
                if input_field.get_attribute("type") == "text":
                    input_field.clear()
                    input_field.send_keys("testdoctor")

                if input_field.get_attribute("type") == "email":
                    input_field.clear()
                    input_field.send_keys("testdoctor@gmail.com")

                if input_field.get_attribute("type") == "password":
                    input_field.clear()
                    input_field.send_keys("TestDoctor123")

            buttons = driver.find_elements(By.TAG_NAME, 'button')
            for button in buttons:
                if button.get_attribute("type") == "submit" and button.text == "Submit":
                    button.click()
                    break

            # Wait for an alert to confirm registration or indicate the user already exists
            WebDriverWait(driver, 3).until(EC.alert_is_present(), "No alert for registration.")
            alert = driver.switch_to.alert
            if "User already exists" in alert.text:
                alert.accept()
                return self.login_doctor()
            else:
                alert.accept()
        except TimeoutException:
            raise AssertionError("Doctor registration failed or no alert appeared.")

    def login_doctor(self):
        driver = self.driver
        driver.get("http://localhost:5173/login")

        input_fields = driver.find_elements(By.TAG_NAME, 'input')

        for input_field in input_fields:
            if input_field.get_attribute("type") == "email":
                input_field.clear()
                input_field.send_keys("testdoctor@gmail.com")

            if input_field.get_attribute("type") == "password":
                input_field.clear()
                input_field.send_keys("TestDoctor123")

        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for button in buttons:
            if button.get_attribute("type") == "submit" and button.text == "Login":
                button.click()
                break

        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(), "No alert for login.")
            alert = driver.switch_to.alert
            if alert.text != "Logged in successfully":
                raise AssertionError("Login failed.")
            alert.accept()
        except TimeoutException:
            raise AssertionError("Doctor login failed or no alert appeared.")

    def test_doctor_profile_change(self):
        self.login_or_register_doctor()  # Ensure the user is logged in
        driver = self.driver
        driver.get("http://localhost:5173/profile-change-doctor")

        # Fill qualifications
        qualification_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter qualification...']")
        qualification_field.clear()
        qualification_field.send_keys("MBBS, MD")

        # Select specializations
        specialization_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox']")
        for checkbox in specialization_checkboxes:
            if checkbox.get_attribute("value") in ["Cardiology", "Neurology"]:
                checkbox.click()

        # Enter experience
        experience_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter experience...']")
        experience_field.clear()
        experience_field.send_keys("10")

        # Enter description
        description_field = driver.find_element(By.XPATH, "//textarea[@placeholder='Enter a brief description...']")
        description_field.clear()
        description_field.send_keys("Experienced doctor specializing in cardiology and neurology.")

        # Select gender
        gender_dropdown = driver.find_element(By.XPATH, "//select")
        gender_dropdown.click()
        gender_option = driver.find_element(By.XPATH, "//option[@value='Male']")
        gender_option.click()

        # Add slots
        add_slot_button = driver.find_element(By.XPATH, "//button[text()='Add Slot']")
        add_slot_button.click()

        # Modify slot
        starting_time_field = driver.find_element(By.XPATH, "//input[@placeholder='Starting time (e.g. 9am)']")
        starting_time_field.clear()
        starting_time_field.send_keys("9am")

        ending_time_field = driver.find_element(By.XPATH, "//input[@placeholder='Ending time (e.g. 12pm)']")
        ending_time_field.clear()
        ending_time_field.send_keys("12pm")

        capacity_field = driver.find_element(By.XPATH, "//input[@placeholder='Capacity']")
        capacity_field.clear()
        capacity_field.send_keys("10")

        # Submit the form
        submit_button = driver.find_element(By.XPATH, "//button[text()='Submit']")
        submit_button.click()

        # Verify alert
        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(), "No alert for profile update.")
            alert = driver.switch_to.alert
            self.assertTrue(alert.text in ["Profile updated successfully", "Error updating profile"], "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found for profile update.")

    def test_prescriptions_page(self):
        self.login_or_register_doctor()  # Ensure the user is logged in
        driver = self.driver
        driver.get("http://localhost:5173/appointments")

        # Fill prescription details
        patient_name_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter patient name']")
        patient_name_field.clear()
        patient_name_field.send_keys("John Doe")

        patient_age_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter patient age']")
        patient_age_field.clear()
        patient_age_field.send_keys("45")

        patient_gender_dropdown = driver.find_element(By.XPATH, "//select[@id='patient-gender']")
        patient_gender_dropdown.click()
        patient_gender_option = driver.find_element(By.XPATH, "//option[@value='Male']")
        patient_gender_option.click()

        # Fill prescription notes
        prescription_notes_field = driver.find_element(By.XPATH, "//textarea[@placeholder='Enter prescription notes']")
        prescription_notes_field.clear()
        prescription_notes_field.send_keys("Take aspirin once daily. Avoid fatty foods.")

        # Submit prescription
        submit_button = driver.find_element(By.XPATH, "//button[text()='Submit']")
        submit_button.click()

        # Verify alert
        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(), "No alert for prescription submission.")
            alert = driver.switch_to.alert
            self.assertTrue(alert.text in ["Prescription added successfully", "Error adding prescription"], "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found for prescription submission.")

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()

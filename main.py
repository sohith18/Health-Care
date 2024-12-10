import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class SEProjectTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()

    def test_patient_register(self):
        driver = self.driver

        driver.get("http://localhost:5173/register")
 
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for button in buttons:
            if button.text == "Patient":
                button.click()

        input_fields = driver.find_elements(By.TAG_NAME, 'input')

        for input_field in input_fields:
            if input_field.get_attribute("type") == "text":
                input_field.clear()
                input_field.send_keys("testpatient")

            if input_field.get_attribute("type") == "email":
                input_field.clear()
                input_field.send_keys("testpatient@gmail.com")

            if input_field.get_attribute("type") == "password":
                input_field.clear()
                input_field.send_keys("TestPatient123")

        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for button in buttons:
            if button.get_attribute("type") == "submit" and button.text == "Submit":
                button.click()
                break

        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(),
                                        'Timed out waiting for PA creation ' +
                                        'confirmation popup to appear.')

            alert = driver.switch_to.alert
            self.assertTrue(alert.text in ["User already exists", "signed up successfully"], "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found")
        
    def test_doctor_register(self):
        driver = self.driver

        driver.get("http://localhost:5173/register")
 
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for button in buttons:
            if button.text == "Doctor":
                button.click()

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

        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(),
                                        'Timed out waiting for PA creation ' +
                                        'confirmation popup to appear.')

            alert = driver.switch_to.alert
            self.assertTrue(alert.text in ["User already exists", "signed up successfully"], "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found")

    def test_patient_login(self):
        driver = self.driver

        driver.get("http://localhost:5173/login")

        input_fields = driver.find_elements(By.TAG_NAME, 'input')

        for input_field in input_fields:
            if input_field.get_attribute("type") == "email":
                input_field.clear()
                input_field.send_keys("testpatient@gmail.com")

            if input_field.get_attribute("type") == "password":
                input_field.clear()
                input_field.send_keys("TestPatient123")

        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for button in buttons:
            if button.get_attribute("type") == "submit" and button.text == "Login":
                button.click()
                break

        try:
            WebDriverWait(driver, 3).until(EC.alert_is_present(),
                                        'Timed out waiting for PA creation ' +
                                        'confirmation popup to appear.')

            alert = driver.switch_to.alert
            self.assertTrue(alert.text == "Logged in successfully", "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found")
        
    def test_doctor_login(self):
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
            WebDriverWait(driver, 3).until(EC.alert_is_present(),
                                        'Timed out waiting for PA creation ' +
                                        'confirmation popup to appear.')

            alert = driver.switch_to.alert
            self.assertTrue(alert.text == "Logged in successfully", "Incorrect alert")
            alert.accept()
        except TimeoutException:
            raise AssertionError("No alert found")

    def tearDown(self):
        self.driver.close()


if __name__ == "__main__":
    unittest.main()
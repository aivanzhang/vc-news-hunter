from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--incognito")
chrome_options.add_experimental_option("detach", True)
# Create a new instance of the Chrome driver
driver = webdriver.Chrome(options=chrome_options)

# Open the desired webpage
url = "https://www.theinformation.com/sessions/new"  # Replace with the actual URL
driver.get(url)

wait = WebDriverWait(driver, 10)
username_field = wait.until(EC.presence_of_element_located((By.ID, "login-email")))
username_field.send_keys("newcomerep@gmail.com")
username_field.send_keys(Keys.RETURN)

password_field = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "login-password"))
)
password_field.send_keys("n3wcomer!!")
password_field.send_keys(Keys.RETURN)

driver.get(
    "https://www.theinformation.com/articles/softbanks-arm-ipo-win-wont-make-up-for-what-it-missed-out-on"
)
# # Perform actions on the login fields (e.g., entering username and password)
# username_field.send_keys("your_username")
# password_field.send_keys("your_password")
# password_field.send_keys(Keys.RETURN)  # Press Enter to submit

# # Close the browser window when done
# driver.quit()

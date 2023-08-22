SCWEET_EMAIL = "medvedvarvar@rtunerfjqq.com"
SCWEET_PASSWORD = "ivan1234"
SCWEET_USERNAME = "@ivantw21384919"

import time
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
url = "https://twitter.com/i/flow/login"  # Replace with the actual URL
driver.get(url)

wait = WebDriverWait(driver, 10)
username_field = wait.until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "input[autocomplete='username']"))
)
username_field.send_keys(SCWEET_EMAIL)
username_field.send_keys(Keys.RETURN)

time.sleep(5)
password_field = wait.until(
    EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[autocomplete='current-password']")
    )
)
password_field.send_keys(SCWEET_PASSWORD)
password_field.send_keys(Keys.RETURN)
time.sleep(5)
search_field = wait.until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Search']"))
)
search_field.send_keys(
    "https://www.theinformation.com/articles/the-people-with-power-at-oracle-as-it-focuses-on-the-cloud"
)
password_field.send_keys(Keys.RETURN)
# driver.get(
#     "https://www.theinformation.com/articles/softbanks-arm-ipo-win-wont-make-up-for-what-it-missed-out-on"
# )

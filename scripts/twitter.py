import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import urllib.parse

SCWEET_EMAIL = "beyer28623@poverts.com"
SCWEET_PASSWORD = "ivan1234"
SCWEET_USERNAME = "@2cuteWasab56527"

chrome_options = webdriver.ChromeOptions()
chrome_options.binary_location = (
    "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev"
)
chrome_options.add_argument("--incognito")
chrome_options.debugger_address = "localhost:9222"
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
time.sleep(5)
username_field.send_keys(Keys.RETURN)

time.sleep(3)
password_field = wait.until(
    EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[autocomplete='current-password']")
    )
)
password_field.send_keys(SCWEET_PASSWORD)
time.sleep(5)
password_field.send_keys(Keys.RETURN)

news_url = "https://www.theinformation.com/articles/the-people-with-power-at-oracle-as-it-focuses-on-the-cloud"

driver.get(
    f"https://twitter.com/search?q={urllib.parse.quote(news_url)}&src=typed_query"
)

articles_available = wait.until(
    EC.presence_of_element_located((By.TAG_NAME, "article"))
)

# Find all <article> tags
articles = driver.find_elements(By.TAG_NAME, "article")

results = []
print(articles)
for article in articles:
    # Check if there's a deeply nested <span> with the text "Ad"
    ad_spans = article.find_elements(By.XPATH, ".//span[text()='Ad']")
    print(ad_spans)
    if not ad_spans:
        # Find the <a> tag with the href in the specified format
        a_tags = article.find_elements(
            By.XPATH,
            ".//a[contains(@href, '/status/') and contains(@href, '/analytics')]",
        )
        print(a_tags)
        for a_tag in a_tags:
            href = a_tag.get_attribute("href")
            if href:
                # Check if href matches the format ".../status/%d/analytics"
                if re.search(r"/status/\d+/analytics", href):
                    aria_label = a_tag.get_attribute("aria-label")
                    results.append((aria_label, href))


# Print the results
for aria_label, href in results:
    print(f"Aria-label: {aria_label}, Href: {href}")

# driver.get(
#     "https://www.theinformation.com/articles/softbanks-arm-ipo-win-wont-make-up-for-what-it-missed-out-on"
# )

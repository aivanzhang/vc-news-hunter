import requests
import time
from bs4 import BeautifulSoup
import csv
import time
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains


def scrap_vc_news_daily():
    url = "https://vcnewsdaily.com/archive.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    a_tags = soup.find_all("a", class_="d-block")

    months_urls = [a.get("href") for a in a_tags if "Archive" in a.text]

    txt = "Date, Headline, Article Description, URL\n"
    for month_url in months_urls:
        url = f"https://vcnewsdaily.com/{month_url}"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        day_urls_tags = soup.find_all("a", class_="d-block")
        for day_tag in day_urls_tags:
            if "Archive" in day_tag.text:
                date = day_tag.text.replace("Archive for ", "")
                print(f"Scraping news for {date}")
                day_url = day_tag.get("href")
                url = f"https://vcnewsdaily.com/access/{day_url}"
                response = requests.get(url)
                soup = BeautifulSoup(response.text, "html.parser")
                article_tags = soup.find_all("div", class_="select-article")
                for article_tag in article_tags:
                    article_url = article_tag.find("a", class_="titleLink").get("href")
                    article_p = article_tag.find("div", class_="article-paragraph").text
                    article_headline = article_tag.find("a", class_="titleLink").text
                    news_writer = csv.writer(open("vcnewsdaily.csv", "a"))
                    news_writer.writerow(
                        [date, article_headline, article_p, article_url]
                    )


url = "https://techcrunch.com/author/connie-loizos/"
delay = 10
button_xpath = "/html/body/div[2]/div/div/div[3]/div/div/button"
options = Options()
options.binary_location = (
    "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev"
)
service = Service(executable_path="chromedriver")
driver = webdriver.Chrome(
    options=options,
    service=service,
)


def write_connie(updated_html):
    soup = BeautifulSoup(updated_html, "html.parser")
    a_tags = soup.find_all("a", class_="post-block__title__link")
    headlines = [[a.text, 4] for a in a_tags]
    news_writer = csv.writer(open("connie.csv", "w+"), delimiter=",")
    news_writer.writerows(headlines)


def scrape_connie():
    # Initialize the browser driver (e.g., ChromeDriver) - Download the appropriate driver for your browser

    # Open the URL in the browser
    driver.get(url)
    try:
        while True:
            # Find the button by its XPath
            button = driver.find_element("xpath", button_xpath)

            actions = ActionChains(driver)
            actions.move_to_element(button).click().perform()

            # Click the button
            button.click()

            # Wait for a given delay before clicking again
            time.sleep(delay)

    except NoSuchElementException:
        print("Button not found. Stopping the script.")

    except:
        updated_html = driver.page_source
        write_connie(updated_html)

    updated_html = driver.page_source
    write_connie(updated_html)


def clean_scrapped_data():
    with open("vcnewsdaily.csv", "r") as file:
        reader = csv.reader(file)
        rows = list(reader)

    # Extract headlines from each row
    headlines = [row[1] for row in rows]

    # Write headlines to output CSV file
    with open("vcnewsdaily_clean.csv", "w+", newline="") as file:
        writer = csv.writer(file)
        for headline in headlines:
            writer.writerow([headline, 4])


def write_connie(updated_html):
    soup = BeautifulSoup(updated_html, "html.parser")
    a_tags = soup.find_all("a", class_="post-block__title__link")
    headlines = [[a.text, 4] for a in a_tags]
    news_writer = csv.writer(open("connie.csv", "w+"), delimiter=",")
    news_writer.writerows(headlines)


def write_dan(updated_html):
    soup = BeautifulSoup(updated_html, "html.parser")
    spans = soup.find_all("span", class_="h7 md:h6 text-soft-black-core")
    newsletters = []
    newsletter_urls = []
    headlines = []
    for span in spans:
        txt = span.text
        if "Axios Pro Rata:" in txt:
            newsletters.append([txt.replace("Axios Pro Rata: ", ""), 4])
            newsletter_urls.append([span.parent.get("href")])
        else:
            headlines.append([txt, 4])

    news_writer = csv.writer(open("dan.csv", "a"), delimiter=",")
    news_writer.writerows(headlines)
    # nl_titles_writer = csv.writer(open("dan_nl_titles.csv", "a"), delimiter=",")
    # nl_titles_writer.writerows(newsletters)
    # nl_writer = csv.writer(open("dan_nl.csv", "a"), delimiter=",")
    # nl_writer.writerows(newsletter_urls)


def scrape_dan():
    # Initialize the browser driver (e.g., ChromeDriver) - Download the appropriate driver for your browser

    # Open the URL in the browser
    driver.get("https://www.axios.com/authors/danprimack")
    try:
        while True:
            # Find the button by its XPath
            button = driver.find_element(
                "xpath",
                "//*[text()='Show 5 more stories']",
            )
            # for button in buttons:
            actions = ActionChains(driver)
            actions.move_to_element(button).click().perform()

            # Wait for a given delay before clicking again
            time.sleep(3)

    except NoSuchElementException:
        print("Button not found. Stopping the script.")

    except:
        print("ERROR")
        updated_html = driver.page_source
        write_dan(updated_html)

    updated_html = driver.page_source
    write_dan(updated_html)


# scrape_dan()
# scrape_connie()


def scrape_newsletters():
    with open("dan_nl.csv", "r") as file:
        reader = csv.reader(file)
        rows = list(reader)
    for row in rows:
        url = row[0]
        print(url)
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        a_tags = soup.find("a")
        a_tags.extract()
        story_block = soup.find_all("div", class_="-mt-15 pt-15 sm:-mt-20 sm:pt-20")
        for story in story_block:
            block_title = story.find("h4")
            if not block_title:
                continue
            block_title = block_title.text

            if block_title == "The BFD":
                text = story.findAll("p")
                if "Source" in text[0].text:
                    text = text[1].text
                else:
                    text = text[0].text
                news_writer = csv.writer(
                    open("dan_nl_headlines.csv", "a"), delimiter=","
                )
                news_writer.writerows([[text.strip(), 4]])

            if block_title == "Venture Capital Deals" or block_title == "Fundraising":
                deals = story.find_all("p")
                headlines = [deal.text.replace("•", "").strip() for deal in deals]
                news_writer = csv.writer(
                    open("dan_nl_headlines.csv", "a"), delimiter=","
                )
                news_writer.writerows([[headline, 4] for headline in headlines])


scrape_newsletters()
driver.quit()

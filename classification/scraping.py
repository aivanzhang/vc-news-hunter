import requests
import time
from bs4 import BeautifulSoup


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
                    txt += f"{date},{article_headline},{article_p},{article_url}\n"
                time.sleep(5)
            with open("vcnewsdaily.csv", "w+") as f:
                f.write(txt)


scrap_vc_news_daily()

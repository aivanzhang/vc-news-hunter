import feedparser
from functools import reduce
from pymongo import MongoClient
from bs4 import BeautifulSoup
import pprint
import schedule
import time

# Set up MongoDB connection
# Update with your MongoDB connection details
client = MongoClient("mongodb://localhost:27017/")
db = client["vc_news"]  # Name of the database


def fetch():
    # fetch_nyt()
    # fetch_wsj()
    # fetch_forbes()
    # fetch_wp()
    fetch_information()


def fetch_nyt():
    collection = db["nyt"]  # Name of the collection
    url = "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        description = entry.description
        authors = [author.strip() for author in entry.author.split(",")]
        tags = [tag.term for tag in entry.tags]
        pub_date = entry.published
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
        }
        collection.insert_one(article)


def fetch_wsj():
    collection = db["wsj"]
    url = [
        ("US Business", "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml"),
        ("Markets", "https://feeds.a.dj.com/rss/RSSMarketsMain.xml"),
        ("Tech", "https://feeds.a.dj.com/rss/RSSWSJD.xml"),
    ]

    for tag, url in url:
        feed = feedparser.parse(url)

        for entry in feed.entries:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            description = entry.summary
            tags = [tag]
            authors = ""
            pub_date = entry.published
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
            }
            collection.insert_one(article)


def fetch_forbes():
    collection = db["forbes"]  # Name of the collection
    url = "https://rss.app/feeds/gPewJbxDeu3FskgJ.xml"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        soup = BeautifulSoup(entry.summary, "html.parser")
        description = soup.find("div").find("div").text.strip()
        authors = [author.strip() for author in entry.author.split(",")]
        tags = []
        pub_date = entry.published
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
        }
        collection.insert_one(article)


def fetch_wp():
    collection = db["wp"]  # Name of the collection
    url = [
        (
            "Technology",
            "https://feeds.washingtonpost.com/rss/business/technology?itid=lk_inline_manual_31",
        ),
        (
            "Business",
            "https://feeds.washingtonpost.com/rss/business?itid=lk_inline_manual_37",
        ),
    ]
    for tag, url in url:
        feed = feedparser.parse(url)

        for entry in feed.entries:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            description = entry.summary
            authors = [author.strip() for author in entry.author.split(",")]
            tags = [tag]
            pub_date = entry.published
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
            }
            collection.insert_one(article)


def fetch_information():
    collection = db["information"]  # Name of the collection
    url = "https://www.theinformation.com/feed"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        soup = BeautifulSoup(entry.summary, "html.parser")
        description = "".join(
            [htag.text.strip() for htag in soup.find_all("p")]
        ).strip()
        authors = [author["name"] for author in entry.authors]
        tags = []
        pub_date = entry.published
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
        }
        collection.insert_one(article)


fetch()
# fetch_nyt()
# fetch_wsj()
# fetch_forbes()
# Schedule the script to run every minute
# schedule.every(1).minutes.do(fetch_and_store_data)
# while True:
#     schedule.run_pending()
#     time.sleep(1)

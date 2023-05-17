import feedparser
from pymongo import MongoClient
import pprint
import schedule
import time

# Set up MongoDB connection
# Update with your MongoDB connection details
client = MongoClient("mongodb://localhost:27017/")
db = client["vc_news"]  # Name of the database


def fetch():
    fetch_nyt()
    fetch_wsj()


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
        author = entry.author
        tags = [tag.term for tag in entry.tags]
        pub_date = entry.published
        article = {
            "title": title,
            "link": link,
            "author": author,
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
            author = ""
            pub_date = entry.published
            article = {
                "title": title,
                "link": link,
                "author": author,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
            }
            collection.insert_one(article)


# fetch_nyt()
fetch_wsj()
# Schedule the script to run every minute
# schedule.every(1).minutes.do(fetch_and_store_data)
# while True:
#     schedule.run_pending()
#     time.sleep(1)

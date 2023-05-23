import feedparser
from functools import reduce
from pymongo import MongoClient
from bs4 import BeautifulSoup
import pprint
import schedule
import time
from dateutil import parser

# Set up MongoDB connection
# Update with your MongoDB connection details
client = MongoClient("mongodb://localhost:27017/")
db = client["vc_news"]  # Name of the database
collection = db["articles"]  # Name of the collection


def fetch():
    # fetch_nyt()
    # fetch_wsj()
    # fetch_forbes()
    # fetch_wp()
    # fetch_information()
    # fetch_information_kate()
    # fetch_cnbc()
    # fetch_tech_crunch()
    # fetch_tech_crunch_connie()
    # fetch_fortune()
    # fetch_verge()
    return


def fetch_nyt():
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
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "nyt",
        }
        collection.insert_one(article)


def fetch_wsj():
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
            authors = []
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
                "outlet": "wsj",
            }
            collection.insert_one(article)


def fetch_forbes():
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
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "forbes",
        }
        collection.insert_one(article)


def fetch_wp():
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
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
                "outlet": "wp",
            }
            collection.insert_one(article)


def fetch_information():
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
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "information",
        }
        collection.insert_one(article)


def fetch_information_kate():
    url = "https://rss.app/feeds/OcSi0UxY1CKCIEpa.xml"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        soup = BeautifulSoup(entry.summary, "html.parser")
        description = soup.find("div").find("div").text.strip()
        authors = [author["name"] for author in entry.authors]
        tags = []
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "information_kate",
        }
        collection.insert_one(article)


def fetch_cnbc():
    url = [
        (
            "Top News",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        ),
        (
            "World News",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362",
        ),
        (
            "US News",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15837362",
        ),
        (
            "Asia News",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19832390",
        ),
        (
            "Europe News",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19794221",
        ),
        (
            "Business",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147",
        ),
        (
            "Earnings",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839135",
        ),
        (
            "Commentary",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100370673",
        ),
        (
            "Economy",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
        ),
        (
            "Finance",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
        ),
        (
            "Technology",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910",
        ),
        (
            "Politics",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000113",
        ),
        (
            "Health Care",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000108",
        ),
        (
            "Real Estate",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000115",
        ),
        (
            "Wealth",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001054",
        ),
        (
            "Autos",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000101",
        ),
        (
            "Energy",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19836768",
        ),
        (
            "Media",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000110",
        ),
        (
            "Retail",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000116",
        ),
        (
            "Travel",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000739",
        ),
        (
            "Small Business",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=44877279",
        ),
        (
            "Market Insider",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20409666",
        ),
        (
            "NetNet",
            "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=38818154",
        ),
    ]
    for tag, url in url:
        feed = feedparser.parse(url)

        for entry in feed.entries:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            description = entry.summary if "summary" in entry else ""
            authors = []
            tags = [tag]
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
                "outlet": "cnbc",
            }
            collection.insert_one(article)


def fetch_tech_crunch():
    url = "https://techcrunch.com/feed/"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        soup = BeautifulSoup(entry.summary, "html.parser")
        description = soup.find("p").text.strip()
        authors = [author["name"] for author in entry.authors]
        tags = [tag["term"] for tag in entry.tags]
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "tech_crunch",
        }
        collection.insert_one(article)


def fetch_tech_crunch_connie():
    url = "https://techcrunch.com/author/connie-loizos/feed/"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        soup = BeautifulSoup(entry.summary, "html.parser")
        description = soup.find("p").text.strip()
        authors = [author["name"] for author in entry.authors]
        tags = [tag["term"] for tag in entry.tags]
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "tech_crunch_connie",
        }
        collection.insert_one(article)


def fetch_fortune():
    url = "https://fortune.com/feed/fortune-feeds/?id=3230629"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        if collection.find_one({"title": title}):
            continue

        link = entry.link
        description = entry.summary
        authors = [author["name"] for author in entry.authors]
        tags = [tag["term"] for tag in entry.tags]
        pub_date = parser.parse(entry.published)
        article = {
            "title": title,
            "link": link,
            "authors": authors,
            "tags": tags,
            "description": description,
            "pub_date": pub_date,
            "outlet": "fortune",
        }
        collection.insert_one(article)


def fetch_verge():
    url = [
        (
            "Android",
            "http://www.theverge.com/android/rss/index.xml",
        ),
        ("Apple", "http://www.theverge.com/apple/rss/index.xml"),
        ("Apps", "http://www.theverge.com/apps/rss/index.xml"),
        ("Climate", "https://www.theverge.com/rss/climate-change/index.xml"),
        ("Crypto", "https://www.theverge.com/rss/cryptocurrency/index.xml"),
        ("Creators", "https://www.theverge.com/rss/creators/index.xml"),
        ("Cybersecurity", "https://www.theverge.com/rss/cyber-security/index.xml"),
        (
            "Decoder",
            "https://www.theverge.com/rss/decoder-podcast-with-nilay-patel/index.xml",
        ),
        ("Elon Musk", "https://www.theverge.com/rss/elon-musk/index.xml"),
        ("Facebook", "https://www.theverge.com/rss/facebook/index.xml"),
        ("Google", "https://www.theverge.com/rss/google/index.xml"),
        ("Hot Pod", "https://www.theverge.com/rss/hot-pod-newsletter/index.xml"),
        ("Meta", "https://www.theverge.com/rss/meta/index.xml"),
        ("Microsoft", "https://www.theverge.com/rss/microsoft/index.xml"),
        ("Policy", "https://www.theverge.com/policy/rss/index.xml"),
        ("Samsung", "https://www.theverge.com/rss/samsung/index.xml"),
        ("Sciences", "https://www.theverge.com/rss/science/index.xml"),
        ("Spaces", "https://www.theverge.com/rss/space/index.xml"),
        ("Tesla", "https://www.theverge.com/rss/tesla/index.xml"),
        ("TikTok", "https://www.theverge.com/rss/tiktok/index.xml"),
        ("Transportation", "https://www.theverge.com/rss/transportation/index.xml"),
        ("Twitter", "https://www.theverge.com/rss/twitter/index.xml"),
        ("YouTube", "https://www.theverge.com/rss/youtube/index.xml"),
    ]
    for tag, url in url:
        feed = feedparser.parse(url)

        for entry in feed.entries:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            soup = BeautifulSoup(entry.summary, "html.parser")
            description = soup.find("p").text.strip()
            authors = [author["name"] for author in entry.authors]
            tags = [tag]
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": description,
                "pub_date": pub_date,
                "outlet": "verge",
            }
            collection.insert_one(article)


fetch()
# Schedule the script to run every minute
# schedule.every(1).minutes.do(fetch_and_store_data)
# while True:
#     schedule.run_pending()
#     time.sleep(1)

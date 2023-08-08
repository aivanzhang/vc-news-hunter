import feedparser
from functools import reduce
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bs4 import BeautifulSoup
import pprint
import schedule
import time
from dateutil import parser
import asyncio
import requests
import re
import imaplib
import email
from transformers import pipeline
import torch
import torch.nn.functional as F

# Set up MongoDB connection
# Update with your MongoDB connection details
# uri = "mongodb://localhost:27017"
uri = "mongodb+srv://ivan:9lhUkeVT3YYGVAzh@cluster0.67lpgjg.mongodb.net/?retryWrites=true&w=majority"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["vc_news"]  # Name of the database
collection = db["articles"]  # Name of the collection
status_collection = db["onlines"]  # Name of the collection

torch.set_printoptions(sci_mode=False)
id2label = {0: "World", 1: "Sports", 2: "Business", 3: "Sci/Tech", 4: "Startup"}
label2id = {"World": 0, "Sports": 1, "Business": 2, "Sci/Tech": 3, "Startup": 4}
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
classifier_a = pipeline(
    "text-classification", model="alimazhar-110/website_classification"
)
classifier_b = pipeline(
    "text-classification", model="wesleyacheng/news-topic-classification-with-bert"
)

label_mappings = {
    "News": "World",
    "Travel": "World",
    "Social Networking and Messaging": "Sci/Tech",
    "Sports": "Sports",
    "Law and Government": "World",
    "E-Commerce": "Business",
    "Computers and Technology": "Sci/Tech",
    "Business/Corporate": "Business",
    "Streaming Services": "Misc",
    "Photography": "Misc",
    "Health and Fitness": "Misc",
    "Games": "Misc",
    "Forums": "Misc",
    "Food": "Misc",
    "Education": "Misc",
    "Adult": "Misc",
}


def get_classifier_a(headline):
    results: list = classifier_a(headline, top_k=3)
    result = {}

    for res in results:
        label = label_mappings[res["label"]]
        score = res["score"]
        if score < 0.1:
            continue
        if label in result:
            result[label] += score
        else:
            result[label] = score

    return result


def get_classifier_b(headline):
    results: list = classifier_b(headline, top_k=3)
    result = {}
    for res in results:
        score = res["score"]
        if score < 0.1:
            continue
        result[res["label"]] = score

    return result


def get_final_weights(headline):
    a = get_classifier_a(headline)
    b = get_classifier_b(headline)
    final_res = {}

    for news_type, score in a.items():
        final_res[news_type] = score * 0.4

    for news_type, score in b.items():
        if news_type in final_res:
            final_res[news_type] += score * 0.6
        else:
            final_res[news_type] = score * 0.6

    for news_type, score in final_res.items():
        final_res[news_type] = min(1, score)

    max_key = max(final_res, key=final_res.get)
    final_res["type"] = max_key

    return final_res


def get_news_types(headline):
    if not headline:
        return {}
    return get_final_weights(headline)


def get_description(text):
    if not text:
        return ""
    if len(text.split(" ")) < 150:
        return text
    return summarizer(text[:1024], max_length=150, min_length=50, do_sample=False)[0][
        "summary_text"
    ]


async def fetch():
    tasks = [
        fetch_nyt(),
        fetch_wsj(),
        fetch_forbes(),
        fetch_axios(),
        fetch_wp(),
        fetch_information(),
        fetch_cnbc(),
        fetch_tech_crunch(),
        fetch_tech_crunch_connie(),
        fetch_fortune(),
        fetch_verge(),
        fetch_bloomberg(),
        fetch_insider(),
        fetch_semafor(),
        fetch_strictly_vc(),
        fetch_term_sheet(),
    ]
    await asyncio.gather(*tasks)
    return


def updateStatus(outlet, isOnline):
    status_collection.update_one(
        {"outlet": outlet},
        {"$set": {"outlet": outlet, "status": isOnline}},
        upsert=True,
    )


async def fetch_nyt():
    url = "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
    updateStatus("nyt", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("nyt", False)
        return

    for entry in feed.entries:
        try:
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
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "nyt",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("nyt", False)
            continue


async def fetch_wsj():
    url = [
        ("US Business", "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml"),
        ("Markets", "https://feeds.a.dj.com/rss/RSSMarketsMain.xml"),
        ("Tech", "https://feeds.a.dj.com/rss/RSSWSJD.xml"),
    ]

    updateStatus("wsj", True)
    for tag, url in url:
        try:
            feed = feedparser.parse(url)
        except:
            updateStatus("wsj", False)
            continue

        for entry in feed.entries:
            try:
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
                    "description": get_description(description),
                    "pub_date": pub_date,
                    "outlet": "wsj",
                    **get_news_types(title),
                }
                collection.insert_one(article)
            except:
                updateStatus("wsj", False)
                continue


async def fetch_forbes():
    url = "https://news.google.com/rss/search?q=when:24h+allinurl:forbes.com&hl=en-US&gl=US&ceid=US:en"
    updateStatus("forbes", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("forbes", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title.replace(" - Forbes", "")
            if collection.find_one({"title": title}):
                continue
            link = entry.link
            description = ""
            authors = []
            tags = []
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "forbes",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("forbes", False)
            continue


async def fetch_axios():
    url = "https://api.axios.com/feed/"
    updateStatus("axios", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("axios", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title
            if collection.find_one({"title": title}):
                continue
            link = entry.link
            soup = BeautifulSoup(entry.summary, "html.parser")
            description = soup.get_text().strip()
            authors = [author["name"] for author in entry.authors]
            tags = [tag["term"] for tag in entry.tags]
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "axios",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("axios", False)
            continue


async def fetch_wp():
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
    updateStatus("wp", True)
    for tag, url in url:
        try:
            feed = feedparser.parse(url)
        except:
            updateStatus("wp", False)
            continue

        for entry in feed.entries:
            try:
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
                    "description": get_description(description),
                    "pub_date": pub_date,
                    "outlet": "wp",
                    **get_news_types(title),
                }
                collection.insert_one(article)
            except:
                updateStatus("wp", False)
                continue


async def fetch_information():
    url = "https://www.theinformation.com/feed"
    updateStatus("information", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("information", False)
        return

    for entry in feed.entries:
        try:
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
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "information",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("information", False)
            continue


async def fetch_cnbc():
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
    updateStatus("cnbc", True)
    for tag, url in url:
        try:
            feed = feedparser.parse(url)
        except:
            updateStatus("cnbc", False)
            continue

        for entry in feed.entries:
            try:
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
                    "description": get_description(description),
                    "pub_date": pub_date,
                    "outlet": "cnbc",
                    **get_news_types(title),
                }
                collection.insert_one(article)
            except:
                updateStatus("cnbc", False)
                continue


async def fetch_tech_crunch():
    url = "https://techcrunch.com/feed/"
    updateStatus("tech_crunch", True)
    try:
        feed = feedparser.parse(url)
    except Exception as e:
        print(e)
        updateStatus("tech_crunch", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            soup = BeautifulSoup(entry.summary, "html.parser")
            description = soup.text
            try:
                description = soup.find("p").text.strip()
            except:
                pass

            authors = [author["name"] for author in entry.authors]
            tags = [tag["term"] for tag in entry.tags]
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "tech_crunch",
                **get_news_types(title),
            }

            collection.insert_one(article)
        except Exception as e:
            print(e)
            updateStatus("tech_crunch", False)
            continue


async def fetch_tech_crunch_connie():
    url = "https://techcrunch.com/author/connie-loizos/feed/"
    updateStatus("tech_crunch_connie", True)
    try:
        feed = feedparser.parse(url)
    except Exception as e:
        print(e)
        updateStatus("tech_crunch_connie", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title
            if collection.find_one({"title": title}):
                continue

            link = entry.link
            soup = BeautifulSoup(entry.summary, "html.parser")
            description = soup.text
            try:
                description = soup.find("p").text.strip()
            except:
                pass
            authors = [author["name"] for author in entry.authors]
            tags = [tag["term"] for tag in entry.tags]
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "tech_crunch_connie",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except Exception as e:
            print(e)
            updateStatus("tech_crunch_connie", False)
            continue


async def fetch_fortune():
    url = "https://fortune.com/feed/fortune-feeds/?id=3230629"
    updateStatus("fortune", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("fortune", False)
        return

    for entry in feed.entries:
        try:
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
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "fortune",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("fortune", False)
            continue


async def fetch_verge():
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
    updateStatus("verge", True)
    for tag, url in url:
        try:
            feed = feedparser.parse(url)
        except:
            updateStatus("verge", False)
            continue

        for entry in feed.entries:
            try:
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
                    "description": get_description(description),
                    "pub_date": pub_date,
                    "outlet": "verge",
                    **get_news_types(title),
                }
                collection.insert_one(article)
            except:
                updateStatus("verge", False)
                continue


async def fetch_bloomberg():
    url = "https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en"
    updateStatus("bloomberg", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("bloomberg", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title.replace(" - Bloomberg", "")
            if collection.find_one({"title": title}):
                continue
            link = entry.link
            description = ""
            authors = []
            tags = []
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "bloomberg",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("bloomberg", False)
            continue


async def fetch_insider():
    url = "https://news.google.com/rss/search?q=when:24h+allinurl:businessinsider.com&hl=en-US&gl=US&ceid=US:en"
    updateStatus("insider", True)
    try:
        feed = feedparser.parse(url)
    except:
        updateStatus("insider", False)
        return

    for entry in feed.entries:
        try:
            title = entry.title.replace("- Business Insider", "")
            if collection.find_one({"title": title}):
                continue
            link = entry.link
            description = ""
            authors = []
            tags = []
            pub_date = parser.parse(entry.published)
            article = {
                "title": title,
                "link": link,
                "authors": authors,
                "tags": tags,
                "description": get_description(description),
                "pub_date": pub_date,
                "outlet": "insider",
                **get_news_types(title),
            }
            collection.insert_one(article)
        except:
            updateStatus("insider", False)
            continue


async def fetch_semafor():
    url = [
        ("Technology", "https://www.semafor.com/vertical/tech"),
        ("Business", "https://www.semafor.com/vertical/business"),
    ]
    updateStatus("semafor", True)
    for tag, url in url:
        try:
            soup = BeautifulSoup(requests.get(url).content, "html.parser")
            elements = soup.select('[class^="styles_gridItem"]')
            for element in elements:
                link = str(element.find("a")["href"])
                if "newsletters" in link:
                    continue
                date_pattern = r"/(\d{2}/\d{2}/\d{4})/"
                matches = re.findall(date_pattern, link)
                if not matches:
                    continue
                title = element.select('[class^="styles_headline"]')[0].text
                if collection.find_one({"title": title}):
                    continue
                description = element.select('[class^="styles_intro"]')[0].text
                pub_date = parser.parse(matches[0])
                authors = []
                tags = [tag]
                article = {
                    "title": title,
                    "link": "https://www.semafor.com" + link,
                    "authors": authors,
                    "tags": tags,
                    "description": get_description(description),
                    "pub_date": pub_date,
                    "outlet": "semafor",
                    **get_news_types(title),
                }
                collection.insert_one(article)
        except:
            updateStatus("semafor", False)
            continue


async def fetch_strictly_vc():
    # Get your Gmail credentials
    USERNAME = "vcdealhunter@gmail.com"
    PASSWORD = "ecoufdrjcemoesef"

    updateStatus("strictly_vc", True)

    try:
        # Connect to the Gmail IMAP server
        server = imaplib.IMAP4_SSL("imap.gmail.com")
        server.login(USERNAME, PASSWORD)

        # Select the Inbox folder
        server.select("Inbox")

        # Get a list of all the emails in the Inbox
        result, messages = server.search(None, "ALL")

        if result == "OK":
            # Iterate over the messages
            for message_id in messages[0].split():
                # Get the email message
                result, message = server.fetch(message_id, "(RFC822)")
                if result == "OK":
                    email_message = email.message_from_bytes(message[0][1])
                    title = email_message["Subject"]
                    sender = email_message["From"]
                    if sender != "StrictlyVC <connie@strictlyvc.com>":
                        continue
                    if collection.find_one({"title": title}):
                        continue
                    date = email_message["Date"]
                    body = ""

                    # Iterate through email parts
                    for part in email_message.walk():
                        if (part.get_content_type()) == "text/html":
                            body += part.get_payload(decode=True).decode("utf-8")

                    soup = BeautifulSoup(body, "html.parser")
                    a_tag = soup.find("a", string="View in browser")
                    if not a_tag:
                        continue
                    link = a_tag["href"]

                    server.copy(message_id, "Archive")
                    server.store(message_id, "+FLAGS", "\\Deleted")
                    description = ""
                    authors = []
                    tags = []
                    pub_date = parser.parse(date)
                    article = {
                        "title": title,
                        "link": link,
                        "authors": authors,
                        "tags": tags,
                        "description": get_description(description),
                        "pub_date": pub_date,
                        "outlet": "strictly_vc",
                        **get_news_types(title),
                    }
                    collection.insert_one(article)

            server.expunge()
    except:
        updateStatus("strictly_vc", False)
        return
    # Close the connection to the Gmail IMAP server
    server.close()
    server.logout()


async def fetch_term_sheet():
    # Get your Gmail credentials
    USERNAME = "vcdealhunter@gmail.com"
    PASSWORD = "ecoufdrjcemoesef"

    updateStatus("termsheet", True)

    try:
        # Connect to the Gmail IMAP server
        server = imaplib.IMAP4_SSL("imap.gmail.com")
        server.login(USERNAME, PASSWORD)

        # Select the Inbox folder
        server.select("Inbox")

        # Get a list of all the emails in the Inbox
        result, messages = server.search(None, "ALL")

        if result == "OK":
            # Iterate over the messages
            for message_id in messages[0].split():
                # Get the email message
                result, message = server.fetch(message_id, "(RFC822)")
                if result == "OK":
                    email_message = email.message_from_bytes(message[0][1])
                    title = email_message["Subject"]
                    sender = email_message["From"]
                    if sender != '"Term Sheet" <fortune@newsletter.fortune.com>':
                        continue
                    if collection.find_one({"title": title}):
                        continue
                    date = email_message["Date"]
                    body = ""

                    # Iterate through email parts
                    for part in email_message.walk():
                        if (part.get_content_type()) == "text/html":
                            body += part.get_payload(decode=True).decode("utf-8")

                    soup = BeautifulSoup(body, "html.parser")
                    a_tag = soup.find("a", string="View this email in your browser.")
                    if not a_tag:
                        continue
                    link = a_tag["href"]

                    server.copy(message_id, "Archive")
                    server.store(message_id, "+FLAGS", "\\Deleted")
                    description = ""
                    authors = []
                    tags = []
                    pub_date = parser.parse(date)
                    article = {
                        "title": title,
                        "link": link,
                        "authors": authors,
                        "tags": tags,
                        "description": get_description(description),
                        "pub_date": pub_date,
                        "outlet": "termsheet",
                        **get_news_types(title),
                    }
                    collection.insert_one(article)

            server.expunge()
    except:
        updateStatus("termsheet", False)
        return
    # Close the connection to the Gmail IMAP server
    server.close()
    server.logout()


def fetch_job():
    asyncio.run(fetch())


# Schedule the script to run every minute
schedule.every(1).minutes.do(fetch_job)
while True:
    schedule.run_pending()
    time.sleep(1)

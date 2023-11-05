from pymongo import MongoClient, DESCENDING
from pymongo.server_api import ServerApi
from datetime import datetime, timedelta
import time
import schedule
from random import randint as random
from urllib.parse import quote_plus
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

uri = "mongodb+srv://ivan:9lhUkeVT3YYGVAzh@cluster0.67lpgjg.mongodb.net/?retryWrites=true&w=majority"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["vc_news"]  # Name of the database
collection = db["articles"]  # Name of the collection

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--incognito")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
)
chrome_options.add_argument("referer=https://www.google.com/")


d = webdriver.Chrome(options=chrome_options)


def get_twitter_top(url):
    base_url = f"https://nitter.ktachibana.party/search?f=tweets&q={quote_plus(url)}"
    d.get(base_url)

    # Find elements by class name
    tweet_elements = d.find_elements(By.CLASS_NAME, "timeline-item")

    tweets_data = []
    for tweet in tweet_elements:
        details = {}
        details["link"] = (
            tweet.find_element(By.CLASS_NAME, "tweet-link").get_attribute("href") or ""
        )

        details["link"] = details["link"].replace("https://nitter.mint.lgbt/", "")
        tweet = tweet.find_element(By.CLASS_NAME, "tweet-body")
        user_details = {}

        # Extracting tweet details
        details["full_text"] = tweet.find_element(By.CLASS_NAME, "tweet-content").text
        details["created_at"] = tweet.find_element(By.CLASS_NAME, "tweet-date").text

        # Extracting tweet stats
        stats = tweet.find_elements(By.CLASS_NAME, "tweet-stat")
        details["reply_count"] = int(stats[0].text.replace(",", "") or 0)
        details["retweet_count"] = int(stats[1].text.replace(",", "") or 0)
        details["quote_count"] = int(stats[2].text.replace(",", "") or 0)
        details["favorite_count"] = int(stats[3].text.replace(",", "") or 0)

        # Extracting user details
        user_details["name"] = tweet.find_element(By.CLASS_NAME, "fullname").text
        user_details["screen_name"] = tweet.find_element(
            By.CLASS_NAME, "username"
        ).text[1:]

        # Constructing the JSON object
        tweet_data = {
            "url": f"https://twitter.com/{details['link']}",
            "views": 0,  # Placeholder value, as it's not present in the provided HTML
            "bookmark_count": 0,  # Placeholder value
            "favorite_count": details["favorite_count"],
            "quote_count": details["quote_count"],
            "reply_count": details["reply_count"],
            "retweet_count": details["retweet_count"],
            "full_text": details["full_text"],
            "created_at": details["created_at"],
            "author": {
                "name": user_details["name"],
                "screen_name": user_details["screen_name"],
                "followers_count": 0,  # Placeholder value
                "friends_count": 0,  # Placeholder value
            },
        }
        tweets_data.append(tweet_data)

    totals = {}
    for t_info in tweets_data:
        for key, value in t_info.items():
            # Check if the value is numeric
            if isinstance(value, (int, float)):
                totals[key] = totals.get(key, 0) + value
            # If the value is a nested dictionary, sum its numeric fields
            elif isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    if isinstance(sub_value, (int, float)):
                        full_key = f"total_{sub_key}"
                        totals[full_key] = totals.get(full_key, 0) + sub_value

    return tweets_data, totals


def update_articles():
    try:
        article = collection.find_one(
            {
                "$and": [
                    {
                        "$or": [
                            {"outlet": {"$in": ["tech_crunch", "information"]}},
                            {"authors": "Dan Primack"},
                        ]
                    },
                    {"pub_date": {"$lt": datetime.now() - timedelta(days=1)}},
                ]
            },
            sort=[("pub_date", DESCENDING)],
        )

        while article is not None:
            link = article["link"]
            print(f"Getting tweets for {link}")
            tweets, totals = get_twitter_top(link)
            print(f"Got {len(tweets)} tweets for {link}")
            collection.update_one(
                {"_id": article["_id"]},
                {"$set": {"tweets": tweets, "tweets_summary": totals}},
                upsert=False,
            )
            time.sleep(random(30, 180))
            article = collection.find_one(
                {
                    "$and": [
                        {
                            "$or": [
                                {"outlet": {"$in": ["tech_crunch", "information"]}},
                                {"authors": "Dan Primack"},
                            ]
                        },
                        {"pub_date": {"$lt": datetime.now() - timedelta(days=1)}},
                        # {"tweets": {"$exists": False}},
                    ]
                }
            )

    except Exception as e:
        print(e)
        return


# schedule.every(1).day.at("00:00").do(update_articles)

# while True:
#     schedule.run_pending()
#     time.sleep(1)

update_articles()

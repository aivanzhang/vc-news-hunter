from tweeterpy import TweeterPy, config
import random
import time
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime, timedelta
import schedule

uri = "mongodb+srv://ivan:9lhUkeVT3YYGVAzh@cluster0.67lpgjg.mongodb.net/?retryWrites=true&w=majority"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["vc_news"]  # Name of the database
collection = db["articles"]  # Name of the collection

twitter = TweeterPy()
config.PROXY = {"http": "127.0.0.1", "https": "127.0.0.1"}
config.TIMEOUT = 10
try:
    twitter.load_session("tester89257")
except:
    twitter.login("tester89257", "ivan1234")
    twitter.save_session()


def get_tweet_info(article_url):
    search_res = twitter.search(article_url, total=3)
    rate_limit = search_res["api_rate_limit"]
    if rate_limit["rate_limit_exhausted"]:
        sleep_time = rate_limit["reset_after_datetime_object"].total_seconds() + 300
        print(f"Sleeping for {sleep_time} seconds")
        time.sleep(sleep_time)
    article_tweets = []
    for content in search_res["data"]:
        icontent = content["content"]["itemContent"]
        res = icontent["tweet_results"]["result"]
        details = res["legacy"]
        user_details = res["core"]["user_results"]["result"]["legacy"]
        views = 0
        if "views" in res and "count" in res["views"]:
            try:
                views = int(res["views"]["count"])
            except:
                views = 0
        t_info = {
            "views": views,
            "bookmark_count": details["bookmark_count"],
            "favorite_count": details["favorite_count"],
            "quote_count": details["quote_count"],
            "reply_count": details["reply_count"],
            "retweet_count": details["retweet_count"],
            "full_text": details["full_text"],
            "created_at": details["created_at"],
            "author": {
                "name": user_details["name"],
                "screen_name": user_details["screen_name"],
                "followers_count": user_details["followers_count"],
                "friends_count": user_details["friends_count"],
            },
        }
        t_info[
            "url"
        ] = f"https://twitter.com/{t_info['author']['screen_name']}/status/{res['rest_id']}"
        article_tweets.append(t_info)
    totals = {}
    for t_info in article_tweets:
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

    time.sleep(random.randint(1, 5))

    return article_tweets, totals


def update_articles():
    results = collection.find(
        {
            "$and": [
                {
                    "$or": [
                        {"outlet": {"$in": ["tech_crunch", "information", "wsj"]}},
                        {"authors": "Dan Primack"},
                    ]
                },
                {"pub_date": {"$lt": datetime.now() - timedelta(days=1)}},
                {"tweet": {"$exists": False}},
            ]
        }
    )

    for article in results:
        link = article["link"]
        print(f"Getting tweets for {link}")
        tweets, totals = get_tweet_info(link)
        collection.update_one(
            {"_id": article["_id"]},
            {"$set": {"tweets": tweets, "tweets_summary": totals}},
            upsert=False,
        )


# schedule.every().day.at("00:00").do(update_articles)

# while True:
#     schedule.run_pending()
#     time.sleep(1)

# update_articles()


articles = collection.find(
    {"tweet": {"$exists": True}, "tweet_summary": {"$exists": True}}
)

for article in articles:
    collection.update_one(
        {"_id": article["_id"]},
        {"$rename": {"tweet": "tweets", "tweet_summary": "tweets_summary"}},
    )

    # Convert tweet.views to an integer for each tweet in the tweets array
    tweets = [{**tweet, "views": int(tweet["views"])} for tweet in article["tweet"]]
    print(tweets)

    # Calculate the total views for tweets
    total_views = sum(tweet["views"] for tweet in tweets)

    # Then, update the values
    collection.update_one(
        {"_id": article["_id"]},
        {"$set": {"tweets": tweets, "tweets_summary.views": total_views}},
    )

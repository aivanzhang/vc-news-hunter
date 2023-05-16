import feedparser
from pymongo import MongoClient
import schedule
import time

# Set up MongoDB connection
# Update with your MongoDB connection details
client = MongoClient("mongodb://localhost:27017/")
db = client["nytimes"]  # Name of the database
collection = db["articles"]  # Name of the collection


def fetch_and_store_data():
    # Fetch RSS feed
    url = "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml"
    feed = feedparser.parse(url)

    # Store data in MongoDB
    for entry in feed.entries:
        title = entry.title
        link = entry.link
        description = entry.description
        pub_date = entry.published

        article = {
            "title": title,
            "link": link,
            "description": description,
            "pub_date": pub_date,
        }

        collection.insert_one(article)
        print(f"Stored article: {title}")

    print("Data stored successfully.")


fetch_and_store_data()

# Schedule the script to run every minute
# schedule.every(1).minutes.do(fetch_and_store_data)

# while True:
#     schedule.run_pending()
#     time.sleep(1)

const express = require("express");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const authors = require("./authors.json");

const openai = new OpenAI({
  apiKey: "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",
});

// Create a schema for your data
const newsSchema = new mongoose.Schema({
  authors: [String],
  description: String,
  link: String,
  pub_date: Date,
  tags: [String],
  title: String,
  outlet: String,
  type: String,
  Misc: Number,
  World: Number,
  Sports: Number,
  Business: Number,
  "Sci/Tech": Number,
  hidden: Boolean,
});

const onlineSchema = new mongoose.Schema({
  outlet: String,
  status: Boolean,
});

const generatedSchema = new mongoose.Schema({
  articleIds: [String],
  generated: String,
  date: Date,
});

// Connect to MongoDBm
mongoose
  .connect(
    "mongodb+srv://ivan:9lhUkeVT3YYGVAzh@cluster0.67lpgjg.mongodb.net/vc_news?retryWrites=true&w=majority",
    // "mongodb://localhost:27017/vc_news",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Create an Express app
const app = express();

// Enable JSON body parsing
app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

function convertSources(selectedSources) {
  const sources = [];
  selectedSources.forEach((source) => {
    if (authors[source]) {
      sources.push({
        outlet: authors[source].outlet,
        authors: authors[source].author,
      });
    } else {
      sources.push({
        outlet: source,
      });
    }
  });
  return sources;
}

// Define a route to handle the database request
app.post("/get", (req, res) => {
  // Get data from the request body
  const {
    selectedSources,
    page,
    dateRange,
    sortOption,
    types,
    sciTechMetric,
    businessMetric,
    names,
  } = req.body;
  const new_types = types.filter((type) => type !== "Startup");
  const limit = 10;
  const newsSourceCollection = mongoose.model("articles", newsSchema);
  let dateRangeQuery = {};
  if (dateRange[0]) {
    dateRangeQuery.$gte = new Date(dateRange[0]);
  }
  if (dateRange[1]) {
    dateRangeQuery.$lte = new Date(dateRange[1]);
  }
  if (Object.keys(dateRangeQuery).length > 0) {
    dateRangeQuery = { pub_date: { ...dateRangeQuery } };
  }
  if (new_types[0] == "All") {
    dateRangeQuery["type"] = {
      $in: ["World", "Sports", "Business", "Sci/Tech", "Misc"],
    };
  } else {
    if (sciTechMetric) {
      dateRangeQuery["Sci/Tech"] = { $gte: sciTechMetric };
    }
    if (businessMetric) {
      dateRangeQuery["Business"] = { $gte: businessMetric };
    }
  }
  dateRangeQuery["hidden"] = { $ne: true };

  (names.length > 0
    ? newsSourceCollection.find({
        ...dateRangeQuery,
        authors: { $in: names },
      })
    : newsSourceCollection
        .find(dateRangeQuery)
        .or(convertSources(selectedSources))
  )
    .sort(sortOption === "most_recent" ? { pub_date: -1 } : {})
    .skip((page - 1) * limit)
    .limit(limit)
    .then((docs) => {
      res.status(200).json({ articles: docs });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error retrieving documents" });
    });
});

app.post("/top", (req, res) => {
  // Get data from the request body
  const { daysOld, numArticles, sortByTwitter } = req.body;
  const newsSourceCollection = mongoose.model("articles", newsSchema);
  let dateRangeQuery = {};
  dateRangeQuery["pub_date"] = {
    $gte: new Date(new Date().getTime() - daysOld * 24 * 60 * 60 * 1000),
  };
  dateRangeQuery["Sci/Tech"] = { $gte: 0.5 };
  dateRangeQuery["Business"] = { $gte: 0.2 };
  dateRangeQuery["hidden"] = { $ne: true };
  (sortByTwitter
    ? newsSourceCollection
        .aggregate([
          {
            $match: dateRangeQuery, // This is equivalent to .find(dateRangeQuery)
          },
          {
            $addFields: {
              // Calculate the popularity score for each document
              popularityScore: {
                $add: [
                  "$tweets_summary.views",
                  { $multiply: ["$tweets_summary.bookmark_count", 5] },
                  { $multiply: ["$tweets_summary.favorite_count", 10] },
                  { $multiply: ["$tweets_summary.quote_count", 15] },
                  { $multiply: ["$tweets_summary.reply_count", 5] },
                  { $multiply: ["$tweets_summary.retweet_count", 10] },
                  {
                    $multiply: ["$tweets_summary.total_followers_count", 0.1],
                  },
                  {
                    $multiply: ["$tweets_summary.total_friends_count", 0.05],
                  },
                  { $multiply: ["$Business", 50] },
                  { $multiply: ["$Sci/Tech", 30] },
                ],
              },
            },
          },
          {
            $sort: { popularityScore: -1, pub_date: -1 }, // Sort by popularity first, then by publication date
          },
          {
            $limit: numArticles,
          },
        ])
        .exec()
    : newsSourceCollection
        .find(dateRangeQuery)
        .sort({ pub_date: -1 })
        .limit(numArticles)
  )
    .then((docs) => {
      res.status(200).json({ articles: docs });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error retrieving documents" });
    });
});

app.post("/getStatuses", (req, res) => {
  const onlineCollection = mongoose.model("onlines", onlineSchema);

  onlineCollection
    .find()
    .then((docs) => {
      // Convert docs so that they are indexed by outlet'
      const docsObj = {};
      docs.forEach((doc) => {
        docsObj[doc.outlet] = doc.status;
      });
      res.status(200).json({ statuses: docsObj });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error retrieving statuses" });
    });
});

app.post("/hide", (req, res) => {
  const { articleId } = req.body;
  const newsSourceCollection = mongoose.model("articles", newsSchema);

  newsSourceCollection
    .updateOne({ _id: articleId }, { hidden: true })
    .then(() => {
      res.status(200).json({ message: "Successfully updated" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error updating document" });
    });
});

app.post("/generateNewsletter", async (req, res) => {
  const { articleIds } = req.body;

  const newsSourceCollection = mongoose.model("articles", newsSchema);
  const articles = await newsSourceCollection.find({
    _id: { $in: articleIds },
  });
  const cleanedArticles = articles.map(
    ({ _id, title, link, authors, description, pub_date, outlet }) => ({
      _id,
      title,
      link,
      authors,
      description,
      pub_date,
      outlet,
    })
  );

  const prompt =
    "Use the following information to create a fun, interesting, and professional roundup startup and venture capital newsletter post that gives subscribers insight into what the most important news from this past week were. Make sure each article has a good title and a minimum 2 paragraph and maximum 4 paragraph description. E Each article is separated by dashes. Add a maximum of 5 emojis if it makes sense. Make sure that each title has the right article link. It is very important that each article is in the roundup. If it is missing the description, infer from the title. Generate the markdown. \n\n" +
    cleanedArticles
      .map(
        ({ title, description, link }) =>
          `Link: ${link}\n\nTitle: ${title}\n\nDescription: ${description}`
      )
      .join("\n--------------------\n");

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are Eric Newcomer, a journalist known for his work covering technology and startups. You are writing a weekly roundup of interesting tech and startup news for your newsletter.",
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: prompt.split(" ").length * 4,
  });

  const post = completion.choices[0].message.content;

  const GeneratedCollection = mongoose.model("generated", generatedSchema);
  const newGenerated = new GeneratedCollection({
    articleIds: cleanedArticles.map(({ _id }) => _id),
    generated: post,
    date: new Date(),
  });
  await newGenerated.save();

  res.status(200).json({
    message: "Successfully generated newsletter",
    generated_id: newGenerated._id,
  });
});

app.post("/getGeneratedNewsletter", async (req, res) => {
  const { generated_id } = req.body;

  const GeneratedCollection = mongoose.model("generated", generatedSchema);
  const generated = await GeneratedCollection.findById(generated_id);
  const newsSourceCollection = mongoose.model("articles", newsSchema);
  const articles = await newsSourceCollection.find({
    _id: { $in: generated.articleIds },
  });
  const cleanedArticles = articles.map(
    ({ _id, title, link, authors, description, pub_date, outlet }) => ({
      _id,
      title,
      link,
      authors,
      description,
      pub_date,
      outlet,
    })
  );

  res.status(200).json({ generated, articles: cleanedArticles });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

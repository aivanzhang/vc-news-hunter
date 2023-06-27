const express = require("express");
const mongoose = require("mongoose");
const authors = require("./authors.json");

// Create a schema for your data
const newsSchema = new mongoose.Schema({
  authors: [String],
  description: String,
  link: String,
  pub_date: Date,
  tags: [String],
  title: String,
  outlet: String,
});

const onlineSchema = new mongoose.Schema({
  outlet: String,
  status: Boolean,
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
    }
    sources.push({
      outlet: source,
    });
  });
  return sources;
}

// Define a route to handle the database request
app.post("/get", (req, res) => {
  // Get data from the request body
  const { selectedSources, page } = req.body;
  const limit = 10;

  const newsSourceCollection = mongoose.model("articles", newsSchema);

  newsSourceCollection
    .find()
    .or(convertSources(selectedSources))
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

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

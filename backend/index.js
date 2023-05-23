const express = require("express");
const mongoose = require("mongoose");

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

// Connect to MongoDBm
mongoose
  .connect(
    "mongodb+srv://ivan:9lhUkeVT3YYGVAzh@cluster0.67lpgjg.mongodb.net/?retryWrites=true&w=majority",
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

// Define a route to handle the database request
app.post("/get", (req, res) => {
  // Get data from the request body
  const { newsSource, page, sortBy = "" } = req.body;
  const limit = 10;
  let [sortValue = "chronological", sortOrder = "desc"] =
    sortBy !== "" ? sortBy.split("_") : [];

  if (sortValue === "alphabetical") {
    sortValue = "title";
  } else {
    sortValue = "pub_date";
  }
  if (sortOrder === "asc") {
    sortOrder = 1;
  } else {
    sortOrder = -1;
  }

  const newsSourceCollection = mongoose.model("articles", newsSchema);

  newsSourceCollection
    .find(newsSource === "all" ? {} : { outlet: newsSource })
    .sort({ [sortValue]: sortOrder })
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

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

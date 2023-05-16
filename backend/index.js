const express = require("express");
const cors = require("cors");
const initDB = require("./db");

const init = async () => {
  await initDB();
  console.log("Database initialized");
};
const app = express();

app.use(cors());
app.use(express.json());

init()
  .then(() => {
    app.listen(3001, () => {
      console.log("Express application started on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error during initialization:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

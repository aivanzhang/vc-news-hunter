const mongoose = require("mongoose");

const uri = "mongodb://localhost:27017";

const init = async () => {
  return await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = init;

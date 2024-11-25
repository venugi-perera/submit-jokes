// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error(err));

// Joke Schema and Model
const jokeSchema = new mongoose.Schema({
  content: String,
  type: String,
});

const jokeTypeSchema = new mongoose.Schema({
  content: { type: String, required: true }, // The name of the joke type
  type: { type: String, required: true, unique: true }, // A unique identifier for the joke type
});

const JokeType = mongoose.model("JokeType", jokeTypeSchema, "jokes_types");
const Joke = mongoose.model("Joke", jokeSchema);

// Routes
app.get("/jokes/types", async (req, res) => {
  const types = await JokeType.distinct("type"); // Select only the 'type' field, exclude '_id'

  res.json(types);
});

app.get("/jokes/random/:selectedType", async (req, res) => {
  const { selectedType } = req.params;
  let jokes;
  if (selectedType) {
    jokes = await Joke.find({ type: selectedType });
  } else {
    jokes = await Joke.find();
  }

  res.json(jokes);
});

app.get("/jokes/random", async (req, res) => {
  let jokes = await Joke.find();
  res.json(jokes);
});

app.post("/jokes", async (req, res) => {
  const { content, type } = req.body;
  const joke = new Joke({ content, type });
  await joke.save();
  res.status(201).json(joke);
});

// Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`Submit Jokes Service running on port ${PORT}`)
);

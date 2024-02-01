// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
try {
  mongoose.connect(
    "mongodb+srv://jesjos44:W3KAzNsKbaoDEOjs@cluster0.kaknhp2.mongodb.net/?retryWrites=true&w=majority"
  );
} catch (e) {
  throw e;
}

// Create a Result model
const Result = mongoose.model("Result", {
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  ties: { type: Number, default: 0 },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// API endpoint to store results in MongoDB
app.put("/api/results", async (req, res) => {
  console.log("Received");
  const { wins, losses, ties } = req.body;

  try {
    const existingResult = await Result.findOne();

    if (!existingResult) {
      return res.status(404).send("Result not found.");
    }

    existingResult.wins = wins;
    existingResult.losses = losses;
    existingResult.ties = ties;

    await existingResult.save();

    res.status(200).send("Result updated successfully!");
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).send("Error updating result.");
  }
});

// API endpoint to reset the score
app.post("/api/reset", async (req, res) => {
  try {
    await Result.deleteMany(); // Delete all documents in the Result collection
    const newResult = new Result({ wins: 0, losses: 0, ties: 0 });
    await newResult.save(); // Insert a new document with default scores

    res.status(200).send("Score reset successfully!");
  } catch (error) {
    console.error("Error resetting score:", error);
    res.status(500).send("Error resetting score.");
  }
});

// API endpoint to get the latest results
app.get("/api/results", async (req, res) => {
  try {
    const latestResult = await Result.findOne().sort({ _id: -1 });

    if (!latestResult) {
      return res.status(404).send("No results found.");
    }

    const { wins, losses, ties } = latestResult;

    res.status(200).json({ wins, losses, ties });
  } catch (error) {
    console.error("Error retrieving results:", error);
    res.status(500).send("Error retrieving results.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

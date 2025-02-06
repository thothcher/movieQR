const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Initialize Firebase with Service Account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fixes newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to Vote
app.post("/vote", async (req, res) => {
  const { movie } = req.body;
  if (!movie) return res.status(400).json({ error: "Movie name required" });

  const docRef = db.collection("votes").doc(movie);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({ count: admin.firestore.FieldValue.increment(1) });
  } else {
    await docRef.set({ count: 1 });
  }

  res.json({ success: true, message: `Vote recorded for ${movie}` });
});

app.get("/vote", async (req, res) => {
  const movie = req.query.movie;
  if (!movie) return res.status(400).send("Movie name is required!");

  const docRef = db.collection("votes").doc(movie);
  const doc = await docRef.get();

  if (doc.exists) {
      await docRef.update({ count: admin.firestore.FieldValue.increment(1) });
  } else {
      await docRef.set({ count: 1 });
  }

  res.send(`<h1>Vote Recorded for ${movie}!</h1><p>Thank you for voting.</p>`);
});

// Endpoint to Get Results
app.get("/results", async (req, res) => {
  const snapshot = await db.collection("votes").get();
  let results = {};
  snapshot.forEach((doc) => {
    results[doc.id] = doc.data().count;
  });
  res.json(results);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

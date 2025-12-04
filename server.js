const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());

// Load keys.json
const keysPath = path.join(__dirname, "keys.json");
let keys = [];

if (fs.existsSync(keysPath)) {
  keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
}

// API to generate key
app.get("/generate", (req, res) => {
  const newKey = "RAJ-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  keys.push(newKey);

  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

  res.json({ key: newKey });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

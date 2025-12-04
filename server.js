// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure keys file exists
const keysPath = path.join(__dirname, "keys.json");
if (!fs.existsSync(keysPath)) {
  fs.writeFileSync(keysPath, "[]", "utf8");
}

// Helpers
function loadKeys() {
  try {
    return JSON.parse(fs.readFileSync(keysPath, "utf8") || "[]");
  } catch (e) {
    return [];
  }
}
function saveKeys(arr) {
  fs.writeFileSync(keysPath, JSON.stringify(arr, null, 2), "utf8");
}

// API: generate a new key (accepts ?admin=NAME&days=N)
app.get("/generate", (req, res) => {
  try {
    const admin = (req.query.admin || "RAJ_X_ADMIN").toString().trim();
    const days = parseInt(req.query.days || "1", 10) || 1;

    // create an 8+ char key like RAJ_ABC1...
    const raw = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newKey = `RAJ_${raw}`;

    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const item = {
      key: newKey,
      admin: admin,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      used: false
    };

    const keys = loadKeys();
    keys.unshift(item); // newest first
    saveKeys(keys);

    return res.json(item);
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: "Could not generate key" });
  }
});

// Return saved keys (already saved as array of objects)
app.get("/keys.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(keysPath);
});

// Serve static frontend (public/index.html)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server (use Render PORT or fallback)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

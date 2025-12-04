// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const keysPath = path.join(__dirname, "keys.json");
const publicDir = path.join(__dirname, "public");

// Create keys.json if missing
if (!fs.existsSync(keysPath)) {
  fs.writeFileSync(keysPath, "[]", "utf8");
}

// Load keys
function loadKeys() {
  try {
    return JSON.parse(fs.readFileSync(keysPath, "utf8") || "[]");
  } catch (e) {
    return [];
  }
}

// Save keys
function saveKeys(arr) {
  fs.writeFileSync(keysPath, JSON.stringify(arr, null, 2), "utf8");
}

// Generate key format: RAJ_XXXXX999
function generateKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return "RAJ_" + s;
}

// API: Generate a new key (frontend calls this)
app.get("/generate", (req, res) => {
  res.json({ key: generateKey() });
});

// API: Save key with admin, time, expiry
app.post("/save", (req, res) => {
  const { key, admin, days } = req.body;

  if (!key) return res.status(400).json({ error: "Missing key" });

  const now = new Date();
  const expiry = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  const record = {
    key,
    admin: admin || "RAJ_X_ADMIN",
    created: now.toISOString(),
    expiry: expiry.toISOString(),
    used: false
  };

  const keys = loadKeys();
  keys.unshift(record);
  saveKeys(keys);

  res.json({ success: true, saved: record });
});

// Send saved keys to frontend
app.get("/keys.json", (req, res) => {
  res.json(loadKeys());
});

// Serve UI from public folder
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live on port", PORT));

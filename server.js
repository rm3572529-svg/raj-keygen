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

// Helper to load & save keys
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

// API: generate a new key
app.get("/generate", (req, res) => {
  try {
    const keys = loadKeys();
    // create an 8-char key like RAJ_ABC1
    const newKey = "RAJ_" + Math.random().toString(36).substring(2, 10).toUpperCase();
    keys.push(newKey);
    saveKeys(keys);
    return res.json({ key: newKey });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: "Could not generate key" });
  }
});

// serve static frontend (if you have public/index.html)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  // if index.html exists it will be served automatically by express.static
  res.sendFile(path.join(__dirname, "public", "index.html"), err => {
    if (err) {
      // fallback text if no frontend
      res.send("✅ Raj Keygen Server Working!");
    }
  });
});

// Start server (use Render port or fallback)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

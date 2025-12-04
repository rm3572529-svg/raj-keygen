const apiBase = "https://raj-keygen.onrender.com";

// Load saved keys
async function loadSavedKeys() {
  const box = document.getElementById("savedKeys");
  try {
    const res = await fetch(apiBase + "/keys.json");
    const data = await res.json();
    box.innerHTML = "";

    if (!data.length) {
      box.innerHTML = "<p>No saved keys found.</p>";
      return;
    }

    data.forEach(k => {
      box.innerHTML += `
        <div class="keyRow">
          <p><b>Key:</b> ${k.key}</p>
          <p><b>Admin:</b> ${k.admin}</p>
          <p><b>Created:</b> ${k.createdAt}</p>
          <p><b>Expires:</b> ${k.expiresAt}</p>
          <p><b>Used:</b> ${k.used}</p>
        </div><hr>
      `;
    });
  } catch (err) {
    box.innerHTML = "❌ Failed to load keys.";
  }
}

// Generate new key
async function generateKey() {
  const admin = document.getElementById("adminName").value;
  const days = document.getElementById("duration").value;

  const output = document.getElementById("keyBox");
  output.innerHTML = "Generating...";

  try {
    const res = await fetch(
      `${apiBase}/generate?admin=${admin}&days=${days}`
    );

    const data = await res.json();
    output.innerHTML = `<b>${data.key}</b>`;

    loadSavedKeys();
  } catch (err) {
    output.innerHTML = "❌ Error generating key.";
  }
}

// Auto-run when page opens
document.addEventListener("DOMContentLoaded", () => {
  loadSavedKeys();
  const btn = document.getElementById("generateBtn");
  btn.addEventListener("click", generateKey);
});

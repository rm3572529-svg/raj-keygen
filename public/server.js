const apiBase = "https://raj-keygen.onrender.com";

// Load saved keys automatically
async function loadSavedKeys() {
    const box = document.getElementById("savedKeys");

    try {
        const res = await fetch(apiBase + "/keys.json");
        const data = await res.json();

        if (!data.length) {
            box.innerHTML = "<p>No keys saved yet.</p>";
            return;
        }

        box.innerHTML = "";
        data.forEach(k => {
            box.innerHTML += `
                <div class="keyRow">
                    <p><b>Key:</b> ${k.key}</p>
                    <p><b>Admin:</b> ${k.admin}</p>
                    <p><b>Created:</b> ${k.createdAt}</p>
                    <p><b>Expires:</b> ${k.expiresAt}</p>
                    <p><b>Used:</b> ${k.used}</p>
                </div>
                <hr>
            `;
        });

    } catch (err) {
        box.innerHTML = "❌ Unable to load saved keys.";
    }
}

// Generate new key
async function generateKey() {
    const admin = document.getElementById("adminName").value;
    const days = document.getElementById("duration").value;
    const output = document.getElementById("keyBox");

    output.innerHTML = "Generating...";

    try {
        const res = await fetch(`${apiBase}/generate?admin=${admin}&days=${days}`);
        const data = await res.json();

        output.innerHTML = `<b>${data.key}</b>`;
        loadSavedKeys();

    } catch (err) {
        output.innerHTML = "❌ Error generating key.";
    }
}

// Make button work
document.addEventListener("DOMContentLoaded", () => {
    loadSavedKeys();
    document.getElementById("generateBtn").addEventListener("click", generateKey);
});

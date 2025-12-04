// API ENDPOINT
const API = "/generate";

// Load saved keys from server
async function loadSavedKeys() {
    try {
        const res = await fetch("/keys.json");
        const keys = await res.json();

        const box = document.getElementById("savedKeys");
        const status = document.getElementById("serverStatus");

        if (!keys.length) {
            status.textContent = "No keys saved yet.";
            return;
        }

        status.textContent = "Server Connected ✔";

        box.innerHTML = keys.map(k => `
            <div class="saved-item">
                <b>Key:</b> ${k.key}<br>
                <b>Admin:</b> ${k.admin}<br>
                <b>Created:</b> ${k.created}<br>
                <b>Expiry:</b> ${k.expiry}
            </div>
        `).join("");

    } catch (e) {
        document.getElementById("serverStatus").textContent = "Server unreachable ❌";
    }
}

// GENERATE KEY
async function generateKey() {
    const admin = document.getElementById("adminName").value;
    const days = parseInt(document.getElementById("duration").value);

    const res = await fetch(API);
    const data = await res.json();

    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    document.getElementById("outputKey").textContent = data.key;

    // Save key to backend
    await saveKeyToServer({
        key: data.key,
        admin: admin,
        created: now.toLocaleString(),
        expiry: expiry.toLocaleString()
    });

    loadSavedKeys();
}

// Save to backend
async function saveKeyToServer(obj) {
    await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
    });
}

// Load keys on page load
loadSavedKeys();

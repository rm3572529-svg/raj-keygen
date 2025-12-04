// public/script.js
// Works with your current index.html (onclick="generateKey()").
// Expects IDs: adminName, duration, outputKey, savedKeys, serverStatus

// helper to format ISO -> local string safely
function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
}

async function loadSavedKeys() {
  const serverStatus = document.getElementById("serverStatus");
  const savedKeys = document.getElementById("savedKeys");
  if (!savedKeys) return;

  serverStatus && (serverStatus.textContent = "Loading saved keys...");
  savedKeys.innerHTML = "";

  try {
    const res = await fetch("/keys.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const keys = await res.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      savedKeys.innerHTML = "<div class='no-keys'>No saved keys</div>";
      serverStatus && (serverStatus.textContent = "No saved keys");
      return;
    }

    // build list (newest first)
    const fragment = document.createDocumentFragment();
    keys.forEach(k => {
      const card = document.createElement("div");
      card.className = "key-card";
      const created = fmt(k.createdAt || "");
      const expires = fmt(k.expiresAt || "");
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="font-weight:700">${k.key}</div>
          <div style="font-size:12px;color:#aaa">${k.admin || ""}</div>
        </div>
        <div style="font-size:12px;color:#bbb">Created: ${created} • Expires: ${expires}</div>
      `;
      fragment.appendChild(card);
    });

    savedKeys.appendChild(fragment);
    serverStatus && (serverStatus.textContent = `Loaded ${keys.length} keys`);
  } catch (err) {
    savedKeys.innerHTML = `<div class="error">Could not load keys: ${err.message}</div>`;
    serverStatus && (serverStatus.textContent = "Server unreachable");
    console.error("loadSavedKeys error:", err);
  }
}

// Called by your button: onclick="generateKey()"
async function generateKey() {
  const adminInput = document.getElementById("adminName");
  const durationSelect = document.getElementById("duration");
  const output = document.getElementById("outputKey");
  const serverStatus = document.getElementById("serverStatus");

  const admin = (adminInput && adminInput.value) ? adminInput.value : "RAJ_X_ADMIN";
  const days = (durationSelect && durationSelect.value) ? durationSelect.value : "1";

  if (output) {
    output.textContent = "Generating…";
    output.style.opacity = "0.8";
  }
  serverStatus && (serverStatus.textContent = "Generating key...");

  try {
    const q = new URLSearchParams({ admin, days });
    const res = await fetch(`/generate?${q.toString()}`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    // show result
    if (output) {
      const created = fmt(data.createdAt);
      const expires = fmt(data.expiresAt);
      output.innerHTML = `<strong style="font-size:18px">${data.key}</strong>
        <div style="font-size:12px;color:#cfcfcf">Admin: ${data.admin} • Created: ${created} • Expires: ${expires}</div>`;
      output.style.opacity = "1";
    }

    serverStatus && (serverStatus.textContent = "Key generated successfully");
    // reload saved list
    await loadSavedKeys();
  } catch (err) {
    if (output) output.innerHTML = `<span style="color:crimson">Error: ${err.message}</span>`;
    serverStatus && (serverStatus.textContent = "Failed to generate");
    console.error("generateKey error:", err);
  }
}

// init on load
document.addEventListener("DOMContentLoaded", () => {
  loadSavedKeys().catch(e => console.error(e));
});

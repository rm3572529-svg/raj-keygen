// public/script.js
document.addEventListener("DOMContentLoaded", () => {
  const adminInput = document.querySelector("#adminName") || document.querySelector("input[name=admin]") || (() => {
    // create hidden fallback
    const i = document.createElement("input"); i.id = "adminName"; i.value = "RAJ_X_ADMIN"; document.body.appendChild(i); return i;
  })();
  const durationSelect = document.querySelector("#duration") || document.querySelector("select[name=duration]") || (() => {
    const s = document.createElement("select"); s.id = "duration"; [1,2,4,10,30,365].forEach(d => { const o = document.createElement("option"); o.value = d; o.textContent = `${d} Day${d>1?"s":""}`; s.appendChild(o); }); document.body.appendChild(s); return s;
  })();
  const generateBtn = document.querySelector("#generateBtn") || document.querySelector("button#generate") || (() => {
    const b = document.createElement("button"); b.id = "generateBtn"; b.textContent = "Generate Key"; document.body.appendChild(b); return b;
  })();
  const generatedBox = document.querySelector("#generatedKey") || (() => { const d = document.createElement("div"); d.id = "generatedKey"; document.body.appendChild(d); return d; })();
  const savedKeysContainer = document.querySelector("#savedKeys") || (() => { const c = document.createElement("div"); c.id = "savedKeys"; document.body.appendChild(c); return c; })();

  // Load existing keys and show them
  async function loadSavedKeys() {
    savedKeysContainer.innerHTML = "<em>Loading saved keys...</em>";
    try {
      const r = await fetch("/keys.json", { cache: "no-store" });
      const keys = await r.json();
      if (!Array.isArray(keys) || keys.length === 0) {
        savedKeysContainer.innerHTML = "<div class='no-keys'>No saved keys</div>";
        return;
      }
      // build table/list
      const list = document.createElement("div");
      list.className = "saved-list";
      keys.forEach(k => {
        const card = document.createElement("div");
        card.className = "key-card";
        const created = new Date(k.createdAt);
        const expires = new Date(k.expiresAt);
        card.innerHTML = `
          <div class="key-row"><strong>${k.key}</strong> <span class="badge">${k.admin || ""}</span></div>
          <div class="meta">Created: ${created.toLocaleString()} • Expires: ${expires.toLocaleString()}</div>
        `;
        list.appendChild(card);
      });
      savedKeysContainer.innerHTML = "";
      savedKeysContainer.appendChild(list);
    } catch (e) {
      savedKeysContainer.innerHTML = `<div class='error'>Could not load keys: ${e.message}</div>`;
    }
  }

  // Generate click
  generateBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    generateBtn.disabled = true;
    const admin = (adminInput.value || "RAJ_X_ADMIN").toString();
    const days = parseInt(durationSelect.value || "1", 10);

    generatedBox.textContent = "Generating…";
    try {
      const q = new URLSearchParams({ admin, days });
      const r = await fetch(`/generate?${q.toString()}`);
      if (!r.ok) throw new Error(`Server ${r.status}`);
      const data = await r.json();
      // show generated key
      generatedBox.innerHTML = `<div class="gen-success"><strong>${data.key}</strong><div class="small">Admin: ${data.admin} • Created: ${new Date(data.createdAt).toLocaleString()} • Expires: ${new Date(data.expiresAt).toLocaleString()}</div></div>`;
      // reload saved keys
      await loadSavedKeys();
    } catch (err) {
      generatedBox.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    } finally {
      generateBtn.disabled = false;
    }
  });

  // initial load
  loadSavedKeys();
});

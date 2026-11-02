const form = document.getElementById("resumeForm");
const statusBox = document.getElementById("status");
const recordsBox = document.getElementById("records");
const idInput = document.getElementById("resumeId");
const formHeading = document.getElementById("formHeading");
const saveBtn = document.getElementById("saveBtn");
const cancelEdit = document.getElementById("cancelEdit");

const fields = ["name", "role", "email", "phone", "location", "summary", "skills", "education", "projects", "linkedin", "github"];

function showStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function getPayload() {
  return Object.fromEntries(fields.map((id) => [id, document.getElementById(id).value.trim()]));
}

function resetForm() {
  form.reset();
  idInput.value = "";
  formHeading.textContent = "Create your resume";
  saveBtn.textContent = "Save resume";
  cancelEdit.hidden = true;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function renderRecords(records) {
  if (!records.length) {
    recordsBox.innerHTML = '<div class="empty-state">No resume records yet. Create your first resume using the form.</div>';
    return;
  }
  recordsBox.innerHTML = records.map((r) => `
    <article class="record-card">
      <div class="record-head"><h4>${escapeHtml(r.name)}</h4></div>
      <p class="record-role">${escapeHtml(r.role)}</p>
      <p class="record-meta">${escapeHtml(r.email)}${r.phone ? " · " + escapeHtml(r.phone) : ""}</p>
      ${r.location ? `<p class="record-meta">${escapeHtml(r.location)}</p>` : ""}
      ${r.summary ? `<p class="record-summary">${escapeHtml(r.summary)}</p>` : ""}
      ${r.skills?.length ? `<p class="record-skills"><strong>Skills:</strong> ${escapeHtml(r.skills.join(", "))}</p>` : ""}
      ${r.education ? `<p class="record-meta"><strong>Education:</strong> ${escapeHtml(r.education)}</p>` : ""}
      ${r.projects ? `<p class="record-meta"><strong>Projects:</strong> ${escapeHtml(r.projects)}</p>` : ""}
      <div class="record-actions">
        <button class="secondary-btn" type="button" data-edit="${escapeHtml(r.id)}">Edit</button>
        <button class="secondary-btn delete-btn" type="button" data-delete="${escapeHtml(r.id)}">Delete</button>
      </div>
    </article>`).join("");
}

async function loadRecords() {
  recordsBox.innerHTML = '<div class="empty-state">Loading resume records…</div>';
  try {
    const records = await request("/api/resume");
    renderRecords(records);
  } catch (error) {
    recordsBox.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}<br><br>Configure MONGODB_URI in Vercel or your local environment first.</div>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = idInput.value;
  showStatus(id ? "Updating resume…" : "Saving resume…");
  try {
    await request("/api/resume", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({ ...getPayload(), ...(id ? { id } : {}) })
    });
    showStatus(id ? "Resume updated successfully." : "Resume saved successfully.", "success");
    resetForm();
    await loadRecords();
  } catch (error) {
    showStatus(error.message, "error");
  }
});

recordsBox.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    try {
      const records = await request("/api/resume");
      const record = records.find((item) => item.id === editButton.dataset.edit);
      if (!record) throw new Error("Resume not found. Refresh and try again.");
      fields.forEach((field) => {
        const value = field === "skills" ? (record.skills || []).join(", ") : (record[field] || "");
        document.getElementById(field).value = value;
      });
      idInput.value = record.id;
      formHeading.textContent = "Update your resume";
      saveBtn.textContent = "Update resume";
      cancelEdit.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      showStatus("Editing selected resume.");
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  if (deleteButton) {
    if (!confirm("Delete this resume record permanently?")) return;
    try {
      await request(`/api/resume?id=${encodeURIComponent(deleteButton.dataset.delete)}`, { method: "DELETE" });
      showStatus("Resume deleted successfully.", "success");
      await loadRecords();
    } catch (error) {
      showStatus(error.message, "error");
    }
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetForm();
  showStatus("Form cleared.");
});
cancelEdit.addEventListener("click", () => {
  resetForm();
  showStatus("Edit cancelled.");
});
document.getElementById("refreshBtn").addEventListener("click", loadRecords);
loadRecords();
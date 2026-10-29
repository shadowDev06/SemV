const form = document.querySelector("#student-form");
const rows = document.querySelector("#student-rows");
const message = document.querySelector("#message");
const empty = document.querySelector("#empty");
const formTitle = document.querySelector("#form-title");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-button");
const searchInput = document.querySelector("#search");
const refreshButton = document.querySelector("#refresh");

let editingId = null;

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
  message.hidden = false;
}

function clearMessage() {
  message.textContent = "";
  message.hidden = true;
}

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = Array.isArray(payload.details)
      ? payload.details.map((item) => item.message).join("; ")
      : "";
    throw new Error(details || payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

function cell(value) {
  const td = document.createElement("td");
  td.textContent = value;
  return td;
}

function render(students) {
  rows.replaceChildren();
  empty.hidden = students.length > 0;

  for (const student of students) {
    const tr = document.createElement("tr");
    tr.append(
      cell(student.id),
      cell(student.name),
      cell(student.email),
      cell(student.course),
      cell(student.marks)
    );

    const actions = document.createElement("td");
    actions.className = "row-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "small";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => startEdit(student));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small danger";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteStudent(student));

    actions.append(edit, remove);
    tr.append(actions);
    rows.append(tr);
  }
}

async function loadStudents() {
  try {
    const params = new URLSearchParams();
    const term = searchInput.value.trim();

    if (term) {
      params.set("search", term);
    }

    const query = params.toString();
    const payload = await api(`/api/students${query ? `?${query}` : ""}`);
    render(payload.data);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function startEdit(student) {
  editingId = student.id;
  form.elements.name.value = student.name;
  form.elements.email.value = student.email;
  form.elements.course.value = student.course;
  form.elements.marks.value = student.marks;
  formTitle.textContent = `Edit student #${student.id}`;
  submitButton.textContent = "Save changes";
  cancelButton.hidden = false;
  clearMessage();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add a student";
  submitButton.textContent = "Add student";
  cancelButton.hidden = true;
}

async function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name}?`)) {
    return;
  }

  try {
    await api(`/api/students/${student.id}`, { method: "DELETE" });

    if (editingId === student.id) {
      resetForm();
    }

    await loadStudents();
    showMessage("Student deleted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  data.marks = Number(data.marks);

  const isEditing = editingId !== null;

  try {
    await api(isEditing ? `/api/students/${editingId}` : "/api/students", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(data)
    });

    resetForm();
    await loadStudents();
    showMessage(isEditing ? "Student updated." : "Student added.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  clearMessage();
});

refreshButton.addEventListener("click", () => {
  clearMessage();
  loadStudents();
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadStudents, 250);
});

loadStudents();

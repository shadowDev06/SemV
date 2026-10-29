const courseForm = document.querySelector("#course-form");
const courseRows = document.querySelector("#course-rows");
const coursesEmpty = document.querySelector("#courses-empty");
const studentForm = document.querySelector("#student-form");
const studentRows = document.querySelector("#student-rows");
const studentsEmpty = document.querySelector("#students-empty");
const message = document.querySelector("#message");
const formTitle = document.querySelector("#form-title");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-button");
const searchInput = document.querySelector("#search");
const refreshButton = document.querySelector("#refresh");
const refreshCollectionsButton = document.querySelector("#refresh-collections");
const collectionStats = document.querySelector("#collection-stats");
const collectionsDatabase = document.querySelector("#collections-database");

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

function cell(value, className) {
  const td = document.createElement("td");
  td.textContent = value;
  if (className) {
    td.className = className;
  }
  return td;
}

function courseLabel(course) {
  if (!course) {
    return "Unknown";
  }

  return `${course.code} \u2014 ${course.name}`;
}

function renderCollections(payload) {
  collectionsDatabase.textContent = payload.database;
  collectionStats.replaceChildren();

  if (payload.collections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No collections exist yet. Create a course or student to start.";
    collectionStats.append(empty);
    return;
  }

  for (const collection of payload.collections) {
    const stat = document.createElement("div");
    stat.className = "stat";

    const name = document.createElement("span");
    name.className = "stat-name";
    name.textContent = collection.name;

    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = collection.documents;

    const meta = document.createElement("span");
    meta.className = "stat-meta";
    meta.textContent = `${collection.documents === 1 ? "document" : "documents"} \u00b7 ${
      collection.indexes.length
    } indexes`;

    stat.append(name, value, meta);
    collectionStats.append(stat);
  }
}

async function loadCollections() {
  try {
    const payload = await api("/api/collections");
    renderCollections(payload);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderCourses(courses) {
  courseRows.replaceChildren();
  coursesEmpty.hidden = courses.length > 0;

  for (const course of courses) {
    const tr = document.createElement("tr");
    tr.append(
      cell(course.code),
      cell(course.name),
      cell(course.credits),
      cell(course.studentCount)
    );

    const actions = document.createElement("td");
    actions.className = "row-actions";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small danger";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteCourse(course));

    actions.append(remove);
    tr.append(actions);
    courseRows.append(tr);
  }

  const select = studentForm.elements.course;
  const selected = select.value;
  select.replaceChildren();

  if (courses.length === 0) {
    select.add(new Option("Add a course first", ""));
    submitButton.disabled = true;
  } else {
    select.add(new Option("Select a course", ""));

    for (const course of courses) {
      select.add(new Option(`${course.code} \u2014 ${course.name}`, course._id));
    }

    submitButton.disabled = false;

    if (selected && courses.some((course) => course._id === selected)) {
      select.value = selected;
    }
  }
}

async function loadCourses() {
  try {
    const payload = await api("/api/courses");
    renderCourses(payload.data);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderStudents(students) {
  studentRows.replaceChildren();
  studentsEmpty.hidden = students.length > 0;

  for (const student of students) {
    const tr = document.createElement("tr");

    const id = cell(student._id.slice(-6), "id-cell");
    id.title = student._id;

    tr.append(
      id,
      cell(student.name),
      cell(student.email),
      cell(courseLabel(student.course)),
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
    studentRows.append(tr);
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
    renderStudents(payload.data);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function startEdit(student) {
  editingId = student._id;
  studentForm.elements.name.value = student.name;
  studentForm.elements.email.value = student.email;
  studentForm.elements.course.value = student.course ? student.course._id : "";
  studentForm.elements.marks.value = student.marks;
  formTitle.textContent = `Edit ${student.name}`;
  submitButton.textContent = "Save changes";
  cancelButton.hidden = false;
  clearMessage();
  studentForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetForm() {
  editingId = null;
  studentForm.reset();
  formTitle.textContent = "Add a student";
  submitButton.textContent = "Add student";
  cancelButton.hidden = true;
}

async function deleteCourse(course) {
  if (!window.confirm(`Delete course ${course.code}?`)) {
    return;
  }

  try {
    await api(`/api/courses/${course._id}`, { method: "DELETE" });
    await Promise.all([loadCourses(), loadCollections()]);
    showMessage(`Course ${course.code} deleted.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name}?`)) {
    return;
  }

  try {
    await api(`/api/students/${student._id}`, { method: "DELETE" });

    if (editingId === student._id) {
      resetForm();
    }

    await Promise.all([loadStudents(), loadCourses(), loadCollections()]);
    showMessage("Student deleted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(courseForm).entries());
  data.credits = Number(data.credits);

  try {
    await api("/api/courses", {
      method: "POST",
      body: JSON.stringify(data)
    });

    courseForm.reset();
    courseForm.elements.credits.value = "4";
    await Promise.all([loadCourses(), loadCollections()]);
    showMessage(`Course ${data.code.toUpperCase()} added.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(studentForm).entries());
  data.marks = Number(data.marks);

  const isEditing = editingId !== null;

  try {
    await api(isEditing ? `/api/students/${editingId}` : "/api/students", {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(data)
    });

    resetForm();
    await Promise.all([loadStudents(), loadCourses(), loadCollections()]);
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

refreshCollectionsButton.addEventListener("click", () => {
  clearMessage();
  loadCollections();
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadStudents, 250);
});

Promise.all([loadCourses(), loadStudents(), loadCollections()]);

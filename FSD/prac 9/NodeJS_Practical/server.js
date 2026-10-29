const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

let students = [
  { id: 1, name: "Ali Sayyed", course: "Computer Engineering", marks: 88 },
  { id: 2, name: "Sara Khan", course: "Information Technology", marks: 92 },
  { id: 3, name: "Rahul Verma", course: "Computer Engineering", marks: 76 }
];
let nextId = 4;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Student Portal</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header>
    <h1>Student Portal</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/students">Students</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer>Express.js Practical 9</footer>
</body>
</html>`;
}

function studentRows(list) {
  return list
    .map(
      (student) => `<tr>
        <td>${student.id}</td>
        <td><a href="/students/${student.id}">${escapeHtml(student.name)}</a></td>
        <td>${escapeHtml(student.course)}</td>
        <td>${student.marks}</td>
      </tr>`
    )
    .join("");
}

app.get("/", (req, res) => {
  res.send(
    layout(
      "Home",
      `<section class="card">
        <h2>Welcome</h2>
        <p>This web application is built with the Express.js framework. It demonstrates routing,
        middleware, static file serving, form handling, and JSON APIs.</p>
        <p>Try the <a href="/students">student records</a> page or read the
        <a href="/about">about</a> page.</p>
      </section>`
    )
  );
});

app.get("/about", (req, res) => {
  res.send(
    layout(
      "About",
      `<section class="card">
        <h2>About this app</h2>
        <ul>
          <li><strong>Express.js</strong> on Node.js ${process.version}</li>
          <li>Routes for pages and a JSON API</li>
          <li>Custom request-logging middleware</li>
          <li>Static assets served from <code>public/</code></li>
          <li>Form submissions parsed with <code>express.urlencoded()</code></li>
        </ul>
      </section>`
    )
  );
});

app.get("/students", (req, res) => {
  const course = req.query.course;
  const list = course
    ? students.filter((s) => s.course.toLowerCase() === course.toLowerCase())
    : students;

  res.send(
    layout(
      "Students",
      `<section class="card">
        <h2>Student records ${course ? `(${escapeHtml(course)})` : ""}</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Course</th><th>Marks</th></tr>
          </thead>
          <tbody>${studentRows(list)}</tbody>
        </table>
        ${
          list.length === 0
            ? "<p>No students found for that course.</p>"
            : ""
        }
      </section>
      <section class="card">
        <h2>Add a student</h2>
        <form action="/students" method="POST">
          <label for="name">Name</label>
          <input id="name" name="name" required maxlength="60" />
          <label for="course">Course</label>
          <input id="course" name="course" required maxlength="60" />
          <label for="marks">Marks</label>
          <input id="marks" name="marks" type="number" min="0" max="100" required />
          <button type="submit">Add student</button>
        </form>
      </section>`
    )
  );
});

app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res
      .status(404)
      .send(layout("Not found", `<h2>Student ${id} not found</h2>`));
  }

  res.send(
    layout(
      "Student",
      `<section class="card">
        <h2>${escapeHtml(student.name)}</h2>
        <p><strong>ID:</strong> ${student.id}</p>
        <p><strong>Course:</strong> ${escapeHtml(student.course)}</p>
        <p><strong>Marks:</strong> ${student.marks}</p>
        <p><a href="/students">&larr; Back to all students</a></p>
      </section>`
    )
  );
});

app.post("/students", (req, res) => {
  const name = (req.body.name || "").trim();
  const course = (req.body.course || "").trim();
  const marks = Number(req.body.marks);

  if (!name || !course || Number.isNaN(marks)) {
    return res
      .status(400)
      .send(
        layout(
          "Invalid input",
          `<h2>Name, course and marks are required</h2>
           <p><a href="/students">Try again</a></p>`
        )
      );
  }

  students.push({ id: nextId++, name, course, marks });
  res.redirect("/students");
});

app.get("/api/students", (req, res) => {
  res.json(students);
});

app.get("/api/students/:id", (req, res) => {
  const student = students.find((s) => s.id === Number(req.params.id));

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

app.use((req, res) => {
  res
    .status(404)
    .send(
      layout(
        "Not found",
        `<h2>404 &mdash; Page not found</h2>
         <p>The route <code>${escapeHtml(req.originalUrl)}</code> does not exist.</p>
         <p><a href="/">Go home</a></p>`
      )
    );
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .send(layout("Server error", "<h2>500 &mdash; Internal server error</h2>"));
});

app.listen(PORT, () => {
  console.log(`Student Portal running at http://localhost:${PORT}`);
});

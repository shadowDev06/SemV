console.log("--- 1. Synchronous callback ---");

function calculate(a, b, operation) {
  console.log(`Applying operation to ${a} and ${b}...`);
  return operation(a, b);
}

const sum = calculate(10, 5, (x, y) => x + y);
console.log("Result:", sum);
console.log("Synchronous callback finished before this line");

console.log("\n--- 2. Asynchronous callback ---");

function fetchStudent(name, callback) {
  console.log(`Fetching data for ${name}...`);
  setTimeout(() => {
    callback({ name, course: "Computer Engineering", marks: 88 });
  }, 1000);
}

fetchStudent("Ali", (student) => {
  console.log("Student received:", student);
});
console.log("Request made; program continues while data loads");

console.log("\n--- 3. Error-first callback ---");

function divide(a, b, callback) {
  if (b === 0) {
    callback(new Error("Division by zero is not allowed"));
    return;
  }
  callback(null, a / b);
}

divide(10, 2, (err, result) => {
  if (err) {
    console.log("Error:", err.message);
    return;
  }
  console.log("10 / 2 =", result);
});

divide(10, 0, (err, result) => {
  if (err) {
    console.log("Error:", err.message);
    return;
  }
  console.log("10 / 0 =", result);
});

console.log("\n--- 4. Nested callbacks (callback hell) ---");

function getUser(id, callback) {
  setTimeout(() => callback({ id, name: "Ali" }), 300);
}

function getCourses(user, callback) {
  setTimeout(() => callback(["FSD", "DBMS", "OS"]), 300);
}

function getMarks(course, callback) {
  setTimeout(() => callback({ course, marks: 88 }), 300);
}

getUser(1, (user) => {
  getCourses(user, (courses) => {
    getMarks(courses[0], (result) => {
      console.log(
        `${user.name} scored ${result.marks} in ${result.course}`
      );
    });
  });
});
console.log("Nested callback chain started");

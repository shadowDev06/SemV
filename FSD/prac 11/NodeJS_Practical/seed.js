require("dotenv").config();

const mongoose = require("mongoose");
const { connectDatabase } = require("./config/database");
const { Course, Student } = require("./models");

const courses = [
  { code: "CS301", name: "Data Structures", credits: 4 },
  { code: "CS302", name: "Database Systems", credits: 4 },
  { code: "IT201", name: "Web Technologies", credits: 3 }
];

const students = [
  { name: "Ali Sayyed", email: "ali.sayyed@example.com", courseCode: "CS301", marks: 88 },
  { name: "Sara Khan", email: "sara.khan@example.com", courseCode: "CS302", marks: 92 },
  { name: "Rahul Verma", email: "rahul.verma@example.com", courseCode: "IT201", marks: 76 }
];

async function seed() {
  try {
    await connectDatabase();
    await Promise.all([Course.init(), Student.init()]);

    const courseByCode = new Map();

    for (const course of courses) {
      const document = await Course.findOneAndUpdate(
        { code: course.code },
        { $set: course },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );

      courseByCode.set(course.code, document);
      console.log(`Course ${document.code} is ready.`);
    }

    for (const student of students) {
      const course = courseByCode.get(student.courseCode);

      const document = await Student.findOneAndUpdate(
        { email: student.email },
        {
          $set: {
            name: student.name,
            email: student.email,
            course: course._id,
            marks: student.marks
          }
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );

      console.log(`Student ${document.name} is ready.`);
    }

    console.log("Seeding finished.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();

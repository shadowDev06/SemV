require("dotenv").config();

const { sequelize, Student } = require("./models");
const { describeError } = require("./utils/describeError");

const students = [
  { name: "Ali Sayyed", email: "ali.sayyed@example.com", course: "Computer Engineering", marks: 88 },
  { name: "Sara Khan", email: "sara.khan@example.com", course: "Information Technology", marks: 92 },
  { name: "Rahul Verma", email: "rahul.verma@example.com", course: "Computer Engineering", marks: 76 }
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    for (const student of students) {
      const existing = await Student.findOne({ where: { email: student.email } });

      if (existing) {
        console.log(`Skipped ${student.email} (already present)`);
        continue;
      }

      await Student.create(student);
      console.log(`Inserted ${student.name}`);
    }

    console.log("Seeding finished.");
  } catch (error) {
    console.error("Seeding failed:", describeError(error));
    console.error("Check that PostgreSQL is running and the DB_* values in .env are correct.");
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();

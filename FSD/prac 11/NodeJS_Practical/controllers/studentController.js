const mongoose = require("mongoose");
const { Course, Student } = require("../models");

const COURSE_FIELDS = { code: 1, name: 1, credits: 1 };

function isValidId(value) {
  return mongoose.isValidObjectId(value);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickFields(body) {
  const data = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase();
  if (body.course !== undefined) data.course = String(body.course).trim();
  if (body.marks !== undefined) {
    data.marks = body.marks === "" || body.marks === null ? null : Number(body.marks);
  }

  return data;
}

async function listStudents(req, res, next) {
  try {
    const filter = {};

    if (req.query.course) {
      if (!isValidId(req.query.course)) {
        return res.status(400).json({ error: "Course filter must be a valid id" });
      }

      filter.course = req.query.course;
    }

    if (req.query.search) {
      const term = new RegExp(escapeRegExp(req.query.search.trim()), "i");
      filter.$or = [{ name: term }, { email: term }];
    }

    const students = await Student.find(filter)
      .populate("course", COURSE_FIELDS)
      .sort({ name: 1 });

    res.json({ count: students.length, data: students });
  } catch (error) {
    next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Student id must be a valid MongoDB id" });
    }

    const student = await Student.findById(req.params.id).populate(
      "course",
      COURSE_FIELDS
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const data = pickFields(req.body);

    if (data.course !== undefined) {
      if (!isValidId(data.course)) {
        return res.status(400).json({ error: "Course must be a valid id" });
      }

      const course = await Course.findById(data.course);

      if (!course) {
        return res.status(400).json({ error: "Selected course does not exist" });
      }
    }

    const student = await Student.create(data);
    await student.populate("course", COURSE_FIELDS);

    res.status(201).json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Student id must be a valid MongoDB id" });
    }

    const data = pickFields(req.body);

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "Provide at least one of: name, email, course, marks" });
    }

    if (data.course !== undefined) {
      if (!isValidId(data.course)) {
        return res.status(400).json({ error: "Course must be a valid id" });
      }

      const course = await Course.findById(data.course);

      if (!course) {
        return res.status(400).json({ error: "Selected course does not exist" });
      }
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    Object.assign(student, data);
    await student.save();
    await student.populate("course", COURSE_FIELDS);

    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Student id must be a valid MongoDB id" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
};

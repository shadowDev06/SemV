const { Op } = require("sequelize");
const { Student } = require("../models");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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
    const where = {};

    if (req.query.course) {
      where.course = { [Op.iLike]: String(req.query.course).trim() };
    }

    if (req.query.search) {
      const term = `%${String(req.query.search).trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
        { course: { [Op.iLike]: term } }
      ];
    }

    const students = await Student.findAll({ where, order: [["id", "ASC"]] });
    res.json({ count: students.length, data: students });
  } catch (error) {
    next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Student id must be a positive integer" });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ error: `Student with id ${id} not found` });
    }

    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const data = pickFields(req.body);
    const student = await Student.create(data);
    res.status(201).json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Student id must be a positive integer" });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ error: `Student with id ${id} not found` });
    }

    const data = pickFields(req.body);

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "Provide at least one of: name, email, course, marks" });
    }

    await student.update(data);
    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Student id must be a positive integer" });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ error: `Student with id ${id} not found` });
    }

    await student.destroy();
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

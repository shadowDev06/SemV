const { Course, Student } = require("../models");

function pickFields(body) {
  const data = {};

  if (body.code !== undefined) data.code = String(body.code).trim();
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.credits !== undefined) data.credits = Number(body.credits);

  return data;
}

async function listCourses(req, res, next) {
  try {
    const courses = await Course.find().sort({ code: 1 });
    const counts = await Student.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]);
    const countByCourse = new Map(
      counts.map((item) => [String(item._id), item.count])
    );

    const data = courses.map((course) => ({
      ...course.toObject(),
      studentCount: countByCourse.get(String(course._id)) || 0
    }));

    res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const course = await Course.create(pickFields(req.body));
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const students = await Student.countDocuments({ course: course._id });

    if (students > 0) {
      return res.status(409).json({
        error: `Course ${course.code} is assigned to ${students} student(s) and cannot be deleted`
      });
    }

    await course.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCourses,
  createCourse,
  deleteCourse
};

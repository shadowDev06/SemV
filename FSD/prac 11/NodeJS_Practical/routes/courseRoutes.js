const express = require("express");
const controller = require("../controllers/courseController");

const router = express.Router();

router.route("/").get(controller.listCourses).post(controller.createCourse);

router.route("/:id").delete(controller.deleteCourse);

module.exports = router;

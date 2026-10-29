const express = require("express");
const controller = require("../controllers/taskController");

const router = express.Router();

router.route("/").get(controller.listTasks).post(controller.createTask);

router
  .route("/:id")
  .get(controller.getTask)
  .put(controller.updateTask)
  .patch(controller.updateTask)
  .delete(controller.deleteTask);

module.exports = router;

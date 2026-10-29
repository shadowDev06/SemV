const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9-]{2,10}$/,
        "Course code must be 2-10 letters, digits or hyphens"
      ]
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      minlength: [2, "Course name must be at least 2 characters"],
      maxlength: [80, "Course name cannot exceed 80 characters"]
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits cannot be less than 1"],
      max: [6, "Credits cannot be more than 6"],
      validate: {
        validator: Number.isInteger,
        message: "Credits must be a whole number"
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Course", courseSchema);

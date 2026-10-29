const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: { args: [2, 60], msg: "Name must be between 2 and 60 characters" }
      }
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: { msg: "This email is already registered" },
      validate: {
        isEmail: { msg: "Email must be a valid email address" }
      }
    },
    course: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Course cannot be empty" }
      }
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Marks cannot be less than 0" },
        max: { args: [100], msg: "Marks cannot be more than 100" }
      }
    }
  },
  {
    tableName: "students"
  }
);

module.exports = Student;

const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const Student = require("./student");

module.exports = {
  Sequelize,
  sequelize,
  Student
};

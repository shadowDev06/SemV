require("dotenv").config();

const { Sequelize } = require("sequelize");

const logging = process.env.DB_LOGGING === "true" ? console.log : false;

const options = {
  dialect: "postgres",
  logging,
  define: {
    timestamps: true
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(
      process.env.DB_NAME || "fsd_practical",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "postgres",
      {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        ...options
      }
    );

module.exports = sequelize;

// Appel de .env pour utiliser les variables d'environnement (npm install dotenv --save)
require("dotenv").config({ path: "./config/.env" });

const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_USER_PATH,
  database: "groupomaniadb",
}); 

module.exports.getDB = () => {
  return db;
};

const mysql = require('mysql2');

const dbConnect = {
  connectionLimit : 50,
  host: "localhost",
  user: "root",
  password: "deltakilo21",
  database: "audiobook"
}

const pool = mysql.createPool(dbConnect);

const query = (q) => new Promise((resolve,reject) => {
  pool.getConnection((err, connection) => {

    if(err) {
      console.log("[MySQL] database connection failure", err);
      reject(err);
    } else {
      // Use the connection
      connection.query(q, (err, result, fields) => {
        // And done with the connection.
        connection.release();

        if (err) reject(err);
        // console.log("MySQL DB Connected!")
        resolve(result);
      })
    }

  })
})

module.exports = {
    query
}
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }
  const token = event.headers.authorization;
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const id = verified.id;
    const admin = verified.admin;

  const connection = await mysql.createConnection(dbConfig);

  try {
    if (admin){
      const [rows] = await connection.execute('SELECT * FROM INTERNATIONAL_SHIPMENTS s JOIN WAREHOUSES w ON s.wid=w.wid');
    if (rows.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({success:true, order : rows }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No shipments found' }),
      };
    }
    } else {
      const [rows] = await connection.execute('SELECT * FROM INTERNATIONAL_SHIPMENTS s JOIN WAREHOUSES w ON s.wid=w.wid WHERE s.uid = ?', [id]);
    if (rows.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({success:true, order : rows }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No shipments found' }),
      };
    }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error logging in', error: error.message }),
    };
  } finally {
    await connection.end();
  }
} catch (e) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Invalid Token' }),
  };
}
};

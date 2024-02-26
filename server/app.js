const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "130507",
  database: process.env.DB_NAME || "goeventos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Log environment variables
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

// Create Express app
const app = express();

// Define paths to HTML files
const clientPath = path.join(__dirname, "../client/index.html");
const contactPath = path.join(__dirname, "../client/contact.html");
const succesfullyAddedPath = path.join(
  __dirname,
  "../client/succesfully-added.html"
);
const succesfullyAddedPhotoPath = path.join(__dirname, "../client/sended.webp");

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to serve the client-side HTML file
app.get("/", (req, res) => {
  res.sendFile(clientPath);
});

// Ruta para mostrar mensajes
app.get("/messages", async (req, res) => {
  try {
    // Consulta para obtener mensajes de la base de datos
    const messages = await queryAsync("SELECT * FROM messages");
    res.render("messages", { messages }); // Renderizar la página de mensajes
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

// Route to serve the contact HTML file
app.get("/contact", (req, res) => {
  res.sendFile(contactPath);
});

app.get("/sended.webp", (req, res) => {
  res.sendFile(succesfullyAddedPhotoPath);
});

// Route to handle form submission
app.post("/submit", async (req, res) => {
  const { firstname, lastname, email, contactnumber, message } = req.body;

  try {
    // Validate form data
    if (!firstname || !lastname || !email || !contactnumber || !message) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    // Execute SQL query to insert form data into the database
    const sql =
      "INSERT INTO messages (firstname, lastname, email, contactnumber, message) VALUES (?, ?, ?, ?, ?)";
    await queryAsync(sql, [firstname, lastname, email, contactnumber, message]);

    // Send success response
    res.status(201).sendFile(succesfullyAddedPath);
  } catch (error) {
    // Handle errors
    console.error("Error al agregar mensaje:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", detalle: error.message });
  }
});

// Function to execute SQL queries asynchronously
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

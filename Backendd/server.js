
import dotenv from "dotenv";
dotenv.config();

// ---- Imports ----------------------------------------------------------------
import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ---- __dirname in ESM -------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- App setup --------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "../pandaaa")));

// ---- Configs ----------------------------------------------------------------
// ---- Configs ----------------------------------------------------------------
const dbConfig = {
  host: "pandabytzs1-akshayasimhadri7101-d0b4.l.aivencloud.com",
  user: "avnadmin" ,
  password:process.env.DB_PASSWORD,
  database: "pandabytzs1",
  port: "15604"
  
};
const db = mysql.createPool(dbConfig); 
const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET not found in .env. Using fallback 'my_secret_key'");
}
console.log("Loaded DB host:", process.env.DB_HOST);

// ---- Auth middleware --------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] ;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
    if (err) return res.status(403)
    req.user = user;
    next();
  });
}

// ---- Routes -----------------------------------------------------------------

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Register
app.post("/register", async (req, res) => {
  const { name, email, password} = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    const [existing] = await conn.execute(
      "SELECT customer_id FROM customers WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.execute(
      "INSERT INTO customers (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword ||null]
    );

    res.json({ message: "Customer registered successfully" });
  } catch (err) {
    console.error("🔥 /register error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) await conn.end();
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    const [rows] = await conn.execute(
      "SELECT customer_id, email, password FROM customers WHERE email = ?",
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { customer_id: user.customer_id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("🔥 /login error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) await conn.end();
  }
});

// Place Order (Protected)
// Place order route
// Place Order (Protected)
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const customer_id = req.user.customer_id;  // ✅ from JWT
    const { phone, address, payment_method, utr_number } = req.body;

    if (!phone || !address || !payment_method || !utr_number) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await db.query(
      "INSERT INTO orders (customer_id, phone, address, payment_method, utr_number) VALUES (?, ?, ?, ?, ?)",
      [customer_id, phone, address, payment_method, utr_number]
    );

    res.status(201).json({ message: "Order placed successfully", order_id: result.insertId });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Server error while placing order" });
  }
});



// Get Orders (Protected)
// 📌 Get all orders for a logged-in customer
// Get Orders (Protected)
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const customer_id = req.user.customer_id;  // ✅ from JWT
    const [rows] = await db.query("SELECT * FROM orders WHERE customer_id = ?", [customer_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get Products
app.get("/products", async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("🔥 /products error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) await conn.end();
  }
});

// ---- Start server -----------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

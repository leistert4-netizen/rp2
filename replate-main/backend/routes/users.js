const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    organization_name,
    organization_type,
    address,
    email,
    password
  } = req.body;

  if (
    !organization_name ||
    !organization_type ||
    !address ||
    !email ||
    !password
  ) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  if (
    organization_type !== "FOODSERVICE" &&
    organization_type !== "RECIPIENT"
  ) {
    return res.status(400).json({
      error: "Organization type must be either FOODSERVICE or RECIPIENT."
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();

      return res.status(400).json({
        error: "Email is already in use."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the organization first.
    const [organizationResult] = await connection.query(
      `INSERT INTO organizations
        (organization_name, organization_type, address)
       VALUES (?, ?, ?)`,
      [organization_name, organization_type, address]
    );

    const organizationId = organizationResult.insertId;

    // Determine the user's role from the organization type.
    const role =
      organization_type === "FOODSERVICE"
        ? "FOOD_DONOR"
        : "RECIPIENT";

    // Create the user and associate it with the organization.
    await connection.query(
      `INSERT INTO users
        (organization_id, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [organizationId, email, hashedPassword, role]
    );

    await connection.commit();

    return res.status(201).json({
      message: "User registered successfully."
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Registration Error:", error);

    return res.status(500).json({
      error: "Internal server error."
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
    

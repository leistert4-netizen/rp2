const pool = require("../config/db");

async function findAvailable() {
  const [rows] = await pool.query(`
    SELECT
      d.donation_id,
      d.food_type,
      d.quantity,
      d.quantity_unit,
      d.pickup_address,
      d.pickup_date,
      d.pickup_time,
      d.claim_deadline,
      d.additional_information,
      d.status,
      o.organization_name
    FROM donations d
    JOIN organizations o
      ON d.organization_id = o.organization_id
    WHERE d.status = 'AVAILABLE'
    ORDER BY d.created_at DESC
  `);

  return rows;
}

async function insertDonation(donation) {
  const {
    organization_id,
    recipient_user_id,
    food_type,
    quantity,
    quantity_unit,
    pickup_address,
    pickup_date,
    pickup_time,
    claim_deadline,
    additional_information
  } = donation;

  const [result] = await pool.query(
    `
    INSERT INTO donations (
      organization_id,
      recipient_user_id,
      food_type,
      quantity,
      quantity_unit,
      pickup_address,
      pickup_date,
      pickup_time,
      claim_deadline,
      additional_information,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
    `,
    [
      organization_id,
      recipient_user_id || null,
      food_type,
      quantity,
      quantity_unit,
      pickup_address,
      pickup_date,
      pickup_time,
      claim_deadline,
      additional_information || null
    ]
  );

  return result.insertId;
}

async function updateDonation(donationId, updates) {
  const fields = [];
  const values = [];

  for (const [field, value] of Object.entries(updates)) {
    fields.push(`${field} = ?`);
    values.push(value);
  }

  if (fields.length === 0) {
    return 0;
  }

  values.push(donationId);

  const [result] = await pool.query(
    `
    UPDATE donations
    SET ${fields.join(", ")}
    WHERE donation_id = ?
    `,
    values
  );

  return result.affectedRows;
}

async function deleteDonation(donationId) {
  const [result] = await pool.query(
    `DELETE FROM donations WHERE donation_id = ?`,
    [donationId]
    );

  return result.affectedRows;

}
    

module.exports = {
  findAvailable,
  insertDonation,
  updateDonation,
  deleteDonation
};

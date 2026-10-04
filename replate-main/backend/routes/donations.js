const express = require("express");
const donationRepository = require("../repositories/donationRepository");

const router = express.Router();

/* GET /api/donations
 * Returns currently available donations.*/
router.get("/", async (req, res) => {
  try {
    const donations = await donationRepository.findAvailable();

    return res.json(donations);
  } catch (error) {
    /* Error - unable to retrieve donations */
    console.error("GET /api/donations failed:", error);

    return res.status(500).json({
      error: "Unable to retrieve donations."
    });
  }
});

/* POST /api/donations
 * Creates a new food donation.*/
router.post("/", async (req, res) => {
  try {
    const {
      food_type,
      quantity,
      quantity_unit,
      pickup_address,
      pickup_date,
      pickup_time,
      claim_deadline,
      additional_information
    } = req.body;

    // Check that all required fields were provided.
    if (
      !food_type ||
      quantity === undefined ||
      !quantity_unit ||
      !pickup_address ||
      !pickup_date ||
      !pickup_time ||
      !claim_deadline
    ) {
      return res.status(400).json({
        error: "Please complete all required donation fields."
      });
    }

    // Quantity must be a positive number.
    const numericQuantity = Number(quantity);

    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be a positive number."
      });
    }

    // Claim deadline must be a valid date/time in the future.
    const deadline = new Date(claim_deadline);

    if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      return res.status(400).json({
        error: "Claim deadline must be in the future."
      });
    }

    /*
     * organization_id is temporarily set to 1 for development.
     * Once authentication is added, this should come from the
     * logged-in user's organization.
     */
    const donationId = await donationRepository.insertDonation({
      organization_id: 1,
      recipient_user_id: null,
      food_type,
      quantity: numericQuantity,
      quantity_unit,
      pickup_address,
      pickup_date,
      pickup_time,
      claim_deadline,
      additional_information
    });

    return res.status(201).json({
      message: "Donation posted successfully.",
      donation_id: donationId
    });
  } catch (error) {
    /* Error - Unable to save donation */
    console.error("POST /api/donations failed:", error);

    return res.status(500).json({
      error: "Unable to save donation."
    });
  }
});

// Update Existing Donation Listing
router.put("/:id", async (req, res) => {
  try {
    const donationId = req.params.id;
    const {
      food_type,
      quantity,
      quantity_unit,
      pickup_address,
      pickup_date,
      pickup_time,
      claim_deadline,
      additional_information,
      status
    } = req.body;

    const updates = {};

    if (food_type !== undefined) {
      updates.food_type = food_type;
    }
    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);
      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({
          error: "Quantity must be a positive number."
        });
      }

      updates.quantity = numericQuantity;
    }

    if (quantity_unit !== undefined) {
      updates.quantity_unit = quantity_unit;
    }
    if (pickup_address !== undefined) {
      updates.pickup_address = pickup_address;
    }
    if (pickup_date !== undefined) {
      updates.pickup_date = pickup_date;
    }
    if (pickup_time !== undefined) {
      updates.pickup_time = pickup_time;
    }
    if (claim_deadline !== undefined) {
      const deadline = new Date(claim_deadline);

      if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
        return res.status(400).json({
          error: "Claim deadline must be in the future."
        });
      }

      updates.claim_deadline = claim_deadline;
    }

    if (additional_information !== undefined) {
      updates.additional_information = additional_information;
    }

    if (status !== undefined) {
      const validStatuses = ["AVAILABLE", "CLAIMED", "COMPLETED"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Status must be one of AVAILABLE, CLAIMED, or COMPLETED."
        });
      }

      updates.status = status;
    }

    // Do not run an empty update.
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No fields were provided to update."
      });
    }

    const result = await donationRepository.updateDonation(donationId, updates);

    if (result === 0) {
      return res.status(404).json({
        error: "Donation not found."
      });
    }

    return res.json({
      message: "Donation listing updated successfully."
    });
  } catch (error) {
    console.error("PUT /api/donations/:id failed:", error);

    return res.status(500).json({
      error: "Unable to update donation."
    });
  }
});

// Delete Existing Donation Listing
router.delete("/:id", async (req, res) => {
  try {
    const result = await donationRepository.deleteDonation(req.params.id);

    if (result === 0) {
      return res.status(404).json({
        error: "Donation listing not found."
      });
    }

    return res.json({
      message: "Donation listing deleted successfully."
    });
  } catch (error) {
    console.error("DELETE /api/donations/:id failed:", error);

    return res.status(500).json({
      error: "Database server error."
    });
  }
});

module.exports = router;

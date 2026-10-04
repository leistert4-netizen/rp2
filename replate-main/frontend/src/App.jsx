import { useEffect, useState } from "react";

function App() {
  const [form, setForm] = useState({
    food_type: "",
    quantity: "",
    quantity_unit: "",
    pickup_address: "",
    pickup_date: "",
    pickup_time: "",
    claim_deadline: "",
    additional_information: ""
  });

  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDonations = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/donations");

      if (!response.ok) {
        throw new Error("Unable to retrieve donations.");
      }

      const data = await response.json();
      setDonations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to post donation.");
      }

      setMessage(data.message);

      setForm({
        food_type: "",
        quantity: "",
        quantity_unit: "",
        pickup_address: "",
        pickup_date: "",
        pickup_time: "",
        claim_deadline: "",
        additional_information: ""
      });

      loadDonations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px" }}>
      <h1>Replate</h1>
      <p>Surplus Food Donation Management System</p>

      <hr />

      <h2>Post a Donation</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Food Type
          <br />
          <select
            name="food_type"
            value={form.food_type}
            onChange={handleChange}
          >
            <option value="">Select food type</option>
            <option value="Prepared Meals">Prepared Meals</option>
            <option value="Bakery Items">Bakery Items</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Packaged Food">Packaged Food</option>
          </select>
        </label>

        <br /><br />

        <label>
          Quantity
          <br />
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
          />
        </label>

        <br /><br />

        <label>
          Unit
          <br />
          <select
            name="quantity_unit"
            value={form.quantity_unit}
            onChange={handleChange}
          >
            <option value="">Select unit</option>
            <option value="servings">Servings</option>
            <option value="lbs">Pounds</option>
            <option value="boxes">Boxes</option>
            <option value="items">Items</option>
          </select>
        </label>

        <br /><br />

        <label>
          Pickup Address
          <br />
          <input
            type="text"
            name="pickup_address"
            value={form.pickup_address}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <label>
          Pickup Date
          <br />
          <input
            type="date"
            name="pickup_date"
            value={form.pickup_date}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <label>
          Pickup Time
          <br />
          <input
            type="time"
            name="pickup_time"
            value={form.pickup_time}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <label>
          Claim Deadline
          <br />
          <input
            type="datetime-local"
            name="claim_deadline"
            value={form.claim_deadline}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <label>
          Additional Information
          <br />
          <textarea
            name="additional_information"
            value={form.additional_information}
            onChange={handleChange}
          />
        </label>

        <br /><br />

        <button type="submit">Post Donation</button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ marginTop: "20px" }}>
          Error: {error}
        </p>
      )}

      <hr />

      <h2>Available Donations</h2>

      {donations.length === 0 ? (
        <p>No donations available.</p>
      ) : (
        donations.map((donation) => (
          <div
            key={donation.donation_id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px"
            }}
          >
            <strong>{donation.food_type}</strong>

            <p>
              Quantity: {donation.quantity} {donation.quantity_unit}
            </p>

            <p>
              Pickup: {donation.pickup_address}
            </p>

            <p>
              Status: {donation.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
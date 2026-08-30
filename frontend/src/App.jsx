import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8001";

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Prediction states
  const [predictions, setPredictions] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    product: "",
    status: "pending",
  });

  // Fetch deliveries
  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${API_URL}/deliveries`);

      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }

      const data = await response.json();

      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI predictions
  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/predictions`);

      if (!response.ok) {
        throw new Error("Failed to fetch AI predictions");
      }

      const data = await response.json();

      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Failed to fetch AI predictions:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchDeliveries();
    fetchPredictions();
  }, []);

  // Form input handler
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // Create delivery
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create delivery");
      }

      setForm({
        customer_name: "",
        address: "",
        product: "",
        status: "pending",
      });

      await fetchDeliveries();
      await fetchPredictions();

      alert("Delivery created successfully!");
    } catch (error) {
      console.error("Failed to create delivery:", error);
      alert("Could not create delivery");
    }
  };

  // Update delivery status
  const updateStatus = async (deliveryId, newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/deliveries/${deliveryId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchDeliveries();
      await fetchPredictions();

    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update delivery status");
    }
  };

  // Statistics
  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const processingCount = deliveries.filter(
    (delivery) => delivery.status === "processing"
  ).length;

  const deliveredCount = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

  const highRiskCount = predictions.filter(
    (prediction) => prediction.risk === "HIGH"
  ).length;

  const mediumRiskCount = predictions.filter(
    (prediction) => prediction.risk === "MEDIUM"
  ).length;

  const lowRiskCount = predictions.filter(
    (prediction) => prediction.risk === "LOW"
  ).length;

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>SmartDeliveryOps</h1>
          <p>Smart Delivery Management Dashboard</p>
        </div>

        <div className="api-status">
          <span></span>
          API Connected
        </div>
      </header>

      <main className="container">

        {/* Statistics */}
        <section className="stats">

          <div className="card">
            <h3>Total Deliveries</h3>
            <strong>{deliveries.length}</strong>
          </div>

          <div className="card">
            <h3>Pending</h3>
            <strong>{pendingCount}</strong>
          </div>

          <div className="card">
            <h3>Processing</h3>
            <strong>{processingCount}</strong>
          </div>

          <div className="card">
            <h3>Delivered</h3>
            <strong>{deliveredCount}</strong>
          </div>

        </section>

        {/* Main content */}
        <section className="content-grid">

          {/* Add Delivery */}
          <div className="panel">

            <h2>Add Delivery</h2>

            <form onSubmit={handleSubmit}>

              <label>Customer Name</label>

              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />

              <label>Address</label>

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter delivery address"
                required
              />

              <label>Product</label>

              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                placeholder="Enter product"
                required
              />

              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="out_for_delivery">
                  Out for Delivery
                </option>
                <option value="delivered">Delivered</option>
              </select>

              <button type="submit">
                Create Delivery
              </button>

            </form>

          </div>

          {/* Delivery List */}
          <div className="panel">

            <div className="panel-header">

              <h2>Delivery List</h2>

              <button
                className="refresh"
                onClick={() => {
                  fetchDeliveries();
                  fetchPredictions();
                }}
              >
                Refresh
              </button>

            </div>

            {loading ? (

              <p>Loading deliveries...</p>

            ) : deliveries.length === 0 ? (

              <p>No deliveries found.</p>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Product</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {deliveries.map((delivery) => (

                      <tr key={delivery.id}>

                        <td>{delivery.id}</td>

                        <td>{delivery.customer_name}</td>

                        <td>{delivery.address}</td>

                        <td>{delivery.product}</td>

                        <td>

                          <select
                            value={delivery.status}
                            onChange={(event) =>
                              updateStatus(
                                delivery.id,
                                event.target.value
                              )
                            }
                          >

                            <option value="pending">
                              Pending
                            </option>

                            <option value="processing">
                              Processing
                            </option>

                            <option value="out_for_delivery">
                              Out for Delivery
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                          </select>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

        {/* AI Risk Summary */}
        <section className="stats ai-stats">

          <div className="card">
            <h3>🤖 High Risk</h3>
            <strong>{highRiskCount}</strong>
          </div>

          <div className="card">
            <h3>⚠️ Medium Risk</h3>
            <strong>{mediumRiskCount}</strong>
          </div>

          <div className="card">
            <h3>✅ Low Risk</h3>
            <strong>{lowRiskCount}</strong>
          </div>

        </section>

        {/* AI Predictions */}
        <section className="panel ai-panel">

          <div className="panel-header">

            <div>
              <h2>🤖 AI Delivery Predictions</h2>

              <p>
                AI-based delivery risk analysis
              </p>
            </div>

            <button
              className="refresh"
              onClick={fetchPredictions}
            >
              Refresh AI
            </button>

          </div>

          {aiLoading ? (

            <p>Loading AI predictions...</p>

          ) : predictions.length === 0 ? (

            <p>No AI predictions available.</p>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Delay Probability</th>
                  </tr>

                </thead>

                <tbody>

                  {predictions.map((prediction) => (

                    <tr key={prediction.delivery_id}>

                      <td>
                        {prediction.delivery_id}
                      </td>

                      <td>
                        {prediction.customer_name}
                      </td>

                      <td>
                        {prediction.product}
                      </td>

                      <td>
                        {prediction.status}
                      </td>

                      <td>

                        <span
                          className={`risk ${prediction.risk.toLowerCase()}`}
                        >
                          {prediction.risk}
                        </span>

                      </td>

                      <td>

                        <strong>
                          {prediction.delay_probability}%
                        </strong>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;

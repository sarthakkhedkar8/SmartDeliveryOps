import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api";

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    product: "",
    status: "pending",
  });

  // ==============================
  // Fetch Deliveries
  // ==============================

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${API_URL}/deliveries`);

      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }

      const data = await response.json();

      setDeliveries(data.deliveries || []);
      setApiConnected(true);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Fetch AI Predictions
  // ==============================

  const fetchPredictions = async () => {
    try {
      setAiLoading(true);

      const response = await fetch(`${API_URL}/ai/predictions`);

      if (!response.ok) {
        throw new Error("Failed to fetch AI predictions");
      }

      const data = await response.json();

      setPredictions(data.predictions || []);
      setApiConnected(true);
    } catch (error) {
      console.error("Failed to fetch AI predictions:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // ==============================
  // Refresh Everything
  // ==============================

  const refreshAll = async () => {
    await Promise.all([
      fetchDeliveries(),
      fetchPredictions(),
    ]);
  };

  // ==============================
  // Initial Load
  // ==============================

  useEffect(() => {
    refreshAll();
  }, []);

  // ==============================
  // Form Handler
  // ==============================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // ==============================
  // Create Delivery
  // ==============================

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

      await refreshAll();

      alert("Delivery created successfully!");
    } catch (error) {
      console.error("Failed to create delivery:", error);
      alert("Could not create delivery");
    }
  };

  // ==============================
  // Update Delivery Status
  // ==============================

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

      await refreshAll();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update delivery status");
    }
  };

  // ==============================
  // Delivery Statistics
  // ==============================

  const totalCount = deliveries.length;

  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const processingCount = deliveries.filter(
    (delivery) => delivery.status === "processing"
  ).length;

  const outForDeliveryCount = deliveries.filter(
    (delivery) => delivery.status === "out_for_delivery"
  ).length;

  const deliveredCount = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

  // ==============================
  // AI Statistics
  // ==============================

  const highRiskCount = predictions.filter(
    (prediction) => prediction.risk === "HIGH"
  ).length;

  const mediumRiskCount = predictions.filter(
    (prediction) => prediction.risk === "MEDIUM"
  ).length;

  const lowRiskCount = predictions.filter(
    (prediction) => prediction.risk === "LOW"
  ).length;

  const averageDelayProbability =
    predictions.length > 0
      ? Math.round(
          predictions.reduce(
            (total, prediction) =>
              total + prediction.delay_probability,
            0
          ) / predictions.length
        )
      : 0;

  return (
    <div className="app">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="header">

        <div>
          <h1>SmartDeliveryOps</h1>

          <p>
            AI-Powered Smart Delivery Management Platform
          </p>
        </div>

        <div
          className={`api-status ${
            apiConnected ? "connected" : "disconnected"
          }`}
        >
          <span></span>

          {apiConnected
            ? "API Connected"
            : "API Disconnected"}
        </div>

      </header>

      <main className="container">

        {/* =========================================
            DELIVERY STATISTICS
        ========================================= */}

        <section className="stats">

          <div className="card">
            <h3>📦 Total Deliveries</h3>
            <strong>{totalCount}</strong>
          </div>

          <div className="card">
            <h3>⏳ Pending</h3>
            <strong>{pendingCount}</strong>
          </div>

          <div className="card">
            <h3>⚙️ Processing</h3>
            <strong>{processingCount}</strong>
          </div>

          <div className="card">
            <h3>🚚 Out for Delivery</h3>
            <strong>{outForDeliveryCount}</strong>
          </div>

          <div className="card">
            <h3>✅ Delivered</h3>
            <strong>{deliveredCount}</strong>
          </div>

        </section>

        {/* =========================================
            MAIN GRID
        ========================================= */}

        <section className="content-grid">

          {/* =======================================
              ADD DELIVERY
          ======================================= */}

          <div className="panel">

            <h2>➕ Add Delivery</h2>

            <p className="panel-description">
              Create a new delivery order
            </p>

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
                className={`status-select ${form.status}`}
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

              <button type="submit">
                Create Delivery
              </button>

            </form>

          </div>

          {/* =======================================
              DELIVERY LIST
          ======================================= */}

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>📋 Delivery List</h2>

                <p className="panel-description">
                  Manage and monitor delivery status
                </p>
              </div>

              <button
                className="refresh"
                onClick={refreshAll}
              >
                🔄 Refresh All
              </button>

            </div>

            {loading ? (

              <div className="loading">
                Loading deliveries...
              </div>

            ) : deliveries.length === 0 ? (

              <div className="empty">
                No deliveries found.
              </div>

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

                        <td>
                          <strong>#{delivery.id}</strong>
                        </td>

                        <td>
                          {delivery.customer_name}
                        </td>

                        <td>
                          {delivery.address}
                        </td>

                        <td>
                          {delivery.product}
                        </td>

                        <td>

                          <select
                            value={delivery.status}
                            onChange={(event) =>
                              updateStatus(
                                delivery.id,
                                event.target.value
                              )
                            }
                            className={`status-select ${delivery.status}`}
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

        {/* =========================================
            AI RISK SUMMARY
        ========================================= */}

        <section className="ai-section">

          <div className="section-title">

            <div>
              <h2>🤖 AI Risk Intelligence</h2>

              <p>
                Intelligent analysis of delivery delay risks
              </p>
            </div>

            <button
              className="refresh"
              onClick={fetchPredictions}
            >
              🔄 Refresh AI
            </button>

          </div>

          <div className="stats ai-stats">

            <div className="card risk-card high-card">
              <h3>🔴 High Risk</h3>
              <strong>{highRiskCount}</strong>
              <span>
                deliveries need attention
              </span>
            </div>

            <div className="card risk-card medium-card">
              <h3>🟡 Medium Risk</h3>
              <strong>{mediumRiskCount}</strong>
              <span>
                deliveries being monitored
              </span>
            </div>

            <div className="card risk-card low-card">
              <h3>🟢 Low Risk</h3>
              <strong>{lowRiskCount}</strong>
              <span>
                deliveries on track
              </span>
            </div>

            <div className="card risk-card">
              <h3>📊 Avg. Delay Probability</h3>
              <strong>{averageDelayProbability}%</strong>
              <span>
                across all deliveries
              </span>
            </div>

          </div>

        </section>

        {/* =========================================
            AI PREDICTIONS TABLE
        ========================================= */}

        <section className="panel ai-panel">

          <div className="panel-header">

            <div>
              <h2>🧠 AI Delivery Predictions</h2>

              <p className="panel-description">
                AI-based delivery risk and delay analysis
              </p>
            </div>

            <div className="ai-status">
              <span></span>
              AI Service
            </div>

          </div>

          {aiLoading ? (

            <div className="loading">
              🤖 AI is analyzing deliveries...
            </div>

          ) : predictions.length === 0 ? (

            <div className="empty">
              No AI predictions available.
            </div>

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
                        <strong>
                          #{prediction.delivery_id}
                        </strong>
                      </td>

                      <td>
                        {prediction.customer_name}
                      </td>

                      <td>
                        {prediction.product}
                      </td>

                      <td>
                        <span
                          className={`status-text ${prediction.status}`}
                        >
                          {prediction.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      <td>

                        <span
                          className={`risk ${prediction.risk.toLowerCase()}`}
                        >
                          {prediction.risk}
                        </span>

                      </td>

                      <td>

                        <div className="probability">

                          <div className="probability-bar">

                            <div
                              className={`probability-fill ${prediction.risk.toLowerCase()}`}
                              style={{
                                width: `${prediction.delay_probability}%`,
                              }}
                            ></div>

                          </div>

                          <strong>
                            {prediction.delay_probability}%
                          </strong>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="footer">

        <p>
          SmartDeliveryOps • AI-Powered Delivery Operations
        </p>

        <span>
          Local Microservices Architecture
        </span>

      </footer>

    </div>
  );
}

export default App;

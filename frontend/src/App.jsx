import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8001";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "out_for_delivery",
  "delivered",
];

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    product: "",
    status: "pending",
  });

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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

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
    } catch (error) {
      console.error("Failed to create delivery:", error);
      alert("Could not create delivery");
    }
  };

  const updateStatus = async (deliveryId, newStatus) => {
    setUpdatingId(deliveryId);

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
        throw new Error("Failed to update delivery status");
      }

      await fetchDeliveries();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update delivery status");
    } finally {
      setUpdatingId(null);
    }
  };

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

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="app">
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
            <h3>Out for Delivery</h3>
            <strong>{outForDeliveryCount}</strong>
          </div>

          <div className="card">
            <h3>Delivered</h3>
            <strong>{deliveredCount}</strong>
          </div>
        </section>

        <section className="content-grid">
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
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              <button type="submit">Create Delivery</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Delivery List</h2>

              <button className="refresh" onClick={fetchDeliveries}>
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
                            className={`status-select ${delivery.status}`}
                            value={delivery.status}
                            disabled={updatingId === delivery.id}
                            onChange={(event) =>
                              updateStatus(
                                delivery.id,
                                event.target.value
                              )
                            }
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
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
      </main>
    </div>
  );
}

export default App;

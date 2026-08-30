import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8001";

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    product: "",
    status: "pending",
  });

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${API_URL}/deliveries`);
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

  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const deliveredCount = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

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
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
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
                          <span className={`status ${delivery.status}`}>
                            {delivery.status}
                          </span>
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

import { useEffect, useMemo, useState } from "react";

const API_URL = "/api";

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [orchestration, setOrchestration] = useState([]);
  const [agents, setAgents] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    product: "",
    status: "pending",
  });

  const loadDashboard = async () => {
    try {
      setError("");

      const [deliveryResponse, predictionResponse] = await Promise.all([
        fetch(`${API_URL}/deliveries`),
        fetch(`${API_URL}/ai/predictions`),
      ]);

      if (!deliveryResponse.ok) {
        throw new Error("Unable to load deliveries");
      }

      const deliveryData = await deliveryResponse.json();
      setDeliveries(deliveryData.deliveries || []);

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        setPredictions(predictionData.predictions || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/system/health`);

      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch {
      setSystemHealth(null);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/ai/agents`
      );

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch {
      setAgents([]);
    }
  };

  const runAIOrchestration = async () => {
    setAiLoading(true);

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/ai/orchestrate`
      );

      if (!response.ok) {
        throw new Error("AI Orchestrator unavailable");
      }

      const data = await response.json();

      setOrchestration(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadAgents();
    loadSystemHealth();

    const healthTimer = setInterval(
      loadSystemHealth,
      15000
    );

    return () => clearInterval(healthTimer);
    loadSystemHealth();

    const healthTimer = setInterval(
      loadSystemHealth,
      15000
    );

    return () => clearInterval(healthTimer);
  }, []);

  const totalDeliveries = deliveries.length;

  const pending = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const delivered = deliveries.filter(
    (delivery) => delivery.status === "delivered"
  ).length;

  const highRisk = predictions.filter(
    (prediction) => prediction.risk === "HIGH"
  ).length;

  const mediumRisk = predictions.filter(
    (prediction) => prediction.risk === "MEDIUM"
  ).length;

  const lowRisk = predictions.filter(
    (prediction) => prediction.risk === "LOW"
  ).length;

  const avgDelayProbability = useMemo(() => {
    if (!predictions.length) return 0;

    const total = predictions.reduce(
      (sum, item) => sum + Number(item.delay_probability || 0),
      0
    );

    return Math.round(total / predictions.length);
  }, [predictions]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addDelivery = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/deliveries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create delivery");
      }

      setForm({
        customer_name: "",
        address: "",
        product: "",
        status: "pending",
      });

      await loadDashboard();
      await runAIOrchestration();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusClass = (status) => {
    if (status === "delivered") return "status delivered";
    if (status === "out_for_delivery") return "status out";
    if (status === "processing") return "status processing";
    return "status pending";
  };

  const riskClass = (risk) => {
    if (risk === "HIGH") return "risk high";
    if (risk === "MEDIUM") return "risk medium";
    return "risk low";
  };

  return (
    <div className="app">

      <header className="topbar">
        <div>
          <div className="brand">
            SmartDeliveryOps
          </div>

          <div className="subtitle">
            AI Delivery Control Center
          </div>
        </div>

        <div className="system-status">
          <span className="pulse"></span>
          AI SYSTEM ONLINE
        </div>
      </header>

      <main className="container">

        {error && (
          <div className="error">
            ⚠ {error}
          </div>
        )}

        <section className="hero">

          <div>
            <h1>
              Intelligent Delivery Operations
            </h1>

            <p>
              Five AI agents analyze deliveries,
              predict risk, recommend actions and
              use a local LLM for operational reasoning.
            </p>
          </div>

          <button
            className="ai-button"
            onClick={runAIOrchestration}
            disabled={aiLoading}
          >
            {aiLoading
              ? "AI ANALYZING..."
              : "▶ RUN AI ORCHESTRATOR"}
          </button>

        </section>


        <section className="panel system-health-panel">

          <div className="panel-header">

            <div>
              <h2>🩺 Kubernetes System Health</h2>
              <span>
                Live microservice health monitoring
              </span>
            </div>

            <div className={
              systemHealth?.overall_status === "healthy"
                ? "health-badge healthy"
                : systemHealth?.overall_status === "degraded"
                ? "health-badge degraded"
                : "health-badge critical"
            }>
              {systemHealth?.overall_status
                ? systemHealth.overall_status.toUpperCase()
                : "CHECKING"}
            </div>

          </div>

          <div className="health-grid">

            {systemHealth?.services
              ? Object.entries(systemHealth.services).map(
                  ([name, service]) => (

                    <div
                      className="health-card"
                      key={name}
                    >

                      <div className="health-name">
                        {name.replace("_", " ").toUpperCase()}
                      </div>

                      <div className={
                        service.status === "healthy"
                          ? "health-dot online"
                          : "health-dot offline"
                      }>
                      </div>

                      <strong>
                        {service.status.toUpperCase()}
                      </strong>

                      <small>
                        HTTP {service.http_status || 0}
                      </small>

                    </div>

                  )
                )
              : (
                <div className="health-loading">
                  Checking Kubernetes services...
                </div>
              )}

          </div>

          {systemHealth && (
            <div className="health-summary">
              Healthy services:
              {" "}
              <strong>
                {systemHealth.healthy_services}
              </strong>
              {" / "}
              {systemHealth.total_services}
            </div>
          )}

        </section>

        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div>
              <div className="stat-label">
                TOTAL DELIVERIES
              </div>
              <div className="stat-value">
                {totalDeliveries}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <div className="stat-label">
                PENDING
              </div>
              <div className="stat-value">
                {pending}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div>
              <div className="stat-label">
                DELIVERED
              </div>
              <div className="stat-value">
                {delivered}
              </div>
            </div>
          </div>

          <div className="stat-card danger-card">
            <div className="stat-icon">⚠</div>
            <div>
              <div className="stat-label">
                HIGH RISK
              </div>
              <div className="stat-value">
                {highRisk}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🧠</div>
            <div>
              <div className="stat-label">
                AVG DELAY RISK
              </div>
              <div className="stat-value">
                {avgDelayProbability}%
              </div>
            </div>
          </div>

        </section>

        <section className="grid-two">

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Delivery Monitoring</h2>
                <span>
                  Live delivery lifecycle
                </span>
              </div>
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
              <div className="delivery-list">

                {deliveries.map((delivery) => {

                  const prediction = predictions.find(
                    (item) =>
                      item.delivery_id === delivery.id
                  );

                  return (
                    <div
                      className="delivery-row"
                      key={delivery.id}
                    >

                      <div className="delivery-id">
                        #{delivery.id}
                      </div>

                      <div className="delivery-info">

                        <strong>
                          {delivery.customer_name}
                        </strong>

                        <span>
                          {delivery.product}
                        </span>

                        <small>
                          {delivery.address}
                        </small>

                      </div>

                      <div>
                        <span
                          className={statusClass(
                            delivery.status
                          )}
                        >
                          {delivery.status}
                        </span>
                      </div>

                      <div>
                        {prediction ? (
                          <span
                            className={riskClass(
                              prediction.risk
                            )}
                          >
                            {prediction.risk}
                            {" "}
                            {prediction.delay_probability}%
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>AI Risk Analysis</h2>
                <span>
                  Delay prediction intelligence
                </span>
              </div>
            </div>

            <div className="risk-summary">

              <div className="risk-box high">
                <strong>{highRisk}</strong>
                <span>HIGH RISK</span>
              </div>

              <div className="risk-box medium">
                <strong>{mediumRisk}</strong>
                <span>MEDIUM</span>
              </div>

              <div className="risk-box low">
                <strong>{lowRisk}</strong>
                <span>LOW RISK</span>
              </div>

            </div>

            <div className="prediction-list">

              {predictions.map((prediction) => (

                <div
                  className="prediction-row"
                  key={prediction.delivery_id}
                >

                  <div>
                    <strong>
                      #{prediction.delivery_id}
                    </strong>

                    <span>
                      {prediction.customer_name}
                    </span>
                  </div>

                  <div>
                    <span
                      className={riskClass(
                        prediction.risk
                      )}
                    >
                      {prediction.risk}
                    </span>
                  </div>

                  <div className="probability">
                    {prediction.delay_probability}%
                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

        <section className="panel orchestrator-panel">

          <div className="panel-header">

            <div>
              <h2>
                🤖 Agentic AI Orchestrator
              </h2>

              <span>
                Five autonomous agents working together
              </span>
            </div>

            <div className="llm-badge">
              LOCAL LLM · QWEN 2.5
            </div>

          </div>

          <div className="agent-flow">

            {agents.length > 0
              ? agents.map((agent, index) => (

                <div
                  className="agent-wrapper"
                  key={agent.id}
                >

                  <div className="agent-card">

                    <div className="agent-number">
                      {agent.id}
                    </div>

                    <div className="agent-icon">
                      {["👁️", "📊", "🗺️", "🛠️", "🔔"][index]}
                    </div>

                    <strong>
                      {agent.name}
                    </strong>

                    <span>
                      {agent.purpose}
                    </span>

                  </div>

                  {index < agents.length - 1 && (
                    <div className="arrow">
                      →
                    </div>
                  )}

                </div>

              ))
              : (
                <>
                  <div className="agent-card">
                    👁️ Monitoring Agent
                  </div>

                  <div className="arrow">→</div>

                  <div className="agent-card">
                    📊 Delay Prediction
                  </div>

                  <div className="arrow">→</div>

                  <div className="agent-card">
                    🗺️ Route Optimization
                  </div>

                  <div className="arrow">→</div>

                  <div className="agent-card">
                    🛠️ Incident Recovery
                  </div>

                  <div className="arrow">→</div>

                  <div className="agent-card">
                    🔔 Notification
                  </div>
                </>
              )}

          </div>

          <div className="llm-flow">

            <div className="flow-node">
              5 AI AGENTS
            </div>

            <div className="flow-line">
              ↓
            </div>

            <div className="flow-node llm">
              🧠 LOCAL LLM
              <small>qwen2.5:0.5b</small>
            </div>

            <div className="flow-line">
              ↓
            </div>

            <div className="flow-node decision">
              ⚡ OPERATIONAL DECISION
            </div>

          </div>

        </section>

        <section className="grid-two">

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>AI Operational Recommendations</h2>
                <span>
                  Decisions generated by the agentic system
                </span>
              </div>
            </div>

            {orchestration.length === 0 ? (

              <div className="ai-empty">

                <div className="big-ai">
                  🧠
                </div>

                <p>
                  Run the AI Orchestrator to generate
                  live operational recommendations.
                </p>

                <button
                  className="secondary-button"
                  onClick={runAIOrchestration}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? "Analyzing..."
                    : "Analyze Deliveries"}
                </button>

              </div>

            ) : (

              <div className="recommendations">

                {orchestration.map((item) => {

                  const decision =
                    item.agents
                      ?.notification_decision_agent
                      ?.decision || "NORMAL";

                  const reasoning =
                    item.local_llm?.reasoning ||
                    "No LLM reasoning available.";

                  return (
                    <div
                      className="recommendation"
                      key={item.delivery.delivery_id}
                    >

                      <div className="recommendation-top">

                        <strong>
                          Delivery #
                          {item.delivery.delivery_id}
                        </strong>

                        <span
                          className={
                            decision === "ESCALATE"
                              ? "decision escalate"
                              : decision === "MONITOR"
                              ? "decision monitor"
                              : "decision normal"
                          }
                        >
                          {decision}
                        </span>

                      </div>

                      <div className="recommendation-customer">
                        {item.delivery.customer_name}
                        {" · "}
                        {item.delivery.product}
                      </div>

                      <div className="reasoning">

                        <div className="reasoning-title">
                          🧠 Local LLM Reasoning
                        </div>

                        <pre>
                          {reasoning}
                        </pre>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Add Delivery</h2>
                <span>
                  Create a new delivery for AI analysis
                </span>
              </div>
            </div>

            <form
              className="delivery-form"
              onSubmit={addDelivery}
            >

              <input
                name="customer_name"
                placeholder="Customer name"
                value={form.customer_name}
                onChange={handleChange}
                required
              />

              <input
                name="address"
                placeholder="Delivery address"
                value={form.address}
                onChange={handleChange}
                required
              />

              <input
                name="product"
                placeholder="Product"
                value={form.product}
                onChange={handleChange}
                required
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="pending">
                  Pending
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="out_for_delivery">
                  Out for delivery
                </option>

                <option value="delivered">
                  Delivered
                </option>
              </select>

              <button
                type="submit"
                className="submit-button"
              >
                + Add Delivery
              </button>

            </form>

          </div>

        </section>

        <footer>

          <div>
            SmartDeliveryOps · Agentic AI Delivery Platform
          </div>

          <div>
            FastAPI · React · Kubernetes · Ollama
          </div>

        </footer>

      </main>

    </div>
  );
}

export default App;

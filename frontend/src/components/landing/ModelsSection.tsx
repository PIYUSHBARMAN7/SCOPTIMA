import TrendVisualization from "./TrendVisualization";
const models = [
  {
    number: "01",
    label: "SUPPLY CHAIN FORECASTING",
    model: "EXTRA TREES",
    metric: "86.28%",
    description: "WAPE-based forecast accuracy",
  },
  {
    number: "02",
    label: "RETAIL FORECASTING",
    model: "ELITE ENSEMBLE",
    metric: "94.63%",
    description: "WAPE-based forecast accuracy",
  },
  {
    number: "03",
    label: "LOGISTICS INTELLIGENCE",
    model: "CATBOOST",
    metric: "0.9978",
    description: "KPI estimator R²",
  },
];

export default function ModelsSection() {
  return (
    <section id="models" className="section models-section">
      <div className="section-label">
        <span>02 / MODELS</span>
      </div>

      <div className="models-header">
        <h2>
          BUILT FOR
          <br />
          <span>DECISIONS.</span>
        </h2>

        <p>
          Multiple machine learning architectures were evaluated and compared
          before selecting the strongest model for each supply chain task.
        </p>
      </div>

      <div className="model-grid">
        {models.map((item) => (
          <article className="model-card" key={item.label}>
            <div className="model-card-top">
              <span>{item.number}</span>
              <span>{item.label}</span>
            </div>
               
            <h3>{item.model}</h3>

            <div className="model-metric">{item.metric}</div>

            <p>{item.description}</p>

            <div className="model-line">
              <div />
            </div>
          </article>
        ))}
      </div>
      <TrendVisualization />
    </section>
  );
}
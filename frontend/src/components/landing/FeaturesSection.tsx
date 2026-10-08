import {
  BrainCircuit,
  Boxes,
  TriangleAlert,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: BrainCircuit,
    title: "DEMAND FORECASTING",
    text: "Predict future product demand using trained machine learning models and historical supply chain data.",
  },
  {
    number: "02",
    icon: Boxes,
    title: "INVENTORY OPTIMIZATION",
    text: "Calculate safety stock, optimized reorder points, recommended stock levels and excess inventory.",
  },
  {
    number: "03",
    icon: TriangleAlert,
    title: "STOCKOUT INTELLIGENCE",
    text: "Identify products at risk of stockout before inventory levels become critical.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="platform"
      className="section platform-section"
    >
      <div className="section-label">
        <span>01 / PLATFORM</span>
      </div>

      <div className="section-heading">
        <h2>
          PREDICT.
          <br />
          OPTIMIZE.
          <br />
          <span>DECIDE.</span>
        </h2>

        <p>
          One intelligence layer for forecasting,
          inventory planning and operational decisions.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              className="feature-card"
              key={feature.number}
            >
              <div className="feature-top">
                <span>{feature.number}</span>
                <Icon size={30} />
              </div>

              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
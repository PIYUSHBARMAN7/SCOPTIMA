const impactItems = [
  {
    value: "↓",
    title: "EXCESS STOCK",
    text: "Identify unnecessary inventory and capital tied up in warehouses.",
  },
  {
    value: "↓",
    title: "HOLDING COST",
    text: "Estimate cost savings from optimized inventory levels.",
  },
  {
    value: "↑",
    title: "AVAILABILITY",
    text: "Reduce stockout risk using intelligent reorder recommendations.",
  },
  {
    value: "↑",
    title: "DECISION SPEED",
    text: "Turn raw inventory data into actionable recommendations instantly.",
  },
];

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="section impact-section"
    >
      <div className="section-label">
        <span>03 / BUSINESS IMPACT</span>
      </div>

      <div className="impact-heading">
        <h2>
          LESS WASTE.
          <br />
          MORE CONTROL.
        </h2>
      </div>

      <div className="impact-grid">
        {impactItems.map((item) => (
          <article
            key={item.title}
            className="impact-item"
          >
            <div className="impact-arrow">
              {item.value}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
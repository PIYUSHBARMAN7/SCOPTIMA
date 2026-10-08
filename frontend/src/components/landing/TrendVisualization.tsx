import { motion } from "motion/react";

const trendData = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 96 },
  { day: "Thu", value: 86 },
  { day: "Fri", value: 70 },
  { day: "Sat", value: 92 },
];

export default function TrendVisualization() {
  return (
    <section className="trend-visualization">
      <div className="trend-header">
        <div>
          <span>FORECAST TREND / MODEL OUTPUT</span>

          <h3>
            WEEKLY DEMAND
            <br />
            <em>VISUALIZED.</em>
          </h3>
        </div>

        <p>
          Compact demand-trend visualization for landing-page presentation.
        </p>
      </div>

      <motion.div
        className="trend-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="trend-chart">
          {/* moving scan line */}

          <motion.div
            className="trend-scan-line"
            animate={{
              x: ["-10%", "110%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {trendData.map((item, index) => (
            <motion.div
              className="trend-bar-item"
              key={item.day}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
            >
              <div className="trend-bar-wrap">
                <motion.div
                  className="trend-bar"
                  initial={{
                    height: 0,
                  }}
                  whileInView={{
                    height: `${item.value}%`,
                  }}
                  whileHover={{
                    scaleX: 1.08,
                    y: -4,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.4,
                  }}
                  transition={{
                    height: {
                      duration: 1.2,
                      delay: index * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    scaleX: {
                      duration: 0.2,
                    },
                    y: {
                      duration: 0.2,
                    },
                  }}
                >
                  <motion.span
                    className="trend-bar-glow"
                    animate={{
                      opacity: [0.25, 0.8, 0.25],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.25,
                    }}
                  />

                  <span className="trend-value">
                    {item.value}
                  </span>
                </motion.div>
              </div>

              <span className="trend-label">
                {item.day}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
import { motion } from "motion/react";
import {
  Warehouse,
  Truck,
  Package,
  MapPin,
} from "lucide-react";

export default function LogisticsAnimation() {
  return (
    <div className="logistics-animation" aria-hidden="true">
      {/* ROUTE 1 */}
      <div className="logistics-route route-one">
        <div className="route-line" />

        <motion.div
          className="route-object"
          animate={{ x: [0, 220] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Truck size={18} />
        </motion.div>
      </div>

      {/* ROUTE 2 */}
      <div className="logistics-route route-two">
        <div className="route-line" />

        <motion.div
          className="route-object package-object"
          animate={{ x: [0, 170] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 1.5,
          }}
        >
          <Package size={17} />
        </motion.div>
      </div>

      {/* WAREHOUSE */}
      <motion.div
        className="logistics-node warehouse-node"
        animate={{
          y: [0, -6, 0],
          opacity: [0.75, 1, 0.75],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Warehouse size={22} />
      </motion.div>

      {/* DESTINATION */}
      <motion.div
        className="logistics-node destination-node"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MapPin size={22} />
      </motion.div>

      {/* SMALL NODE DOTS */}
      <span className="logistics-dot dot-one" />
      <span className="logistics-dot dot-two" />
      <span className="logistics-dot dot-three" />
      <span className="logistics-dot dot-four" />
    </div>
  );
}
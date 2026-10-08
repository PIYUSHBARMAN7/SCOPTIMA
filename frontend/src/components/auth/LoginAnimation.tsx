import { motion } from "motion/react";
import {
  BrainCircuit,
  Boxes,
  BarChart3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const orbitItems = [
  {
    icon: BrainCircuit,
    radius: 115,
    duration: 18,
    delay: 0,
    reverse: false,
  },
  {
    icon: Boxes,
    radius: 175,
    duration: 23,
    delay: -6,
    reverse: true,
  },
  {
    icon: BarChart3,
    radius: 235,
    duration: 28,
    delay: -10,
    reverse: false,
  },
  {
    icon: ShieldCheck,
    radius: 295,
    duration: 32,
    delay: -15,
    reverse: true,
  },
  {
    icon: TrendingUp,
    radius: 350,
    duration: 36,
    delay: -8,
    reverse: false,
  },
];

export default function LoginAnimation() {
  return (
    <div className="login-animation" aria-hidden="true">
      <div className="login-ripples">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.span
            key={index}
            className="login-ripple"
            style={{
              width: 180 + index * 90,
              height: 180 + index * 90,
            }}
            animate={{
              scale: [1, 0.94, 1],
              opacity: [0.16, 0.07, 0.16],
            }}
            transition={{
              duration: 4 + index * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.12,
            }}
          />
        ))}
      </div>

      <motion.div
        className="login-center-glow"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.2, 0.38, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {orbitItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={index}
            className="login-orbit"
            style={{
              width: item.radius * 2,
              height: item.radius * 2,
              marginLeft: -item.radius,
              marginTop: -item.radius,
            }}
            animate={{
              rotate: item.reverse ? -360 : 360,
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "linear",
              delay: item.delay,
            }}
          >
            <div className="login-orbit-icon">
              <Icon size={17} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
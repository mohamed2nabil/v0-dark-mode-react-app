"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

export function DynamicBackground({ children }: DynamicBackgroundProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dark Background (Default) */}
      <motion.div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://i.postimg.cc/SxwnykmF/dark.jpg')`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Light Background (Hover) */}
      <motion.div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://i.postimg.cc/SRDXq9KS/light.jpg')`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Dark Overlay for better readability */}
      <div className="fixed inset-0 bg-black/40" />

      {/* Content */}
      <div
        className="relative z-10 min-h-screen"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    </div>
  );
}

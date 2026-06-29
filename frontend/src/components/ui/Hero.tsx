"use client";

import RippleGrid from "./RippleGrid";
import { Shield, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      <RippleGrid
        gridColor="#10b981"
        rippleIntensity={0.06}
        gridSize={12}
        gridThickness={15}
        opacity={0.6}
        fadeDistance={1.4}
        vignetteStrength={2.5}
        glowIntensity={0.8}
        mouseInteraction={true}
        mouseInteractionRadius={1.1}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-border bg-card/50 glow-soft">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Enterprise LLM Guardrails
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-foreground">
          Sentinel AI
        </h1>

        <p className="mt-4 max-w-xl text-base md:text-lg text-muted-foreground">
          Real-time safety evaluation, guardrail enforcement, and risk
          scoring for every LLM your team ships.
        </p>
      </div>

      <button
        onClick={() =>
          document
            .getElementById("dashboard-section")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-10 z-10 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-xs">Scroll to dashboard</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}
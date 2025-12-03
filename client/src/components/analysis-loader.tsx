import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, Search, Database, Sparkles } from "lucide-react";

const steps = [
  { id: 1, label: "Ingesting Resume Data...", icon: Database },
  { id: 2, label: "Analyzing Upwork Profile Context...", icon: Search },
  { id: 3, label: "Cross-referencing LinkedIn Signals...", icon: BrainCircuit },
  { id: 4, label: "Identifying Market Blindspots...", icon: Sparkles },
  { id: 5, label: "Synthesizing Strategic Profile...", icon: CheckCircle2 },
];

interface AnalysisLoaderProps {
  onComplete: () => void;
}

export function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500); // 1.5s per step for effect
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-2xl shadow-lg" data-testid="analysis-loader">
      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-primary/10 mb-4 relative">
          <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
        </div>
        <h3 className="text-xl font-serif font-semibold text-foreground">
          Training Agent
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Building your comprehensive freelancer profile...
        </p>
      </div>

      <div className="space-y-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-border z-0" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10 flex items-center gap-4"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                  ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                  ${isActive ? "bg-card border-primary text-primary" : ""}
                  ${!isActive && !isCompleted ? "bg-card border-border text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="h-1 bg-primary/20 rounded-full mt-2 overflow-hidden"
                  >
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="h-full w-full bg-primary"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

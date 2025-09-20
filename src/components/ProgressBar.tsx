"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Custom height for the progress bar */
  height?: string;
  /** Color scheme for the progress bar */
  variant?: "primary" | "success" | "warning";
  /** Loading message to display */
  message?: string;
  /** Whether to animate the progress smoothly */
  animated?: boolean;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  height = "h-3",
  variant = "primary",
  message,
  animated = true
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const getColorClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-400";
      case "warning":
        return "bg-yellow-400";
      default:
        return "bg-[#517ec5]";
    }
  };

  const clampedProgress = Math.min(Math.max(displayProgress, 0), 100);

  return (
    <div className="w-full space-y-2">
      {message && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">{message}</span>
          {showPercentage && (
            <span className="text-sm text-white/60">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-white/20 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${getColorClasses()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        >
          {animated && (
            <div className="h-full bg-white bg-opacity-30 animate-pulse" />
          )}
        </div>
      </div>

      {!message && showPercentage && (
        <div className="text-center">
          <span className="text-sm text-white/60">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
}

interface LoadingProgressProps {
  /** Current step being processed */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Array of step descriptions */
  steps: string[];
  /** Whether loading is active */
  isLoading: boolean;
}

export function LoadingProgress({
  currentStep,
  totalSteps,
  steps,
  isLoading
}: LoadingProgressProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const currentStepMessage = currentStep > 0 && currentStep <= steps.length
    ? steps[currentStep - 1]
    : "Initializing...";

  if (!isLoading) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 p-8">
        <ProgressBar
          progress={progress}
          message={currentStepMessage}
          variant="primary"
          animated={true}
        />

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center space-x-4 text-sm ${
                  isCompleted
                    ? "text-green-300"
                    : isCurrent
                    ? "text-white font-semibold"
                    : "text-white/60"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCompleted
                      ? "bg-green-500/20 text-green-300 border-2 border-green-400/50"
                      : isCurrent
                      ? "bg-[#517ec5]/20 text-white border-2 border-[#517ec5]/60"
                      : "bg-white/10 text-white/60 border-2 border-white/30"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span className="flex-1">{step}</span>
                {isCurrent && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#517ec5]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
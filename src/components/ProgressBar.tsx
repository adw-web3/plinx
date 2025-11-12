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
  /** Additional progress message from the API */
  progressMessage?: string;
}

export function LoadingProgress({
  currentStep,
  steps,
  isLoading,
  progressMessage
}: LoadingProgressProps) {
  // Show when loading OR when there's a progress message (completion message)
  if (!isLoading && !progressMessage) {
    return null;
  }

  const allStepsComplete = currentStep === steps.length && !isLoading;

  return (
    <div className="w-full">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 p-3">
        <div className="space-y-1.5">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = allStepsComplete || stepNumber < currentStep;
            const isCurrent = !allStepsComplete && stepNumber === currentStep;

            // Calculate progress for current step based on progressMessage
            let stepProgress = 0;
            if (isCompleted) {
              stepProgress = 100;
            } else if (isCurrent && progressMessage) {
              // Try to extract numbers from progress message for step progress
              const numberMatch = progressMessage.match(/(\d+)\/(\d+)/);
              if (numberMatch) {
                const [, current, total] = numberMatch;
                stepProgress = Math.min(90, (parseInt(current) / parseInt(total)) * 100);
              } else if (progressMessage.includes('page')) {
                stepProgress = 50; // Arbitrary progress for pagination
              } else {
                stepProgress = 30; // Default progress for active step
              }
            }

            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCompleted
                      ? "bg-green-500/20 text-green-300 border border-green-400/50"
                      : isCurrent
                      ? "bg-[#517ec5]/20 text-white border border-[#517ec5]/60"
                      : "bg-white/10 text-white/60 border border-white/30"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs truncate ${
                      isCompleted ? "text-green-300" : isCurrent ? "text-white" : "text-white/60"
                    }`}>
                      {step}
                    </span>
                    <span className="text-xs text-white/60 font-mono flex-shrink-0">
                      {Math.round(stepProgress)}%
                    </span>
                    {isCurrent && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-[#517ec5] flex-shrink-0"></div>
                    )}
                  </div>
                  {isCurrent && progressMessage && progressMessage !== step && (
                    <div className="text-xs text-white/60 mt-0.5 truncate">
                      {progressMessage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show completion message when all steps are done */}
          {allStepsComplete && progressMessage && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center gap-2 text-green-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-semibold">{progressMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
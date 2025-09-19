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
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const clampedProgress = Math.min(Math.max(displayProgress, 0), 100);

  return (
    <div className="w-full space-y-2">
      {message && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{message}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
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
          <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProgressBar
          progress={progress}
          message={currentStepMessage}
          variant="primary"
          animated={true}
        />

        <div className="mt-4 space-y-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 text-sm ${
                  isCompleted
                    ? "text-green-600"
                    : isCurrent
                    ? "text-blue-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isCurrent
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <span>{step}</span>
                {isCurrent && (
                  <div className="flex-1 flex justify-end">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
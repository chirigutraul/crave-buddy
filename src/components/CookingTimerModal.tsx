import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { PreparationStep } from "@/types";

interface CookingTimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: PreparationStep[];
  recipeName: string;
}

export function CookingTimerModal({
  open,
  onOpenChange,
  steps,
  recipeName,
}: CookingTimerModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(steps[0]?.time || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const autoAdvancedRef = useRef(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Reset timer when step changes or modal opens
  useEffect(() => {
    if (currentStep) {
      setTimeRemaining(currentStep.time);

      // If we auto-advanced, start the timer automatically
      if (autoAdvancedRef.current) {
        setIsRunning(true);
        autoAdvancedRef.current = false;
      } else {
        setIsRunning(false);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [currentStepIndex, currentStep, open]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  // Auto-advance to next step when timer finishes
  useEffect(() => {
    if (autoAdvance && timeRemaining === 0 && !isRunning && !isLastStep) {
      // Small delay before advancing to next step
      const timeout = setTimeout(() => {
        autoAdvancedRef.current = true;
        setCurrentStepIndex(currentStepIndex + 1);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [autoAdvance, timeRemaining, isRunning, isLastStep, currentStepIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    currentStep && currentStep.time > 0
      ? ((currentStep.time - timeRemaining) / currentStep.time) * 100
      : 0;

  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className=" text-neutral-800">
            <h4>{recipeName}</h4>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step counter and auto-advance toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-advance"
                checked={autoAdvance}
                onCheckedChange={setAutoAdvance}
                className="cursor-pointer"
              />
              <Label
                htmlFor="auto-advance"
                className="text-sm font-medium text-neutral-700 cursor-pointer"
              >
                Auto-advance
              </Label>
            </div>
            <p className="text-sm text-neutral-500 font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#9ACD32"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 88 * (1 - progressPercentage / 100)
                  }`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Timer text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-neutral-800">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            {/* Progress percentage */}
            <p className="text-sm text-neutral-500 font-medium">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>

          {/* Current instruction */}
          <div className="bg-neutral-50 rounded-lg p-6">
            <p className="text-lg text-neutral-700 leading-relaxed text-center">
              {currentStep.instruction}
            </p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Previous button (shown on steps after the first) */}
            {!isFirstStep && (
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                className="gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </Button>
            )}

            {/* Start button (shown only on first step) */}
            {isFirstStep && !isRunning && (
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-[#9ACD32] hover:bg-[#8AB622] text-white gap-2 min-w-[120px]"
              >
                <Play className="h-5 w-5" />
                Start
              </Button>
            )}

            {/* Stop button */}
            {!isFirstStep && (
              <Button
                variant="outline"
                size="lg"
                onClick={isRunning ? handleStop : handleStart}
                disabled={!isRunning && timeRemaining === 0}
                className={`gap-2 min-w-[120px] ${
                  !isRunning && timeRemaining > 0
                    ? "bg-[#9ACD32] hover:bg-[#8AB622] text-white"
                    : ""
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start
                  </>
                )}
              </Button>
            )}

            {/* For first step, show stop button when running */}
            {isFirstStep && isRunning && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleStop}
                className="gap-2 min-w-[120px]"
              >
                <Pause className="h-5 w-5" />
                Stop
              </Button>
            )}

            {/* Next button */}
            {!isLastStep && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Finish button on last step */}
            {isLastStep && (
              <Button
                size="lg"
                onClick={() => onOpenChange(false)}
                className="bg-[#9ACD32] hover:bg-[#8AB622] text-white gap-2"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

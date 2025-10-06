import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  done: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
}

export function Stepper({ steps, currentStepId, onStepClick }: StepperProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isClickable = !!onStepClick;

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-all",
              isActive && "bg-accent",
              isClickable && "cursor-pointer hover:bg-accent/50"
            )}
            onClick={() => onStepClick?.(step.id)}
          >
            <div
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                step.done
                  ? "bg-success text-success-foreground"
                  : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.done ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.done && "line-through text-muted-foreground"
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

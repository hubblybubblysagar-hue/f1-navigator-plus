import { useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrivacyFooter() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Your data stays private.</span>{" "}
              This tool provides guided automation and reminders. It is not legal advice.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

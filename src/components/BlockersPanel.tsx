import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Blocker } from "@/types";
import { AlertTriangle, FileText, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BlockersPanelProps {
  blockers: Blocker[];
  onResolve?: (blockerId: string) => void;
}

const blockerIcons = {
  doc: FileText,
  date: Calendar,
  eligibility: Info
};

export function BlockersPanel({ blockers, onResolve }: BlockersPanelProps) {
  const navigate = useNavigate();

  if (blockers.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-warning/5 border-warning/20">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Blockers ({blockers.length})</h4>
          <p className="text-xs text-muted-foreground">Issues that need attention</p>
        </div>
      </div>
      <div className="space-y-2">
        {blockers.map((blocker) => {
          const Icon = blockerIcons[blocker.kind];
          return (
            <div key={blocker.id} className="flex items-start gap-2 p-2 bg-background rounded-md">
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{blocker.label}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (blocker.stepId) {
                    navigate(`/milestone/${blocker.milestoneId}#step-${blocker.stepId}`);
                  } else if (blocker.kind === 'doc') {
                    navigate(`/documents?milestone=${blocker.milestoneId}`);
                  } else {
                    navigate(`/milestone/${blocker.milestoneId}`);
                  }
                }}
              >
                Fix
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

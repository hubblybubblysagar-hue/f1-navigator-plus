import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NextAction } from "@/types";
import { Upload, FileText, CheckSquare, Package, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NextActionsBarProps {
  actions: NextAction[];
  onAction: (action: NextAction) => void;
}

const iconMap = {
  Upload,
  FileText,
  CheckSquare,
  Package,
  Calendar,
  AlertCircle
};

export function NextActionsBar({ actions, onAction }: NextActionsBarProps) {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return (
      <Card className="p-4 mb-6 border-l-4 border-l-success bg-success/5">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-success" />
          <div>
            <h3 className="font-semibold">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground">No urgent actions needed right now.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 border-l-4 border-l-primary">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-3">Next 3 Actions</h3>
          <div className="space-y-2">
            {actions.map((action) => {
              const IconComponent = iconMap[action.icon as keyof typeof iconMap] || CheckSquare;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => onAction(action)}
                >
                  <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="flex-1">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

import { useState } from "react";
import { ActivityEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  Calendar,
  MessageSquare,
  CalendarCheck,
  ChevronDown,
  Plus,
  FileUp,
  CalendarPlus,
  StickyNote,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

interface InlineActivityProps {
  activities: ActivityEntry[];
  milestoneId: string;
  onAddNote?: () => void;
  onUploadDoc?: () => void;
  onBookAppointment?: () => void;
  onCreateReminder?: () => void;
}

const activityIcons = {
  step_completed: CheckCircle2,
  doc_uploaded: Upload,
  status_change: AlertCircle,
  deadline_created: Calendar,
  appointment_booked: CalendarCheck,
  note_added: MessageSquare,
};

const activityColors = {
  step_completed: "text-green-500",
  doc_uploaded: "text-blue-500",
  status_change: "text-orange-500",
  deadline_created: "text-purple-500",
  appointment_booked: "text-cyan-500",
  note_added: "text-gray-500",
};

export function InlineActivity({
  activities,
  milestoneId,
  onAddNote,
  onUploadDoc,
  onBookAppointment,
  onCreateReminder,
}: InlineActivityProps) {
  const [isOpen, setIsOpen] = useState(false);

  const milestoneActivities = activities
    .filter((a) => a.milestoneId === milestoneId)
    .slice(0, 3);

  const lastActivity = milestoneActivities[0];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastActivity && (
            <>
              <span>
                Last updated {formatDistanceToNow(parseISO(lastActivity.createdAt), { addSuffix: true })}
              </span>
              {milestoneActivities.length > 1 && (
                <>
                  <span>•</span>
                  <span>{milestoneActivities.length} recent activities</span>
                </>
              )}
            </>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            Recent activity
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-4 space-y-3">
        {/* Activity List */}
        <div className="space-y-2">
          {milestoneActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const color = activityColors[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-2 text-sm">
                <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(activity.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-3 bg-accent">
          <p className="text-xs font-semibold mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {onAddNote && (
              <Button variant="outline" size="sm" onClick={onAddNote} className="gap-2">
                <StickyNote className="h-3 w-3" />
                Add Note
              </Button>
            )}
            {onUploadDoc && (
              <Button variant="outline" size="sm" onClick={onUploadDoc} className="gap-2">
                <FileUp className="h-3 w-3" />
                Upload Doc
              </Button>
            )}
            {onBookAppointment && (
              <Button variant="outline" size="sm" onClick={onBookAppointment} className="gap-2">
                <CalendarPlus className="h-3 w-3" />
                Book Appt
              </Button>
            )}
            {onCreateReminder && (
              <Button variant="outline" size="sm" onClick={onCreateReminder} className="gap-2">
                <Plus className="h-3 w-3" />
                Reminder
              </Button>
            )}
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

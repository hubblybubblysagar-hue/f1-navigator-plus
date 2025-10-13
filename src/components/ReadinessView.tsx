import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Milestone, StoredDoc, Profile } from "@/types";
import { CheckCircle2, XCircle, FileText, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadinessViewProps {
  milestone: Milestone;
  documents: StoredDoc[];
  profile: Profile | null;
  onAction?: (action: string) => void;
}

interface Requirement {
  id: string;
  label: string;
  satisfied: boolean;
  docId?: string;
}

export function ReadinessView({ milestone, documents, profile, onAction }: ReadinessViewProps) {
  // Generate requirements based on milestone type
  const getRequirements = (): Requirement[] => {
    const reqs: Requirement[] = [];
    const milestoneDocsAll = documents.filter(d => d.milestoneId === milestone.id);
    const allDocs = documents;

    switch (milestone.kind) {
      case 'SSN':
        reqs.push({
          id: 'i20',
          label: 'Valid I-20 with recent date',
          satisfied: milestoneDocsAll.some(d => d.category === 'I-20'),
          docId: milestoneDocsAll.find(d => d.category === 'I-20')?.id
        });
        reqs.push({
          id: 'passport',
          label: 'Passport with F-1 visa stamp',
          satisfied: allDocs.some(d => d.category === 'Passport'),
          docId: allDocs.find(d => d.category === 'Passport')?.id
        });
        reqs.push({
          id: 'job-offer',
          label: 'Employment authorization letter',
          satisfied: milestoneDocsAll.some(d => d.category === 'Job Offer'),
          docId: milestoneDocsAll.find(d => d.category === 'Job Offer')?.id
        });
        reqs.push({
          id: '10-day-rule',
          label: 'In US for at least 10 days',
          satisfied: milestone.progress > 0
        });
        break;

      case 'OPT':
        reqs.push({
          id: 'i20-dso',
          label: 'I-20 with DSO recommendation',
          satisfied: milestoneDocsAll.some(d => d.category === 'I-20'),
          docId: milestoneDocsAll.find(d => d.category === 'I-20')?.id
        });
        reqs.push({
          id: 'passport-valid',
          label: 'Passport valid for 6+ months',
          satisfied: profile?.passportExpiry ? 
            new Date(profile.passportExpiry).getTime() > Date.now() + (6 * 30 * 24 * 60 * 60 * 1000) : 
            false
        });
        reqs.push({
          id: 'application-window',
          label: 'Within OPT application window',
          satisfied: milestone.status === 'active'
        });
        reqs.push({
          id: 'fee-payment',
          label: '$410 USCIS fee ready',
          satisfied: milestone.steps.some(s => s.title.includes('fee') && s.done)
        });
        break;

      case 'CPT':
        reqs.push({
          id: 'job-offer',
          label: 'Job offer letter from employer',
          satisfied: milestoneDocsAll.some(d => d.category === 'Job Offer'),
          docId: milestoneDocsAll.find(d => d.category === 'Job Offer')?.id
        });
        reqs.push({
          id: 'full-time-enrollment',
          label: 'Full-time enrollment for 1+ year',
          satisfied: profile?.degreeStart ? 
            new Date().getTime() - new Date(profile.degreeStart).getTime() > (365 * 24 * 60 * 60 * 1000) :
            false
        });
        reqs.push({
          id: 'dso-approval',
          label: 'DSO approval received',
          satisfied: milestone.steps.some(s => s.title.includes('DSO') && s.done)
        });
        break;

      case 'TRAVEL':
        reqs.push({
          id: 'valid-passport',
          label: 'Valid passport',
          satisfied: profile?.passportExpiry ? new Date(profile.passportExpiry) > new Date() : false
        });
        reqs.push({
          id: 'travel-signature',
          label: 'I-20 travel signature (< 1 year old)',
          satisfied: milestone.steps.some(s => s.title.includes('signature') && s.done)
        });
        reqs.push({
          id: 'valid-visa',
          label: 'Valid F-1 visa stamp',
          satisfied: allDocs.some(d => d.category === 'Visa')
        });
        break;

      default:
        milestone.steps.forEach(step => {
          reqs.push({
            id: step.id,
            label: step.title,
            satisfied: step.done
          });
        });
    }

    return reqs;
  };

  const requirements = getRequirements();
  const satisfiedCount = requirements.filter(r => r.satisfied).length;
  const readinessPercent = Math.round((satisfiedCount / requirements.length) * 100);

  // Appointment readiness logic
  const getAppointmentReadiness = () => {
    if (milestone.kind === 'SSN') {
      const hasAllDocs = requirements.filter(r => r.id !== '10-day-rule').every(r => r.satisfied);
      const has10Days = requirements.find(r => r.id === '10-day-rule')?.satisfied;

      if (hasAllDocs && has10Days) {
        return {
          ready: true,
          message: "You're ready to book your SSA appointment!",
          action: "Book Appointment"
        };
      } else if (hasAllDocs && !has10Days) {
        return {
          ready: false,
          message: "Almost ready! Please wait until you've been in the US for 10 days.",
          action: null
        };
      } else {
        return {
          ready: false,
          message: "Complete all requirements before booking.",
          action: null
        };
      }
    }

    if (milestone.kind === 'OPT') {
      if (readinessPercent === 100) {
        return {
          ready: true,
          message: "All requirements met. You can submit your I-765 application.",
          action: "Submit Application"
        };
      } else {
        return {
          ready: false,
          message: `${satisfiedCount}/${requirements.length} requirements met. Complete remaining items first.`,
          action: null
        };
      }
    }

    return null;
  };

  const appointmentReadiness = getAppointmentReadiness();

  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Overall Readiness</h3>
            <p className="text-sm text-muted-foreground">
              {satisfiedCount} of {requirements.length} requirements met
            </p>
          </div>
          <div className="text-3xl font-bold text-primary">{readinessPercent}%</div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
      </Card>

      {/* Requirements Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Requirements Checklist</h3>
        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                req.satisfied ? "bg-success/5" : "bg-secondary"
              )}
            >
              {req.satisfied ? (
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={cn("text-sm font-medium", req.satisfied && "text-success")}>
                  {req.label}
                </p>
                {req.docId && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Satisfied by document
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Documents Audit */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Documents Audit</h3>
        {documents.filter(d => d.milestoneId === milestone.id).length > 0 ? (
          <div className="space-y-2">
            {documents.filter(d => d.milestoneId === milestone.id).map((doc) => {
              const satisfiesReq = requirements.find(r => r.docId === doc.id);
              return (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.category}</p>
                  </div>
                  {satisfiesReq && (
                    <Badge variant="success" className="text-xs">
                      Satisfies: {satisfiesReq.label}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No documents uploaded yet</p>
            <Button variant="outline" className="mt-3" onClick={() => onAction?.('upload')}>
              Upload Document
            </Button>
          </div>
        )}
      </Card>

      {/* Appointment Readiness */}
      {appointmentReadiness && (
        <Card className={cn(
          "p-6",
          appointmentReadiness.ready ? "bg-success/5 border-success" : "bg-secondary"
        )}>
          <div className="flex items-start gap-4">
            {appointmentReadiness.ready ? (
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Appointment Readiness</h3>
              <p className="text-sm mb-4">{appointmentReadiness.message}</p>
              {appointmentReadiness.action && (
                <Button onClick={() => onAction?.(appointmentReadiness.action || '')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {appointmentReadiness.action}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

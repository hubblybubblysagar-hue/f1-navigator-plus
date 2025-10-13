import { Milestone, RiskLevel, Blocker, NextAction, PrepPack, StoredDoc, Profile } from "@/types";

// INTEGRATION: Replace with backend logic for risk computation
export function computeRisk(milestone: Milestone): RiskLevel {
  const now = new Date();
  const dueDate = new Date(milestone.due);
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (milestone.status === 'overdue') return 'red';
  if (milestone.status === 'completed') return 'green';
  
  // Active milestones with less than 7 days or low progress
  if (milestone.status === 'active') {
    if (daysUntilDue < 7 || milestone.progress < 30) return 'red';
    if (daysUntilDue < 14 || milestone.progress < 60) return 'amber';
  }
  
  // Upcoming milestones approaching
  if (milestone.status === 'upcoming' && daysUntilDue < 30) return 'amber';
  
  return 'green';
}

// INTEGRATION: Replace with backend logic for blocker detection
export function findBlockers(milestone: Milestone, documents: StoredDoc[], profile: Profile | null): Blocker[] {
  const blockers: Blocker[] = [];
  const now = new Date();

  // Check for missing required documents based on milestone type
  if (milestone.kind === 'SSN') {
    if (!documents.some(d => d.category === 'I-20' && d.milestoneId === milestone.id)) {
      blockers.push({
        id: `${milestone.id}-missing-i20`,
        label: 'Missing I-20 document',
        kind: 'doc',
        milestoneId: milestone.id
      });
    }
    if (!documents.some(d => d.category === 'Passport')) {
      blockers.push({
        id: `${milestone.id}-missing-passport`,
        label: 'Missing passport copy',
        kind: 'doc',
        milestoneId: milestone.id
      });
    }
  }

  if (milestone.kind === 'OPT') {
    if (!documents.some(d => d.category === 'I-20' && d.milestoneId === milestone.id)) {
      blockers.push({
        id: `${milestone.id}-missing-i20-dso`,
        label: 'Missing I-20 with DSO endorsement',
        kind: 'doc',
        milestoneId: milestone.id
      });
    }
  }

  if (milestone.kind === 'CPT') {
    if (!documents.some(d => d.category === 'Job Offer' && d.milestoneId === milestone.id)) {
      blockers.push({
        id: `${milestone.id}-missing-job-offer`,
        label: 'Missing job offer letter',
        kind: 'doc',
        milestoneId: milestone.id
      });
    }
  }

  // Check passport expiry
  if (profile?.passportExpiry) {
    const expiryDate = new Date(profile.passportExpiry);
    const monthsUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsUntilExpiry < 6 && (milestone.kind === 'TRAVEL' || milestone.kind === 'OPT')) {
      blockers.push({
        id: `${milestone.id}-passport-expiry`,
        label: `Passport expires in ${monthsUntilExpiry} months (need 6+ for visa)`,
        kind: 'eligibility',
        milestoneId: milestone.id
      });
    }
  }

  // Check incomplete critical steps
  const incompleteSteps = milestone.steps.filter(s => !s.done && s.requiresUpload);
  if (incompleteSteps.length > 0 && milestone.status === 'active') {
    blockers.push({
      id: `${milestone.id}-incomplete-steps`,
      label: `${incompleteSteps.length} required step${incompleteSteps.length > 1 ? 's' : ''} incomplete`,
      kind: 'eligibility',
      milestoneId: milestone.id,
      stepId: incompleteSteps[0].id
    });
  }

  return blockers;
}

// INTEGRATION: Replace with backend prioritization logic
export function nextActions(
  milestones: Milestone[],
  documents: StoredDoc[],
  profile: Profile | null
): NextAction[] {
  const actions: NextAction[] = [];
  const now = new Date();

  // Prioritize active and overdue milestones
  const priorityMilestones = milestones
    .filter(m => m.status === 'active' || m.status === 'overdue')
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    });

  for (const milestone of priorityMilestones) {
    // Find first incomplete step
    const incompleteStep = milestone.steps.find(s => !s.done);
    if (incompleteStep) {
      if (incompleteStep.requiresUpload) {
        actions.push({
          id: `upload-${milestone.id}-${incompleteStep.id}`,
          label: `Upload ${incompleteStep.title} for ${milestone.title}`,
          cta: 'openUpload',
          milestoneId: milestone.id,
          stepId: incompleteStep.id,
          icon: 'Upload'
        });
      } else if (incompleteStep.formId) {
        actions.push({
          id: `form-${milestone.id}-${incompleteStep.id}`,
          label: `Fill ${incompleteStep.formId} form for ${milestone.title}`,
          cta: 'openForm',
          milestoneId: milestone.id,
          stepId: incompleteStep.id,
          icon: 'FileText'
        });
      } else {
        actions.push({
          id: `step-${milestone.id}-${incompleteStep.id}`,
          label: incompleteStep.title,
          cta: 'openStep',
          milestoneId: milestone.id,
          stepId: incompleteStep.id,
          icon: 'CheckSquare'
        });
      }
    }

    // Suggest prep pack generation for milestones with upcoming deadlines
    const daysUntilDue = Math.floor((new Date(milestone.due).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 14 && daysUntilDue > 0 && milestone.progress > 50) {
      actions.push({
        id: `preppack-${milestone.id}`,
        label: `Generate ${milestone.title} prep pack`,
        cta: 'generatePrepPack',
        milestoneId: milestone.id,
        icon: 'Package'
      });
    }

    if (actions.length >= 3) break;
  }

  return actions.slice(0, 3);
}

// INTEGRATION: Replace with backend PDF generation
export function genPrepPack(milestone: Milestone, documents: StoredDoc[]): PrepPack {
  const checklist: string[] = milestone.steps.map(s => s.title);
  const includedDocIds = documents
    .filter(d => d.milestoneId === milestone.id)
    .map(d => d.id);

  return {
    id: `preppack-${milestone.id}-${Date.now()}`,
    milestoneId: milestone.id,
    title: `${milestone.title} Preparation Pack`,
    checklist,
    includedDocIds,
    notes: `Generated on ${new Date().toLocaleDateString()}`
  };
}

// INTEGRATION: Replace with backend .ics generation
export function toICS(title: string, description: string, date: string, location?: string): string {
  const eventDate = new Date(date);
  const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//International Student Hub//EN
BEGIN:VEVENT
UID:${Date.now()}@studenthub.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
${location ? `LOCATION:${location}` : ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

export function downloadICS(title: string, description: string, date: string, location?: string) {
  const icsContent = toICS(title, description, date, location);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export type VisaType = 'F1' | 'J1';

export interface Profile {
  fullName: string;
  university: string;
  dsoName: string;
  dsoEmail: string;
  degreeStart: string;
  degreeEnd?: string;
  visaType: VisaType;
  country: string;
  passportExpiry: string;
}

export interface MilestoneStep {
  id: string;
  title: string;
  done: boolean;
  requiresUpload?: boolean;
  formId?: 'I-765' | 'SSN' | 'CPT' | 'I-20';
  description?: string;
}

export type MilestoneKind = 'F1' | 'I20' | 'SEVIS' | 'SSN' | 'CPT' | 'OPT' | 'TRAVEL';
export type MilestoneStatus = 'upcoming' | 'active' | 'completed' | 'overdue';

export interface Milestone {
  id: string;
  kind: MilestoneKind;
  title: string;
  description: string;
  due: string;
  status: MilestoneStatus;
  progress: number;
  steps: MilestoneStep[];
  notes?: string;
  icon: string;
}

export type NotificationKind = 'deadline' | 'document' | 'alert' | 'reminder';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  snoozedUntil?: string;
  action?: {
    label: string;
    href: string;
  };
}

export type DocCategory = 'Passport' | 'Visa' | 'I-20' | 'Job Offer' | 'SSA' | 'Misc';

export interface StoredDoc {
  id: string;
  name: string;
  category: DocCategory;
  uploadedAt: string;
  milestoneId?: string;
  url?: string;
  size?: number;
}

export type ActivityType =
  | 'step_completed'
  | 'doc_uploaded'
  | 'status_change'
  | 'deadline_created'
  | 'appointment_booked'
  | 'note_added';

export interface ActivityEntry {
  id: string;
  milestoneId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  createdAt: string;
  actor: 'user' | 'system';
  relatedDocId?: string;
  relatedStepId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
  sources?: Array<{ kind: 'document' | 'milestone' | 'activity'; id: string; label: string }>;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

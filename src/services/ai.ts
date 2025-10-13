import { Profile, Milestone, StoredDoc } from "@/types";

interface AdvisorOptions {
  useProfile: boolean;
  useMilestones: boolean;
  docIds?: string[];
}

interface AdvisorResponse {
  answer: string;
  sources: Array<{ kind: 'document' | 'milestone' | 'activity'; id: string; label: string }>;
  actions?: Array<{ id: string; label: string; action: 'generatePrepPack' | 'createReminder' | 'openStep' | 'emailDso'; data?: any }>;
}

// INTEGRATION: Replace with real backend/RAG call to Lovable AI or another LLM
export async function askAdvisor(
  question: string,
  opts: AdvisorOptions,
  context: { profile: Profile | null; milestones: Milestone[]; documents: StoredDoc[] }
): Promise<AdvisorResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const sources: AdvisorResponse['sources'] = [];
  const actions: AdvisorResponse['actions'] = [];
  let answer = "";

  const lowerQ = question.toLowerCase();

  // SSN-related questions
  if (lowerQ.includes("ssn") || lowerQ.includes("social security")) {
    const ssnMilestone = context.milestones.find(m => m.kind === "SSN");
    if (ssnMilestone) {
      sources.push({ kind: "milestone", id: ssnMilestone.id, label: ssnMilestone.title });
    }

    const i20Doc = context.documents.find(d => d.category === "I-20");
    if (i20Doc) {
      sources.push({ kind: "document", id: i20Doc.id, label: i20Doc.name });
    }

    if (lowerQ.includes("bring") || lowerQ.includes("appointment") || lowerQ.includes("documents")) {
      answer = "For your SSN appointment at the Social Security Administration office, you'll need:\n\n1. **Original passport** with valid F-1 visa stamp\n2. **Original I-94** arrival/departure record (electronic or paper)\n3. **Current I-20** with your DSO's signature (must be recent)\n4. **Employment authorization letter** (job offer letter or on-campus employment verification)\n5. **University admission letter** (if available)\n6. **Completed SS-5 form** (Application for Social Security Card)\n\nImportant notes:\n- All documents must be original or certified copies\n- You must have been in the US for at least 10 days\n- You need valid employment authorization (on-campus job, CPT, or OPT)\n- Arrive 15 minutes early for your appointment";
    } else if (lowerQ.includes("eligibility") || lowerQ.includes("eligible")) {
      answer = "To be eligible for an SSN as an F-1 student:\n\n✓ You must be physically present in the US for at least 10 days\n✓ You need valid employment authorization (one of the following):\n  - On-campus employment offer\n  - Approved CPT (Curricular Practical Training)\n  - Approved OPT (Optional Practical Training)\n✓ Your I-20 must be current and valid\n✓ You must be maintaining valid F-1 status\n\nIf you don't have employment authorization yet, you cannot apply for an SSN. Once you secure an on-campus job or get CPT/OPT approval, you can proceed with the application.";
    } else {
      answer = "The SSN (Social Security Number) application process for F-1 students involves:\n\n1. Ensuring you have valid employment authorization\n2. Being in the US for at least 10 days\n3. Completing Form SS-5\n4. Booking an appointment at your local SSA office\n5. Bringing all required documents to the appointment\n\nYour SSN card typically arrives by mail within 2-3 weeks after the appointment. You'll need this number for employment, filing taxes, and opening bank accounts.";
    }

    // Add action buttons for SSN
    if (ssnMilestone) {
      actions.push({
        id: 'ssn-prep',
        label: 'Generate SSN Prep Pack',
        action: 'generatePrepPack',
        data: { milestoneId: ssnMilestone.id }
      });
    }
  }
  // OPT-related questions
  else if (lowerQ.includes("opt") || lowerQ.includes("optional practical")) {
    const optMilestone = context.milestones.find(m => m.kind === "OPT");
    if (optMilestone) {
      sources.push({ kind: "milestone", id: optMilestone.id, label: optMilestone.title });
    }

    if (opts.useProfile && context.profile?.degreeEnd) {
      const degreeEndDate = new Date(context.profile.degreeEnd);
      const windowStart = new Date(degreeEndDate);
      windowStart.setDate(windowStart.getDate() - 90);
      const windowEnd = new Date(degreeEndDate);
      windowEnd.setDate(windowEnd.getDate() + 60);

      answer = `Based on your profile, here's your OPT timeline:\n\n**Program Completion Date:** ${degreeEndDate.toLocaleDateString()}\n**Application Window Opens:** ${windowStart.toLocaleDateString()} (90 days before completion)\n**Application Window Closes:** ${windowEnd.toLocaleDateString()} (60 days after completion)\n\n**Remaining steps:**\n`;
    } else {
      answer = "Your OPT (Optional Practical Training) application timeline:\n\n**Application Window:**\n- You can apply up to 90 days BEFORE your program completion date\n- You can apply up to 60 days AFTER your program completion date\n- Your application must be received by USCIS within 30 days of DSO recommendation\n\n**Key steps:**\n";
    }

    if (optMilestone) {
      const incompleteSteps = optMilestone.steps.filter(s => !s.done);
      if (incompleteSteps.length > 0) {
        answer += incompleteSteps.map((s, i) => `${i + 1}. ${s.title}`).join("\n");
        answer += `\n\n**Processing time:** 3-5 months on average\n**Filing fee:** $410`;
      }
    }

    // Add action buttons for OPT
    if (optMilestone) {
      actions.push({
        id: 'opt-prep',
        label: 'Generate OPT Prep Pack',
        action: 'generatePrepPack',
        data: { milestoneId: optMilestone.id }
      });
      actions.push({
        id: 'opt-reminder',
        label: 'Set OPT Deadline Reminder',
        action: 'createReminder',
        data: { title: 'OPT Application Deadline', milestoneId: optMilestone.id }
      });
    }
  }
  // CPT-related questions
  else if (lowerQ.includes("cpt") || lowerQ.includes("curricular practical")) {
    const cptMilestone = context.milestones.find(m => m.kind === "CPT");
    if (cptMilestone) {
      sources.push({ kind: "milestone", id: cptMilestone.id, label: cptMilestone.title });
    }

    answer = "CPT (Curricular Practical Training) allows F-1 students to work off-campus in positions related to their field of study.\n\n**Requirements:**\n- You must have been enrolled full-time for at least one academic year\n- The job must be directly related to your major\n- Your DSO must authorize it on your I-20\n\n**Process:**\n1. Secure a job offer from an employer\n2. Complete your school's CPT request form\n3. Submit to your DSO with the job offer letter\n4. Receive updated I-20 with CPT authorization\n5. Provide I-20 copy to employer before starting work\n\n**Important:** 12+ months of full-time CPT will make you ineligible for OPT.";

    if (cptMilestone) {
      actions.push({
        id: 'cpt-email',
        label: 'Email DSO Template',
        action: 'emailDso',
        data: { milestoneId: cptMilestone.id }
      });
    }
  }
  // Expiration/deadline questions
  else if (lowerQ.includes("expire") || lowerQ.includes("deadline") || lowerQ.includes("upcoming")) {
    const activeMilestones = context.milestones.filter(m => m.status === "active" || m.status === "upcoming");
    activeMilestones.slice(0, 2).forEach(m => {
      sources.push({ kind: "milestone", id: m.id, label: m.title });
    });

    answer = "Here are your upcoming deadlines:\n\n";
    activeMilestones.forEach(m => {
      answer += `**${m.title}**\n- Due: ${m.due}\n- Status: ${m.status}\n- Progress: ${m.progress}%\n\n`;
    });

    if (context.profile?.passportExpiry) {
      const expiryDate = new Date(context.profile.passportExpiry);
      const monthsUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      if (monthsUntilExpiry < 12) {
        answer += `⚠️ **Passport Expiration:** Your passport expires in ${monthsUntilExpiry} months. Many visa applications require at least 6 months validity remaining.`;
      }
    }
  }
  // I-20 questions
  else if (lowerQ.includes("i-20") || lowerQ.includes("i20")) {
    const i20Milestone = context.milestones.find(m => m.kind === "I20");
    if (i20Milestone) {
      sources.push({ kind: "milestone", id: i20Milestone.id, label: i20Milestone.title });
    }

    const i20Doc = context.documents.find(d => d.category === "I-20");
    if (i20Doc) {
      sources.push({ kind: "document", id: i20Doc.id, label: i20Doc.name });
    }

    answer = "Your I-20 (Certificate of Eligibility for F-1 Status) is one of your most important documents.\n\n**Key points:**\n- Keep it with you at all times\n- Get a travel signature from your DSO before international travel (valid for 1 year)\n- Report any changes (address, major, funding) to your DSO\n- You'll need an updated I-20 for CPT or OPT authorization\n\n**When you need a new I-20:**\n- Program extension\n- Change of major or educational level\n- Reduced course load\n- CPT or OPT authorization\n\nAlways carry your I-20 when traveling, along with your passport and visa.";
  }
  // Travel questions
  else if (lowerQ.includes("travel") || lowerQ.includes("leave") || lowerQ.includes("visit")) {
    const travelMilestone = context.milestones.find(m => m.kind === "TRAVEL");
    if (travelMilestone) {
      sources.push({ kind: "milestone", id: travelMilestone.id, label: travelMilestone.title });
    }

    answer = "When planning international travel as an F-1 student:\n\n**Before you leave:**\n1. Get a travel signature on your I-20 from your DSO (valid for 1 year)\n2. Ensure your passport is valid for at least 6 months\n3. Check that your F-1 visa is valid (if expired, you may need to apply for a new visa)\n4. Get a letter from your school verifying enrollment\n\n**Documents to carry:**\n- Valid passport\n- Valid F-1 visa (or visa application if renewing)\n- I-20 with recent travel signature (within 1 year)\n- Enrollment verification letter\n- Recent transcript or proof of student status\n\n**Important:** If your visa has expired, you can re-enter the US only after getting a new visa stamp at a US embassy/consulate abroad. Plan ahead as visa appointments can take weeks.";
  }
  // Default/general question
  else {
    answer = "I'm here to help with questions about your F-1 visa journey, including:\n\n- SSN application process and requirements\n- OPT and CPT authorization\n- I-20 management and travel signatures\n- Document requirements and deadlines\n- Timeline planning for your milestones\n\nYou can ask me specific questions like:\n- \"What should I bring to my SSN appointment?\"\n- \"When is my OPT application window?\"\n- \"What documents do I need for international travel?\"\n- \"What expires next?\"\n\nFeel free to attach relevant documents or enable profile/milestone context for more personalized guidance.";
  }

  return { answer, sources, actions: actions.length > 0 ? actions : undefined };
}

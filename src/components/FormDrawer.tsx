import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: 'I-765' | 'SSN' | 'CPT' | 'I-20';
  onSubmit?: (data: Record<string, string>) => void;
}

const formConfigs = {
  "I-765": {
    title: "I-765 Form (OPT Application)",
    description: "Complete the form below. Your profile data will be pre-filled.",
    fields: [
      { id: "fullName", label: "Full Name", type: "text" },
      { id: "address", label: "Current US Address", type: "text" },
      { id: "sevisId", label: "SEVIS ID", type: "text" },
      { id: "degreeDate", label: "Degree Completion Date", type: "date" },
      { id: "optCategory", label: "OPT Category", type: "text", placeholder: "Post-completion" },
    ],
  },
  "SSN": {
    title: "SS-5 Form (SSN Application)",
    description: "Complete your Social Security Number application form.",
    fields: [
      { id: "fullName", label: "Full Name (as on passport)", type: "text" },
      { id: "dateOfBirth", label: "Date of Birth", type: "date" },
      { id: "placeOfBirth", label: "Place of Birth", type: "text" },
      { id: "citizenship", label: "Country of Citizenship", type: "text" },
      { id: "usAddress", label: "US Mailing Address", type: "text" },
    ],
  },
  "CPT": {
    title: "CPT Request Form",
    description: "Submit your Curricular Practical Training request to your DSO.",
    fields: [
      { id: "employerName", label: "Employer Name", type: "text" },
      { id: "jobTitle", label: "Job Title", type: "text" },
      { id: "startDate", label: "Start Date", type: "date" },
      { id: "endDate", label: "End Date", type: "date" },
      { id: "hoursPerWeek", label: "Hours Per Week", type: "number" },
      { id: "jobDescription", label: "Job Description", type: "textarea" },
    ],
  },
  "I-20": {
    title: "I-20 Request Form",
    description: "Request your I-20 document from your university.",
    fields: [
      { id: "fullName", label: "Full Name", type: "text" },
      { id: "studentId", label: "Student ID", type: "text" },
      { id: "program", label: "Degree Program", type: "text" },
      { id: "major", label: "Major", type: "text" },
      { id: "admissionDate", label: "Admission Date", type: "date" },
    ],
  },
};

export function FormDrawer({ open, onOpenChange, formId, onSubmit }: FormDrawerProps) {
  const config = formConfigs[formId];
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // INTEGRATION: Auto-fill from Profile data, generate pre-filled PDF
    onSubmit?.(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{config.title}</SheetTitle>
          <SheetDescription>{config.description}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Save & Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

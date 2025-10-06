import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { Profile, VisaType, Milestone } from "@/types";
import { seedMilestones } from "@/data/seed";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Personal & University" },
  { id: 2, title: "Visa & Dates" },
  { id: 3, title: "Initial Uploads" },
  { id: 4, title: "Review & Confirm" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [uploads, setUploads] = useState<{ passport: boolean; admission: boolean }>({
    passport: false,
    admission: false,
  });

  const updateProfile = (field: keyof Profile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleMockUpload = (type: 'passport' | 'admission') => {
    setUploads({ ...uploads, [type]: true });
    toast.success(`${type === 'passport' ? 'Passport' : 'Admission letter'} uploaded`);
  };

  const handleComplete = () => {
    // INTEGRATION: Compute milestone due dates based on degreeStart/degreeEnd and visa type
    // For now, use seed data with adjusted dates
    const completedProfile = profile as Profile;
    
    dispatch({
      type: "COMPLETE_ONBOARDING",
      payload: {
        profile: completedProfile,
        milestones: seedMilestones,
      },
    });

    toast.success("Welcome! Your personalized plan is ready.");
    navigate("/dashboard");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.fullName && profile.university && profile.dsoName && profile.dsoEmail;
      case 2:
        return profile.visaType && profile.degreeStart && profile.country && profile.passportExpiry;
      case 3:
        return uploads.passport && uploads.admission;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <h1 className="text-lg font-bold">International Student Hub</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Banner */}
          <Card className="p-4 mb-8 bg-accent border-primary">
            <p className="text-sm text-center">
              <strong>Important:</strong> This tool provides guided automation and reminders. It is not legal advice.
            </p>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Side Stepper */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      currentStep === step.id && "bg-accent",
                      currentStep > step.id && "opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                        currentStep > step.id
                          ? "bg-success text-success-foreground"
                          : currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Panel */}
            <div className="lg:col-span-3">
              <Card className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Personal & University Info</h2>
                      <p className="text-muted-foreground">Tell us about yourself and your university</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName || ""}
                          onChange={(e) => updateProfile("fullName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={profile.university || ""}
                          onChange={(e) => updateProfile("university", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dsoName">DSO Name</Label>
                        <Input
                          id="dsoName"
                          value={profile.dsoName || ""}
                          onChange={(e) => updateProfile("dsoName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dsoEmail">DSO Email</Label>
                        <Input
                          id="dsoEmail"
                          type="email"
                          value={profile.dsoEmail || ""}
                          onChange={(e) => updateProfile("dsoEmail", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Visa & Program Dates</h2>
                      <p className="text-muted-foreground">Your visa details and program timeline</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="visaType">Visa Type</Label>
                        <Select
                          value={profile.visaType}
                          onValueChange={(value: VisaType) => updateProfile("visaType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select visa type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="F1">F-1 (Student)</SelectItem>
                            <SelectItem value="J1">J-1 (Exchange Visitor)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="degreeStart">Program Start Date</Label>
                        <Input
                          id="degreeStart"
                          type="date"
                          value={profile.degreeStart || ""}
                          onChange={(e) => updateProfile("degreeStart", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="degreeEnd">Expected Completion Date (Optional)</Label>
                        <Input
                          id="degreeEnd"
                          type="date"
                          value={profile.degreeEnd || ""}
                          onChange={(e) => updateProfile("degreeEnd", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country of Citizenship</Label>
                        <Input
                          id="country"
                          value={profile.country || ""}
                          onChange={(e) => updateProfile("country", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                        <Input
                          id="passportExpiry"
                          type="date"
                          value={profile.passportExpiry || ""}
                          onChange={(e) => updateProfile("passportExpiry", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Initial Document Uploads</h2>
                      <p className="text-muted-foreground">Upload your essential documents (mock)</p>
                    </div>
                    <div className="space-y-4">
                      <Card className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Passport Copy</h3>
                            <p className="text-sm text-muted-foreground">ID page with photo</p>
                          </div>
                          <Button
                            variant={uploads.passport ? "success" : "outline"}
                            onClick={() => handleMockUpload("passport")}
                          >
                            {uploads.passport ? (
                              <>
                                <Check className="h-4 w-4" /> Uploaded
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" /> Upload
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                      <Card className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Admission Letter</h3>
                            <p className="text-sm text-muted-foreground">Official acceptance letter</p>
                          </div>
                          <Button
                            variant={uploads.admission ? "success" : "outline"}
                            onClick={() => handleMockUpload("admission")}
                          >
                            {uploads.admission ? (
                              <>
                                <Check className="h-4 w-4" /> Uploaded
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" /> Upload
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
                      <p className="text-muted-foreground">Verify your information before generating your plan</p>
                    </div>
                    <div className="space-y-4">
                      <Card className="p-4 bg-accent">
                        <h3 className="font-semibold mb-2">Profile Summary</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Name:</div>
                          <div className="font-medium">{profile.fullName}</div>
                          <div className="text-muted-foreground">University:</div>
                          <div className="font-medium">{profile.university}</div>
                          <div className="text-muted-foreground">Visa Type:</div>
                          <div className="font-medium">{profile.visaType}</div>
                          <div className="text-muted-foreground">Program Start:</div>
                          <div className="font-medium">{profile.degreeStart}</div>
                          <div className="text-muted-foreground">Country:</div>
                          <div className="font-medium">{profile.country}</div>
                        </div>
                      </Card>
                      <p className="text-sm text-muted-foreground">
                        Based on your information, we'll generate a personalized timeline with 7 key milestones 
                        including SSN application, CPT/OPT processes, and travel requirements.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      Back
                    </Button>
                  )}
                  <div className="ml-auto">
                    {currentStep < 4 ? (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button variant="hero" onClick={handleComplete} disabled={!canProceed()}>
                        Generate My Plan
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

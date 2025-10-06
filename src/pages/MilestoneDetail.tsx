import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Stepper } from "@/components/Stepper";
import { FormDrawer } from "@/components/FormDrawer";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Download, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";

export default function MilestoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [currentStepId, setCurrentStepId] = useState<string | undefined>();
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [formType, setFormType] = useState<'I-765' | 'SSN' | 'CPT' | 'I-20' | null>(null);

  const milestone = state.milestones.find((m) => m.id === id);

  if (!milestone) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Milestone Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const currentStep = currentStepId
    ? milestone.steps.find((s) => s.id === currentStepId)
    : milestone.steps[0];

  const handleStepToggle = (stepId: string, done: boolean) => {
    dispatch({
      type: "UPDATE_STEP",
      payload: { milestoneId: milestone.id, stepId, done },
    });
    toast.success(done ? "Step completed!" : "Step marked as incomplete");
  };

  const handleMockUpload = () => {
    toast.success("Document uploaded successfully (mock)");
  };

  const handleDownloadPDF = () => {
    // INTEGRATION: Generate pre-filled PDF from profile + milestone data
    toast.info("Pre-filled PDF generation (integration point)");
  };

  const handleBookAppointment = () => {
    // INTEGRATION: SSA booking API, embassy appointment system
    toast.info("Appointment booking (integration point)");
  };

  const handleOpenForm = (type: 'I-765' | 'SSN' | 'CPT' | 'I-20') => {
    setFormType(type);
    setFormDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => navigate("/notifications")}
        notificationCount={state.notifications.filter((n) => !n.read).length}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{milestone.title}</h1>
                <p className="text-muted-foreground text-lg">{milestone.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                {milestone.kind === "SSN" && (
                  <Button variant="outline" onClick={handleBookAppointment}>
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant={
                  milestone.status === "completed"
                    ? "success"
                    : milestone.status === "active"
                    ? "default"
                    : milestone.status === "overdue"
                    ? "warning"
                    : "info"
                }
              >
                {milestone.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Due: {milestone.due}</span>
              <div className="flex-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Stepper */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="font-bold mb-4">Steps</h2>
                <Stepper
                  steps={milestone.steps}
                  currentStepId={currentStepId}
                  onStepClick={setCurrentStepId}
                />
              </Card>
            </div>

            {/* Right: Step Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {currentStep ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
                          {currentStep.description && (
                            <p className="text-muted-foreground">{currentStep.description}</p>
                          )}
                        </div>
                        <Checkbox
                          checked={currentStep.done}
                          onCheckedChange={(checked) =>
                            handleStepToggle(currentStep.id, checked as boolean)
                          }
                          className="ml-4"
                        />
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="space-y-4">
                      {currentStep.requiresUpload && (
                        <Card className="p-4 bg-accent">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold mb-1">Upload Required</h3>
                              <p className="text-sm text-muted-foreground">
                                Upload the necessary document for this step
                              </p>
                            </div>
                            <Button variant="outline" onClick={handleMockUpload}>
                              <Upload className="h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                        </Card>
                      )}

                      {currentStep.formId && (
                        <Card className="p-4 bg-accent">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold mb-1">Form: {currentStep.formId}</h3>
                              <p className="text-sm text-muted-foreground">
                                Fill out the form with your information
                              </p>
                            </div>
                            <Button onClick={() => handleOpenForm(currentStep.formId!)}>
                              Fill Form
                            </Button>
                          </div>
                        </Card>
                      )}

                      {/* Additional Info based on milestone kind */}
                      {milestone.kind === "SSN" && currentStep.id === "ssn-1" && (
                        <Card className="p-4 border-primary">
                          <h3 className="font-semibold mb-2">Eligibility Checklist</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>You have been in the US for at least 10 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>You have valid employment authorization (on-campus job or CPT/OPT)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Your I-20 is valid and current</span>
                            </li>
                          </ul>
                        </Card>
                      )}

                      {milestone.kind === "OPT" && currentStep.id === "opt-1" && (
                        <Card className="p-4 border-primary">
                          <h3 className="font-semibold mb-2">OPT Application Windows</h3>
                          <p className="text-sm mb-2">You can apply for OPT:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Up to 90 days before your program completion date</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>No later than 60 days after program completion</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Application must be received by USCIS within 30 days of DSO recommendation</span>
                            </li>
                          </ul>
                        </Card>
                      )}
                    </div>

                    {milestone.notes && (
                      <Card className="p-4 bg-muted">
                        <h3 className="font-semibold mb-2">Notes</h3>
                        <p className="text-sm">{milestone.notes}</p>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Select a step to view details</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>

      {formType && (
        <FormDrawer
          open={formDrawerOpen}
          onOpenChange={setFormDrawerOpen}
          formId={formType}
          onSubmit={(data) => {
            console.log("Form submitted:", data);
            toast.success("Form saved successfully");
          }}
        />
      )}

      <PrivacyFooter />
    </div>
  );
}

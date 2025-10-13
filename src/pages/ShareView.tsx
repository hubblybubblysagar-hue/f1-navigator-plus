import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { FileText, Clock, AlertCircle, Lock } from "lucide-react";

export default function ShareView() {
  const { token } = useParams();
  const { state } = useApp();

  // INTEGRATION: Validate token and expiry with backend
  // For now, extract milestoneId from token (demo: token format is "share-{milestoneId}-{timestamp}")
  const milestoneId = token?.split('-')[1];
  const milestone = state.milestones.find(m => m.id === milestoneId);
  const documents = state.documents.filter(d => d.milestoneId === milestoneId);

  if (!milestone) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Share Link Invalid</h1>
            <p className="text-muted-foreground">
              This share link may have expired or been deleted.
            </p>
          </Card>
        </main>
        <PrivacyFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Read-only shared view • Expires in 7 days</span>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{milestone.title}</h1>
              <p className="text-muted-foreground">{milestone.description}</p>
            </div>
            <Badge variant={milestone.status === 'completed' ? 'success' : 'default'}>
              {milestone.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {milestone.due}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Progress:</span> {milestone.progress}%
            </div>
          </div>

          <Progress value={milestone.progress} className="h-2" />
        </Card>

        {/* Steps */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Steps</h2>
          <div className="space-y-3">
            {milestone.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 bg-secondary rounded-lg"
              >
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  step.done ? 'bg-success text-success-foreground' : 'bg-muted'
                }`}>
                  {step.done && '✓'}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.done ? 'line-through text-muted-foreground' : ''}`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Documents */}
        {documents.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Documents ({documents.length})</h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
          <p>This is a read-only view shared via International Student Hub</p>
          <p className="mt-1">Information shown is current as of {new Date().toLocaleDateString()}</p>
        </div>
      </main>
      <PrivacyFooter />
    </div>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrepPack, StoredDoc, Milestone } from "@/types";
import { Download, Share2, FileText, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface PrepPackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prepPack: PrepPack;
  milestone: Milestone;
  documents: StoredDoc[];
  onGenerateShareLink?: (expiryHours: number) => string;
}

export function PrepPackModal({
  open,
  onOpenChange,
  prepPack,
  milestone,
  documents,
  onGenerateShareLink
}: PrepPackModalProps) {
  const [redactPII, setRedactPII] = useState(false);
  const [notes, setNotes] = useState(prepPack.notes || "");
  const { toast } = useToast();

  const includedDocs = documents.filter(d => prepPack.includedDocIds.includes(d.id));

  // INTEGRATION: Replace with server-side PDF generation
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text(prepPack.title, 20, yPos);
    yPos += 15;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Milestone Info
    doc.setFontSize(14);
    doc.text(`Milestone: ${milestone.title}`, 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Due Date: ${milestone.due}`, 20, yPos);
    yPos += 10;
    doc.text(`Progress: ${milestone.progress}%`, 20, yPos);
    yPos += 15;

    // Checklist
    doc.setFontSize(14);
    doc.text("Checklist:", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    prepPack.checklist.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const checkbox = milestone.steps[index]?.done ? "[✓]" : "[ ]";
      doc.text(`${checkbox} ${item}`, 25, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Documents
    if (includedDocs.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Included Documents:", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      includedDocs.forEach((docItem) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const docName = redactPII ? docItem.name.replace(/\d{3}-\d{2}-\d{4}/g, "XXX-XX-XXXX") : docItem.name;
        doc.text(`• ${docName} (${docItem.category})`, 25, yPos);
        yPos += 7;
      });
    }

    yPos += 10;

    // Notes
    if (notes) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text("Notes:", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(notes, 170);
      noteLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 25, yPos);
        yPos += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.text("International Student Hub - Not Legal Advice", 105, 285, { align: "center" });

    doc.save(`${milestone.title.replace(/\s+/g, '_')}_PrepPack.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "Your preparation pack has been downloaded successfully."
    });
  };

  const handleGenerateShareLink = () => {
    if (onGenerateShareLink) {
      const link = onGenerateShareLink(168); // 7 days
      navigator.clipboard.writeText(link);
      toast({
        title: "Share Link Copied",
        description: "The read-only share link has been copied to your clipboard. Valid for 7 days."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{prepPack.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Checklist */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </h3>
            <div className="space-y-2">
              {prepPack.checklist.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-secondary rounded-md">
                  <CheckSquare className={`h-4 w-4 flex-shrink-0 mt-0.5 ${milestone.steps[index]?.done ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          {includedDocs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Included Documents ({includedDocs.length})
              </h3>
              <div className="space-y-2">
                {includedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 block">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or reminders for this preparation pack..."
              rows={4}
            />
          </div>

          {/* Redact PII Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="redact-pii">Redact Personal Information</Label>
              <p className="text-xs text-muted-foreground">
                Hide sensitive information like passport numbers and dates of birth
              </p>
            </div>
            <Switch
              id="redact-pii"
              checked={redactPII}
              onCheckedChange={setRedactPII}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleGenerateShareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Copy Share Link
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

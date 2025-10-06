import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { FileText, Grid3x3, List, Upload, Eye, Trash2, Edit2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DocCategory } from "@/types";

export default function Documents() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [milestoneFilter, setMilestoneFilter] = useState<string>("all");

  const filteredDocs = state.documents.filter((doc) => {
    if (categoryFilter !== "all" && doc.category !== categoryFilter) return false;
    if (milestoneFilter !== "all" && doc.milestoneId !== milestoneFilter) return false;
    return true;
  });

  const handleMockUpload = () => {
    toast.success("Document uploaded (mock)");
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_DOCUMENT", payload: id });
    toast.success("Document deleted");
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Documents Vault</h1>
            <p className="text-muted-foreground">Securely store and manage your important documents</p>
          </div>

          {/* Filters & Actions */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="I-20">I-20</SelectItem>
                  <SelectItem value="Job Offer">Job Offer</SelectItem>
                  <SelectItem value="SSA">SSA</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>

              <Select value={milestoneFilter} onValueChange={setMilestoneFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Milestones</SelectItem>
                  {state.milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleMockUpload}>
                <Upload className="h-4 w-4" />
                Add Document
              </Button>
            </div>
          </div>

          {/* Documents */}
          {filteredDocs.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No documents found</h2>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started
              </p>
              <Button onClick={handleMockUpload}>
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <Card key={doc.id} className="p-6 hover:shadow-elevated transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Badge variant="secondary">{doc.category}</Badge>
                    {doc.milestoneId && (
                      <Badge variant="outline" className="ml-2">
                        {state.milestones.find((m) => m.id === doc.milestoneId)?.title}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Category</th>
                      <th className="text-left p-4 font-semibold">Milestone</th>
                      <th className="text-left p-4 font-semibold">Size</th>
                      <th className="text-left p-4 font-semibold">Uploaded</th>
                      <th className="text-right p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{doc.category}</Badge>
                        </td>
                        <td className="p-4">
                          {doc.milestoneId ? (
                            <Badge variant="outline">
                              {state.milestones.find((m) => m.id === doc.milestoneId)?.title}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>

      <PrivacyFooter />
    </div>
  );
}

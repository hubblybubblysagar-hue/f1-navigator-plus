import { ChatMessage } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Bot, Copy, ExternalLink, Package, Bell, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ChatThreadProps {
  messages: ChatMessage[];
  onAction?: (action: any) => void;
}

const actionIcons = {
  generatePrepPack: Package,
  createReminder: Bell,
  emailDso: Mail,
  openStep: ExternalLink
};

export function ChatThread({ messages, onAction }: ChatThreadProps) {
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSourceClick = (source: ChatMessage['sources'][0]) => {
    if (source.kind === "document") {
      navigate("/documents");
    } else if (source.kind === "milestone") {
      navigate(`/milestone/${source.id}`);
    } else if (source.kind === "activity") {
      navigate(`/milestone/${source.id}#activity`);
    }
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isSystem = message.role === "system";

        if (isSystem) return null;

        return (
          <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? "bg-primary text-primary-foreground" : "bg-accent"
              }`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className="flex-1 space-y-2">
                <Card className={`p-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </Card>

                <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
                  isUser ? "justify-end" : "justify-start"
                }`}>
                  <span>{format(parseISO(message.createdAt), "h:mm a")}</span>
                  {!isUser && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => handleCopy(message.text)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>

                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Sources:</span>
                    {message.sources.map((source, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => handleSourceClick(source)}
                      >
                        {source.label}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {!isUser && (message as any).actions && (
                  <div className="flex flex-wrap gap-2">
                    {(message as any).actions.map((action: any) => {
                      const IconComponent = actionIcons[action.action as keyof typeof actionIcons] || ExternalLink;
                      return (
                        <Button
                          key={action.id}
                          variant="secondary"
                          size="sm"
                          onClick={() => onAction?.(action)}
                        >
                          <IconComponent className="h-3 w-3 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

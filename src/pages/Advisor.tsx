import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatThread } from "@/components/ChatThread";
import { useApp } from "@/context/AppContext";
import { askAdvisor } from "@/services/ai";
import { ChatMessage, ChatThread as ChatThreadType } from "@/types";
import { Send, Paperclip, Search, Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const suggestedPrompts = [
  "What should I bring to my SSN appointment?",
  "When is my OPT window and what steps are left?",
  "What expires next?",
  "Do I need a travel signature on my I-20?",
];

export default function Advisor() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    state.chatThreads[0]?.id || null
  );
  const [input, setInput] = useState("");
  const [useProfile, setUseProfile] = useState(true);
  const [useMilestones, setUseMilestones] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentThread = state.chatThreads.find((t) => t.id === selectedThreadId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentThread?.messages]);

  const handleNewChat = () => {
    const newThread: ChatThreadType = {
      id: `thread-${Date.now()}`,
      title: "New conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CHAT_THREAD", payload: newThread });
    setSelectedThreadId(newThread.id);
  };

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText) return;

    let threadId = selectedThreadId;
    if (!threadId) {
      handleNewChat();
      threadId = `thread-${Date.now()}`;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: messageText,
      createdAt: new Date().toISOString(),
    };

    const updatedThread = state.chatThreads.find((t) => t.id === threadId);
    if (!updatedThread) return;

    const threadWithUser: ChatThreadType = {
      ...updatedThread,
      title: updatedThread.messages.length === 0 ? messageText.slice(0, 50) : updatedThread.title,
      messages: [...updatedThread.messages, userMessage],
    };

    dispatch({ type: "UPDATE_CHAT_THREAD", payload: threadWithUser });
    setInput("");
    setIsLoading(true);

    dispatch({
      type: "ADD_ACTIVITY",
      payload: {
        id: `act-${Date.now()}`,
        type: "note_added",
        title: `Asked Advisor: ${messageText.slice(0, 40)}...`,
        createdAt: new Date().toISOString(),
        actor: "user",
      },
    });

    try {
      const response = await askAdvisor(
        messageText,
        { useProfile, useMilestones },
        { profile: state.profile, milestones: state.milestones, documents: state.documents }
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        text: response.answer,
        createdAt: new Date().toISOString(),
        sources: response.sources,
      };

      const finalThread: ChatThreadType = {
        ...threadWithUser,
        messages: [...threadWithUser.messages, assistantMessage],
      };

      dispatch({ type: "UPDATE_CHAT_THREAD", payload: finalThread });

      dispatch({
        type: "ADD_ACTIVITY",
        payload: {
          id: `act-${Date.now()}-sys`,
          type: "note_added",
          title: "Advisor provided guidance",
          description: messageText.slice(0, 60),
          createdAt: new Date().toISOString(),
          actor: "system",
        },
      });
    } catch (error) {
      toast.error("Failed to get response from advisor");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredThreads = state.chatThreads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => navigate("/notifications")}
        notificationCount={state.notifications.filter((n) => !n.read).length}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Advisor</h1>
            <p className="text-muted-foreground">
              Get personalized guidance for your F-1 journey
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
            {/* Left: Thread List */}
            <Card className="col-span-1 p-4 flex flex-col">
              <div className="mb-4">
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleNewChat} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {filteredThreads.map((thread) => (
                    <Button
                      key={thread.id}
                      variant={selectedThreadId === thread.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedThreadId(thread.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{thread.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(thread.createdAt), "MMM d")}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Right: Chat Thread */}
            <Card className="col-span-3 flex flex-col">
              {!currentThread ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-semibold mb-2">Welcome to Advisor</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Ask questions about SSN, OPT, CPT, travel, and more.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Try asking:</p>
                      {suggestedPrompts.map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleSendMessage(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-6 p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground text-left">
                          Guidance only. Not legal advice.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b bg-muted">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Guidance only. Not legal advice.</span>
                    </div>
                  </div>

                  <ScrollArea ref={scrollRef} className="flex-1 p-4">
                    {currentThread.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground mb-4">
                          Start a conversation
                        </p>
                        <div className="space-y-2 max-w-sm mx-auto">
                          {suggestedPrompts.map((prompt, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleSendMessage(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <ChatThread messages={currentThread.messages} />
                    )}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Advisor is thinking...</span>
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t bg-muted/10">
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="use-profile"
                          checked={useProfile}
                          onCheckedChange={setUseProfile}
                        />
                        <Label htmlFor="use-profile" className="cursor-pointer">
                          Use my profile
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="use-milestones"
                          checked={useMilestones}
                          onCheckedChange={setUseMilestones}
                        />
                        <Label htmlFor="use-milestones" className="cursor-pointer">
                          Use my milestones
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                        disabled={isLoading}
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          size="icon"
                          onClick={() => handleSendMessage()}
                          disabled={!input.trim() || isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" disabled>
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      <PrivacyFooter />
    </div>
  );
}

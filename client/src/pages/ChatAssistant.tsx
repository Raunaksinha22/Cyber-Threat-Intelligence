import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Clock, Loader2 } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const quickQueries = [
  "What are the top phishing domains detected recently?",
  "Show me critical CVEs from the last few days",
  "Analyze recent malware trends in the threat feeds"
];

const chatSessions = [
  { id: 1, title: "Phishing Campaign Analysis", time: "2h ago" },
  { id: 2, title: "CVE Threat Assessment", time: "5h ago" },
  { id: 3, title: "Malware IOC Investigation", time: "1d ago" }
];

interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      content: "Hello! I'm your Cyber Threat Intelligence Assistant powered by AI. I can help you analyze threats, search IOCs, and provide insights about your security data. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));

      const response = await chatAPI.sendMessage(inputValue, conversationHistory);

      const botMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        content: "I apologize, but I encountered an error processing your request. Please make sure the OpenAI API is configured correctly and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Chat Error",
        description: error.response?.data?.error || "Failed to get response from AI assistant",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (query: string) => {
    setInputValue(query);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Chat Assistant</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          AI-powered threat intelligence analysis and querying (GPT-5)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Sessions
            </h3>
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full text-left p-3 rounded-md hover-elevate border border-border"
                  data-testid={`button-session-${session.id}`}
                >
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{session.time}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[600px]">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-assistant-title">CTI Assistant (GPT-5)</h3>
                <p className="text-xs text-muted-foreground">Online • Real-time threat analysis</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.id}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-4 rounded-lg whitespace-pre-line ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp}</p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="max-w-[70%]">
                    <div className="p-4 rounded-lg bg-muted text-foreground flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing threat data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Quick queries:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQueries.map((query, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover-elevate"
                      onClick={() => handleQuickQuery(query)}
                      data-testid={`button-quick-query-${idx}`}
                    >
                      {query}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about threats, IOCs, CVEs..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                  disabled={isLoading}
                  data-testid="input-chat-message"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !inputValue.trim()}
                  data-testid="button-send-message"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

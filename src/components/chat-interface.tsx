import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import { toast } from "@/hooks/use-toast";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import GradientText from './GradientText';
import { useTheme } from 'next-themes';
import { WeatherWidget } from './weather-widget';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copyState, setCopyState] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  const welcomeMessage = "Good evening, User";
  const promptSuggestions = ["Interview Questions", "HR Q&A"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Reset copy state after a delay
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    Object.entries(copyState).forEach(([id, copied]) => {
      if (copied) {
        const timeout = setTimeout(() => {
          setCopyState(prev => ({ ...prev, [id]: false }));
        }, 2000);
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [copyState]);

  // Function to format unstructured text
  const formatUnstructuredText = (text: string): string => {
    // Simple heuristics to detect and format unstructured text
    if (!text.includes('# ') && !text.includes('## ') && text.length > 50) {
      // Add paragraph breaks to long texts
      const paragraphs = text.split(/\n\s*\n/);
      
      if (paragraphs.length <= 1 && text.includes('. ')) {
        // If no paragraph breaks, add some based on sentences
        const formattedText = text
          .split('. ')
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .join('.\n\n');
        
        return formattedText;
      }
    }
    
    return text;
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      // Example of automatically formatting unstructured response
      const responseText = "Sorry, there was an error processing your request. Please try again.";
      const formattedResponse = formatUnstructuredText(responseText);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: formattedResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    // Set the input to the selected prompt
    setInput(prompt);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  const handleCopyToClipboard = (content: string, id: string | number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyState(prev => ({ ...prev, [id]: true }));
      toast({
        title: "Copied to clipboard",
        description: "The message has been copied to your clipboard.",
        duration: 2000,
      });
    });
  };

  const handleSubmit = () => {
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const components: Components = {
    code: ({ node, inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="relative group">
          <SyntaxHighlighter
            style={vs2015 as any}
            language={match[1]}
            PreTag="div"
            className="!bg-[#1D1D1F] !p-4 rounded-lg overflow-x-auto"
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
          <button
            onClick={() => handleCopyToClipboard(String(children), `code-${Date.now()}`)}
            className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 ease-in-out hover:bg-white/10 dark:hover:bg-white/10 hover:scale-110 touch-none"
          >
            {copyState[`code-${Date.now()}`] ? (
              <Check className="h-4 w-4 text-green-400 transition-transform duration-300 scale-110" />
            ) : (
              <Copy className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
        </div>
      ) : (
        <code {...props} className={className}>
          {children}
        </code>
      );
    },
  };

  const Message = ({ content, role }: { content: string; role: 'user' | 'assistant' }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const copyToClipboard = async () => {
      try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        
        // Try to copy using the clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(content);
        } else {
          // Fallback to execCommand
          document.execCommand('copy');
        }
        
        // Clean up
        document.body.removeChild(textarea);
        
        // Show success state
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Message content has been copied",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy message to clipboard. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    return (
      <div className={cn("flex flex-col gap-2", role === 'user' ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-[88%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%]",
            role === 'user'
              ? "bg-[#1D1D1F] text-white dark:bg-white dark:text-black"
              : "bg-white/10 dark:bg-[#1D1D1F]/40 backdrop-blur-xl border border-white/20 dark:border-white/10"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    style={vs2015 as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-talentforge-400 pl-4 italic my-2">
                    {children}
                  </blockquote>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-4 my-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-4 my-2">{children}</ol>;
              },
              li({ children }) {
                return <li className="my-1">{children}</li>;
              },
              p({ children }) {
                return <p className="my-2">{children}</p>;
              },
              h1({ children }) {
                return <h1 className="text-2xl font-bold my-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-xl font-bold my-3">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-lg font-bold my-2">{children}</h3>;
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-talentforge-400 hover:underline"
                  >
                    {children}
                  </a>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {children}
                  </td>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <button
          onClick={copyToClipboard}
          className={cn(
            "text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
            role === 'user' ? "mr-2" : "ml-2"
          )}
          aria-label="Copy message"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-talentforge-400 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-transparent light:drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              <GradientText
                colors={["#FAFBFD", "#F97316", "#889ACC", "#FFD8DB", "#C0CFE6"]}
                animationSpeed={3}
                showBorder={false}
                className="text-2xl sm:text-3xl font-bold"
              >
                Good evening, user
              </GradientText>
            </h2>
          </div>
          
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div className="relative mb-6 sm:mb-8">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full p-3 sm:p-4 rounded-lg bg-white/10 dark:bg-[#1D1D1F] backdrop-blur-md border-white/20 dark:border-[#2D2D2F] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-300 ease-in-out text-base hover:border-white/30 dark:hover:border-white/20 focus:border-white/40 dark:focus:border-white/30"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-talentforge-400 hover:bg-talentforge-500 active:scale-95 text-white rounded-full transition-all duration-300 ease-in-out hover:scale-110 touch-none"
              >
                <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 sm:px-6 py-2 rounded-full bg-white/10 dark:bg-[#1D1D1F] backdrop-blur-md border-white/20 dark:border-[#2D2D2F] text-center hover:bg-white/20 dark:hover:bg-[#2D2D2F] active:scale-95 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg touch-none animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="h-[calc(100vh-120px)] overflow-y-auto p-2 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {messages.map((message, index) => (
                <Message key={index} content={message.content} role={message.sender as 'user' | 'assistant'} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-2 justify-start animate-fade-in">
                  <div className="max-w-[88%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 bg-white/10 dark:bg-[#1D1D1F] backdrop-blur-md border-white/20 dark:border-[#2D2D2F] text-gray-800 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-talentforge-400 animate-pulse" />
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">AI is thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-2 sm:p-4 border-t border-white/10 dark:border-[#2D2D2F]">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full p-3 sm:p-4 rounded-lg bg-white/10 dark:bg-[#1D1D1F] backdrop-blur-md border-white/20 dark:border-[#2D2D2F] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-200 text-base"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-talentforge-400 hover:bg-talentforge-500 active:scale-95 text-white rounded-full transition-all duration-200 touch-none"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

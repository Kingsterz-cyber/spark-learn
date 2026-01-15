import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, X, Loader2, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  topicContext?: string;
}

const AITutorChat = ({ isOpen, onClose, topicContext }: AITutorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI tutor. Ask me anything about your studies, and I'll help you understand it better! 📚"
    }
  ]);
  const [input, setInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { askTutor, loading } = useAI();
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto fullscreen on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsFullscreen(true);
    }
  }, [isMobile, isOpen]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    const response = await askTutor(
      newMessages,
      profile?.grade_level || 'high_school',
      topicContext
    );

    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } else {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "I'm sorry, I couldn't process that. Please try again!" }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  // Determine chat dimensions based on fullscreen and mobile state
  const getChatClasses = () => {
    if (isFullscreen || isMobile) {
      return 'fixed inset-0 sm:inset-4 w-full sm:w-auto h-full sm:h-auto rounded-none sm:rounded-2xl';
    }
    return 'fixed bottom-4 right-4 w-[calc(100%-2rem)] sm:w-96 h-[70vh] sm:h-[600px] max-h-[calc(100vh-2rem)] rounded-2xl';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile fullscreen */}
          {(isFullscreen || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
            />
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${getChatClasses()} glass-panel-strong flex flex-col z-50 shadow-2xl border border-primary/20 safe-area-top safe-area-bottom`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">AI Tutor</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="tap-compact w-8 h-8 sm:w-10 sm:h-10"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="tap-compact w-8 h-8 sm:w-10 sm:h-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary/20'
                        : 'bg-gradient-primary'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-md'
                        : 'bg-muted text-foreground rounded-tl-md'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 sm:gap-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md px-3 py-2 sm:px-4 sm:py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-border safe-area-bottom">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-muted/50 text-sm sm:text-base h-10 sm:h-11"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-gradient-primary hover:opacity-90 h-10 sm:h-11 w-10 sm:w-11 p-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AITutorChat;

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Download, FileText, Calendar, Table, FileDigit, FilePieChart, X, Sparkles, Settings2, Cpu, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ModelSelector from './ModelSelector';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onUploadPdf: (file: File) => Promise<void>;
  onSummarize: () => Promise<void>;
  onQuickQA: (questionType: string) => Promise<void>;
  onDownload: () => Promise<void>;
  isLoading: boolean;
  hasPdf: boolean;
  messageRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  questionsCount: number;
  onViewQuestions: () => void;
  isQuestionsSidebarOpen: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onUploadPdf,
  onSummarize,
  onQuickQA,
  onDownload,
  isLoading,
  hasPdf,
  messageRefs,
  questionsCount,
  onViewQuestions,
  isQuestionsSidebarOpen,
}) => {
  const [input, setInput] = useState('');
  const [isQADropdownOpen, setIsQADropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qaDropdownRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
      // Reset the file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qaDropdownRef.current && !qaDropdownRef.current.contains(event.target as Node)) {
        setIsQADropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleQADropdown = () => {
    setIsQADropdownOpen(!isQADropdownOpen);
  };

  const handleQAOptionClick = (questionType: string) => {
    onQuickQA(questionType);
    setIsQADropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && hasPdf) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen w-full bg-white">
      {/* Messages container */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-gray-50/50 pt-2">
        <div className="w-full mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-gray-50/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Welcome to Manthan RFP</h3>
                <p className="text-gray-600 text-lg mb-6">How can I assist you today?</p>
                <p className="text-gray-500 text-sm">Upload a PDF document to start analyzing</p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg) => {
                // Create a ref callback for this message
                const setMessageRef = (el: HTMLDivElement | null) => {
                  messageRefs.current[msg.id] = el;
                };
                
                return (
                  <div 
                    key={msg.id}
                    className={`message-container ${msg.sender === 'bot' ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <div 
                      ref={setMessageRef}
                      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-16"
                    >
                      <MessageBubble message={msg} />
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="bg-gray-50/50">
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex mb-6">
                      <div className="max-w-[85%] md:max-w-[75%] px-4">
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center mr-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm min-w-[60px]">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-3" />
        </div>
      </div>

      {/* Enhanced Input area with modern design */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3">
              {/* Quick Actions Menu */}
              <button
                type="button"
                onClick={toggleQADropdown}
                disabled={isLoading}
                className={`p-2 text-gray-600 hover:bg-gray-100/80 
                  rounded-md transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  relative group flex-shrink-0 border border-gray-200
                  ${isQADropdownOpen ? 'bg-gray-100/80 text-indigo-600 border-indigo-200' : 'hover:text-indigo-600 hover:border-indigo-200'}`}
                aria-expanded={isQADropdownOpen}
                aria-haspopup="true"
                title="Quick Actions"
                ref={qaDropdownRef}
              >
                <Settings2 
                  size={18} 
                  className={`transform transition-all duration-300
                    ${isQADropdownOpen ? 'rotate-180' : 'group-hover:rotate-90'}`} 
                />
              </button>

              {/* File input and enhanced search input container */}
              <div className="flex-1 relative">
                <div className="relative flex items-center gap-2">
                  {/* File Upload Button */}
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      id="file-upload"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex p-3 bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white 
                        rounded-xl hover:from-emerald-600/90 hover:to-green-600/90 
                        shadow-sm hover:shadow-md transform hover:scale-[0.98]
                        transition-all duration-200 cursor-pointer relative overflow-hidden group
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload PDF"
                    >
                      <FileText size={20} className="transform group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                        opacity-0 group-hover:opacity-100 transition-opacity animate-shine" />
                    </label>
                  </div>
                  
                  {/* Enhanced Search Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={hasPdf ? "Ask a question about the document..." : "Upload a document to start chatting..."}
                      disabled={isLoading || !hasPdf}
                      className="w-full px-4 py-3 pr-24 bg-white/90 backdrop-blur-sm 
                        rounded-xl border-2 border-gray-200/60 
                        focus:border-blue-400/60 focus:ring-4 focus:ring-blue-400/10
                        shadow-sm hover:shadow placeholder-gray-400
                        disabled:opacity-75 disabled:cursor-not-allowed
                        transition-all duration-300"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {/* View Questions Button */}
                      <button
                        type="button"
                        onClick={onViewQuestions}
                        className={`p-2 text-gray-500 hover:text-indigo-500 rounded-lg transition-colors relative group
                          ${isQuestionsSidebarOpen ? 'bg-indigo-50/50 text-indigo-500' : ''}`}
                        title={isQuestionsSidebarOpen ? "Close questions" : "View your questions"}
                      >
                        {isQuestionsSidebarOpen ? (
                          <X size={20} className="transform transition-transform group-hover:scale-110" />
                        ) : (
                          <>
                            <MessageSquare size={20} className="transform transition-transform group-hover:rotate-12" />
                            {questionsCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-indigo-400/80 text-white text-xs 
                                font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                {questionsCount}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                      
                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading || !hasPdf}
                        className="p-2 text-gray-500 hover:text-blue-500
                          rounded-lg transition-all duration-200 
                          disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Send message"
                      >
                        <SendHorizontal 
                          size={20} 
                          className="transform group-hover:rotate-12 group-hover:scale-110 
                            transition-all duration-300" 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Selector - Moved outside the search box */}
              <div className="flex items-center text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-white/90 backdrop-blur-sm">
                <Cpu className="w-4 h-4 mr-2 text-gray-400" />
                <span className="mr-2 text-gray-500">Model:</span>
                <ModelSelector />
              </div>
            </div>

            {/* Quick Actions Dropdown */}
            {isQADropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
                  <button 
                    onClick={() => setIsQADropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Menu sections */}
                <div className="p-2">
                  {/* Summary Options */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 px-2">Summaries</h4>
                    <button
                      onClick={() => {
                        onSummarize();
                        setIsQADropdownOpen(false);
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <FileDigit size={16} className="text-blue-600" />
                      <span>Detailed Summary</span>
                    </button>
                    <button
                      onClick={() => {
                        onSendMessage("/Short Summary");
                        setIsQADropdownOpen(false);
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <FilePieChart size={16} className="text-green-600" />
                      <span>Short Summary</span>
                    </button>
                  </div>

                  {/* Extract Information */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 px-2">Extract Information</h4>
                    <button
                      onClick={() => {
                        handleQAOptionClick('dates');
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <Calendar size={16} className="text-blue-600" />
                      <span>Extract Dates</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQAOptionClick('table');
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <Table size={16} className="text-green-600" />
                      <span>Extract Table</span>
                    </button>
                  </div>

                  {/* Document Actions */}
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 px-2">Document Actions</h4>
                    <button
                      onClick={() => {
                        onDownload();
                        setIsQADropdownOpen(false);
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      disabled={isLoading}
                    >
                      <Download size={16} className="text-blue-600" />
                      <span>Download Document</span>
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-template-modal'));
                        setIsQADropdownOpen(false);
                      }}
                      className="w-full text-left mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <FileText size={16} className="text-purple-600" />
                      <span>Template Merge</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;


import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Download, FileText, Calendar, Table, FileDigit, FilePieChart, X, Sparkles, Plus, Cpu } from 'lucide-react';
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
}) => {
  const [input, setInput] = useState('');
  const [isQADropdownOpen, setIsQADropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qaDropdownRef = useRef<HTMLDivElement>(null);
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
      {/* Header with model selector */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold px-4">Chat</h2>
        <div className="flex items-center space-x-4 pr-4">
          <div className="flex items-center text-sm text-gray-600">
            <Cpu className="w-4 h-4 mr-2" />
            <span className="mr-2">Model:</span>
            <ModelSelector />
          </div>
          <button
            onClick={onDownload}
            disabled={!hasPdf || isLoading}
            className={`p-2 rounded-md ${!hasPdf || isLoading ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Download Summary"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
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

      {/* Input area */}
      <div className="relative bg-white border-t border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <form onSubmit={handleSubmit} className="relative shadow-sm rounded-xl border border-gray-200 bg-white">
            <div className="flex items-end">
              <div className="relative" ref={qaDropdownRef}>
                <button
                  type="button"
                  onClick={toggleQADropdown}
                  disabled={isLoading}
                  className="flex items-center justify-center h-12 w-12 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r"
                  aria-expanded={isQADropdownOpen}
                  aria-haspopup="true"
                  title="Actions"
                >
                  <Plus size={20} className="opacity-75" />
                </button>

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
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={hasPdf ? "Ask a question about the document..." : "Upload a document to start chatting..."}
                  disabled={isLoading || !hasPdf}
                  className="w-full h-12 px-4 focus:outline-none disabled:bg-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className="relative group">
                  <label
                    htmlFor="file-upload"
                    className={`p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Upload PDF"
                  >
                    <Paperclip size={20} />
                  </label>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                    bg-gray-900 text-white text-sm py-1.5 px-3 rounded-lg opacity-0 
                    group-hover:opacity-100 transition-opacity duration-200 shadow-lg 
                    pointer-events-none whitespace-nowrap z-50">
                    Upload PDF file
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                      border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !hasPdf}
                  className="h-12 px-4 text-blue-600 hover:bg-blue-50 rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Send message"
                >
                  <SendHorizontal 
                    size={20} 
                    className="transform group-hover:scale-110 transition-transform duration-200" 
                  />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useRef, useEffect } from "react";
import { Send, Globe } from 'lucide-react';
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// The main App component is the default export
export default function App() {
  const { user } = useUser();

  // Get user's preferred language from their profile, fallback to English
  const getUserLanguageCode = () => {
    if (user?.basic_info?.language?.code) {
      const langCode = user.basic_info.language.code;
      // Convert from language codes like "en-US" to "en", "hi-IN" to "hi"
      return langCode.split('-')[0].toLowerCase();
    }
    return "en"; // default english
  };

  // State initialization
  const [userLanguage, setUserLanguage] = useState(getUserLanguageCode());
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ref for auto-scrolling the chat history
  const messagesEndRef = useRef(null);

  // List of Indic languages and English
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "ta", label: "Tamil" },
    { code: "bn", label: "Bengali" },
    { code: "mr", label: "Marathi" },
    { code: "te", label: "Telugu" },
  ];

  // Update language when user profile loads
  useEffect(() => {
    if (user?.basic_info?.language?.code) {
      const langCode = user.basic_info.language.code.split('-')[0].toLowerCase();
      setUserLanguage(langCode);
    }
  }, [user]);

  // Effect to scroll to the bottom whenever chatHistory changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);


  /**
   * Sends the user message to the backend with user context for personalized responses.
   */
  const sendMessage = async () => {
    if (!userMessage.trim() || isLoading) return;

    const message = userMessage.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: message, lang: userLanguage }]);
    setUserMessage("");
    setIsLoading(true);

    try {
      // Prepare user context (chapters for travel recommendations)
      const userContext = user?.chapters ? { chapters: user.chapters } : null;

      // NOTE: Uses relative API path - handled by unified Express server
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the selected user language, message, and user context
        body: JSON.stringify({ 
          user_language: userLanguage, 
          message,
          user_context: userContext
        }),
      });

      if (!resp.ok) {
        throw new Error(`Server returned status ${resp.status}`);
      }

      const data = await resp.json();

      if (data.ai_response) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "ai", text: data.ai_response, lang: userLanguage },
        ]);
      } else if (data.error) {
        setChatHistory((prev) => [
          ...prev,
          { sender: "ai", text: `[Error]: ${data.error}`, lang: "en" },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: `[Network Error]: Could not reach server. (${err.message})`, lang: "en" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles 'Enter' key press for quick sending.
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  /**
   * Component for displaying a single chat bubble.
   */
  const ChatBubble = ({ sender, text, lang }) => {
    const isUser = sender === "user";
    const langLabel = languages.find(l => l.code === lang)?.label;

    return (
      <div className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[75%]`}>
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {isUser ? (
              <img
                src="https://avatar.iran.liara.run/public"
                alt="User Profile"
                className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-md object-cover"
              />
            ) : (
              <img
                src="/ai_bot.jpg"
                alt="AI Bot"
                className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-md object-cover"
              />
            )}
          </div>

          {/* Message Content */}
          <div className="flex flex-col">
            <div
              className={`px-4 py-3 rounded-2xl shadow-md transition-all duration-200 ${
                isUser
                  ? 'bg-indigo-600 rounded-tr-sm'
                  : 'bg-white border border-gray-200 rounded-tl-sm'
              }`}
            >
              <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${
                isUser ? 'text-black' : 'text-gray-800'
              }`}>{text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentLanguageLabel = languages.find(l => l.code === userLanguage)?.label;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat History Window - Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {chatHistory.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Globe className="w-10 h-10 text-white"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start a Multilingual Conversation
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Chat with AI in your preferred language
              </p>
              <p className="text-xs text-gray-400">
                Currently using: <span className="font-semibold text-indigo-600">{currentLanguageLabel}</span>
              </p>
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} lang={msg.lang} />
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="flex items-start gap-3 max-w-[75%]">
              <div className="flex-shrink-0">
                <img
                  src="/ai_bot.jpg"
                  alt="AI Bot"
                  className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-md object-cover"
                />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-md border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed Bottom Bar */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Select value={userLanguage} onValueChange={setUserLanguage}>
            <SelectTrigger className="w-[50px] h-[50px] rounded-full bg-gray-100 hover:bg-gray-200 border-0 p-0 flex items-center justify-center">
              <Globe className="w-5 h-5 text-gray-700" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              side="top"
              align="start"
              className="w-56"
              sideOffset={8}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 -m-1 mb-1 rounded-t-md">
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Select Chat Language
                </p>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Default: {user?.basic_info?.language?.name || "Hindi"}
                </p>
              </div>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Input Field */}
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 outline-none text-sm"
            placeholder={`Message in ${currentLanguageLabel}...`}
          />
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || !userMessage.trim()}
            className="p-3 bg-indigo-600 text-black rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Send message"
          >
            <Send className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
}
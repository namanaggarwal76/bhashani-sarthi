import React, { useState, useRef, useEffect } from "react";
import { Send, Globe } from 'lucide-react';

// The main App component is the default export
export default function App() {
  // State initialization
  const [userLanguage, setUserLanguage] = useState("hi"); // default Hindi
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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

  // Effect to scroll to the bottom whenever chatHistory changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);


  /**
   * Sends the user message to the FastAPI backend for translation and AI response.
   */
  const sendMessage = async () => {
    if (!userMessage.trim() || isLoading) return;

    const message = userMessage.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: message, lang: userLanguage }]);
    setUserMessage("");
    setIsLoading(true);
    setShowLanguageSelector(false); // Hide selector after sending

    try {
      // NOTE: Assumes the Python server is running locally on port 8000
      // This fetch call requires an external Python server to be running.
      const resp = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the selected user language and the message
        body: JSON.stringify({ user_language: userLanguage, message }),
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
        { sender: "ai", text: `[Network Error]: Could not reach server. Ensure FastAPI is running at http://localhost:8000. (${err.message})`, lang: "en" },
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
    const senderLabel = isUser ? "You" : "AI";
    const langLabel = languages.find(l => l.code === lang)?.label;

    return (
      <div className={`flex mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className="flex max-w-4/5">
          {!isUser && (
            <div className="w-8 h-8 mr-2 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-md flex-shrink-0">
              AI
            </div>
          )}
          <div
            className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.005] ${
              isUser
                ? 'bg-indigo-600 text-white rounded-br-md ml-auto'
                : 'bg-blue-50 text-gray-800 rounded-tl-md mr-auto border border-blue-200' // Changed bg-white to bg-blue-50 and border for clearer contrast
            }`}
          >
            <p className="text-sm break-words">{text}</p>
            <p className={`text-[10px] opacity-70 mt-1 ${isUser ? 'text-right text-indigo-200' : 'text-left text-gray-500'}`}>
              {langLabel} ({lang.toUpperCase()})
            </p>
          </div>
          {isUser && (
            <div className="w-8 h-8 ml-2 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full text-sm font-semibold shadow-md flex-shrink-0">
              You
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentLanguageLabel = languages.find(l => l.code === userLanguage)?.label;

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full md:max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col h-[90vh]">

        {/* Header - Fixed Top Bar */}
        <div className="p-4 border-b border-indigo-100 bg-indigo-600 rounded-t-3xl shadow-lg">
          <h1 className="text-xl font-bold text-white text-center">
            Indic Language Translator Chat
          </h1>
          <p className="text-xs text-indigo-200 text-center">
            Chatting in: <span className="font-semibold">{currentLanguageLabel} ({userLanguage.toUpperCase()})</span>
          </p>
        </div>

        {/* Chat History Window - Scrollable Area */}
        <div
          className="flex-grow overflow-y-auto p-5 space-y-4 bg-gray-50"
        >
          {chatHistory.length === 0 && (
            <div className="text-center pt-10">
              <Globe className="w-10 h-10 text-indigo-400 mx-auto mb-2"/>
              <p className="text-gray-500">
                Start a multilingual conversation!
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Your messages will be sent in {currentLanguageLabel}.
              </p>
            </div>
          )}
          {chatHistory.map((msg, idx) => (
            <ChatBubble key={idx} sender={msg.sender} text={msg.text} lang={msg.lang} />
          ))}
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-2 flex items-center justify-center bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-md flex-shrink-0">
                  AI
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl rounded-tl-md border border-blue-200 shadow-sm"> {/* Changed bg-white to bg-blue-50 and border */}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area + Language Selector - Fixed Bottom Bar */}
        <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl shadow-inner">
          <div className="flex items-end gap-2">
            
            {/* Language Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="p-3 bg-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-300 transition duration-150 flex items-center justify-center flex-shrink-0"
                aria-label="Change Language"
              >
                <Globe className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              {showLanguageSelector && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 p-2 transform origin-bottom transition-all duration-200 ease-out">
                  <p className="text-xs font-semibold text-gray-500 px-2 pt-1 pb-1 border-b mb-1">Select Input Language</p>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setUserLanguage(lang.code);
                        setShowLanguageSelector(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        userLanguage === lang.code
                          ? 'bg-indigo-500 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lang.label} ({lang.code.toUpperCase()})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-inner disabled:bg-gray-100 disabled:text-gray-500"
              placeholder={`Type in ${currentLanguageLabel} (e.g., नमस्ते)...`}
            />
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={isLoading || !userMessage.trim()}
              className="p-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-150 flex items-center justify-center transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Send className="w-5 h-5"/>
            </button>
          </div>

          <p className="mt-2 text-xs text-center text-gray-400">
              This app requires a **FastAPI server** running on `http://localhost:8000`.
          </p>
        </div>

      </div>
    </div>
  );
}

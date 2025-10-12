import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [showArrow, setShowArrow] = useState(false);
  
  // Array of "Sarthi" in all 12 languages
  const sarthiTexts = [
    "Sarthi",      // English
    "सारथी",       // Hindi
    "సారథి",       // Telugu
    "ಸಾರಥಿ",       // Kannada
    "सारथी",       // Marathi
    "ਸਾਰਥੀ",       // Punjabi
    "સારથી",       // Gujarati
    "ସାରଥୀ",       // Odia
    "সারথী",       // Bengali
    "സാരഥി",      // Malayalam
    "சாரதி",       // Tamil
    "سارتھی",      // Urdu
  ];
  
  const typingSpeed = 150; // ms per character
  const backspaceSpeed = 100; // ms per character when backspacing
  const pauseBeforeBackspace = 1500; // pause after typing complete word
  const pauseBeforeNextWord = 500; // pause before typing next word

  useEffect(() => {
    let currentLanguageIndex = 0;
    let currentCharIndex = 0;
    let isTyping = true;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      const currentWord = sarthiTexts[currentLanguageIndex];

      if (isTyping) {
        // Typing animation
        if (currentCharIndex <= currentWord.length) {
          setText(currentWord.slice(0, currentCharIndex));
          currentCharIndex++;
          timeoutId = setTimeout(animate, typingSpeed);
        } else {
          // Finished typing, pause then start backspacing
          if (currentLanguageIndex === 0) {
            // Show arrow after first word is typed
            setShowArrow(true);
          }
          timeoutId = setTimeout(() => {
            isTyping = false;
            animate();
          }, pauseBeforeBackspace);
        }
      } else {
        // Backspacing animation
        if (currentCharIndex > 0) {
          currentCharIndex--;
          setText(currentWord.slice(0, currentCharIndex));
          timeoutId = setTimeout(animate, backspaceSpeed);
        } else {
          // Finished backspacing, move to next language
          currentLanguageIndex = (currentLanguageIndex + 1) % sarthiTexts.length;
          isTyping = true;
          timeoutId = setTimeout(animate, pauseBeforeNextWord);
        }
      }
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleContinue = () => {
    navigate("/language");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight min-h-[5rem] md:min-h-[6rem] flex items-center justify-center">
          <span>{text}</span>
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 font-light opacity-0 animate-fade-in-delay">
          Your Travel Companion
        </p>
      </div>

      {/* Arrow indicator */}
      {showArrow && (
        <button
          onClick={handleContinue}
          className="absolute bottom-12 animate-bounce cursor-pointer group"
          aria-label="Continue to language selection"
        >
          <div className="flex flex-col items-center gap-2">
            <ChevronDown className="w-12 h-12 text-white group-hover:text-blue-200 transition-colors" />
            <span className="text-white text-sm opacity-75 group-hover:opacity-100">
              Continue
            </span>
          </div>
        </button>
      )}

      <style>{`
        @keyframes fade-in-delay {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 1s forwards;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

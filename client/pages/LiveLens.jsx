 import React, { useRef, useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function LiveLensOCR() {
  const { user } = useUser();
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  const [selector, setSelector] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startRef = useRef(null);
  const [ocrText, setOcrText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraError(null);
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        setCameraError(err.message || "Unable to access camera");
      });
  }, []);

  // Pointer handlers
  const onPointerDown = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startRef.current = { x, y };
    setIsSelecting(true);
    setSelector(null);
    setOcrText("");
    setExpandedInfo(null);
    setShowMore(false);
  };

  const onPointerMove = (e) => {
    if (!isSelecting || !startRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelector({
      x: Math.min(startRef.current.x, x),
      y: Math.min(startRef.current.y, y),
      w: Math.abs(x - startRef.current.x),
      h: Math.abs(y - startRef.current.y),
    });
  };

  const onPointerUp = () => {
    setIsSelecting(false);
    startRef.current = null;
  };

  // Capture & OCR
  useEffect(() => {
    if (!selector || !videoRef.current || isSelecting) return;

    const timer = setTimeout(async () => {
      if (selector.w < 10 || selector.h < 10) return;
      setIsLoading(true);
      setOcrText("Capturing...");

      const hiddenCanvas =
        hiddenCanvasRef.current || (hiddenCanvasRef.current = document.createElement("canvas"));
      hiddenCanvas.width = selector.w;
      hiddenCanvas.height = selector.h;
      const ctx = hiddenCanvas.getContext("2d");

      const video = videoRef.current;
      const overlay = overlayRef.current;

      const sx = (selector.x / overlay.clientWidth) * video.videoWidth;
      const sy = (selector.y / overlay.clientHeight) * video.videoHeight;
      const sw = (selector.w / overlay.clientWidth) * video.videoWidth;
      const sh = (selector.h / overlay.clientHeight) * video.videoHeight;

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

      hiddenCanvas.toBlob(async (blob) => {
        if (!blob) return setIsLoading(false);

        const formData = new FormData();
        formData.append("file", blob, "capture.png");

        try {
          const userLanguage = user?.language || "en";
          formData.append("latitude", "0");
          formData.append("longitude", "0");
          formData.append("target_language", userLanguage);
          formData.append("location_info", "");
          
          const resp = await fetch("/api/start_image_session", {
            method: "POST",
            body: formData,
          });
          
          // Check if response is ok
          if (!resp.ok) {
            const errorText = await resp.text();
            console.error("OCR server error:", resp.status, errorText);
            setOcrText(`[Server Error: ${resp.status}]\nThe OCR backend encountered an error.`);
            setIsLoading(false);
            return;
          }
          
          // Check if response has content
          const text = await resp.text();
          if (!text) {
            console.error("OCR server returned empty response");
            setOcrText("[Empty Response]\nThe OCR server is running but returned no data.");
            setIsLoading(false);
            return;
          }
          
          // Try to parse JSON
          let json;
          try {
            json = JSON.parse(text);
          } catch (parseError) {
            console.error("JSON parse error:", parseError, "Response:", text);
            setOcrText(`[JSON Parse Error]\nServer response: ${text.substring(0, 200)}`);
            setIsLoading(false);
            return;
          }
          
          setOcrText(json.ocr_text || "[OCR failed]");
          setSessionId(json.session_id);
          setExpandedInfo({
            place_name: json.place_name,
            description_english: json.description_english,
            description_translated: json.description_translated,
            target_language: json.target_language,
          });
        } catch (err) {
          console.error("OCR request error:", err);
          setOcrText(`[OCR Error]\n${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }, "image/png");
    }, 500);

    return () => clearTimeout(timer);
  }, [selector, isSelecting]);

  // Canvas overlay
  useEffect(() => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const draw = () => {
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (selector) {
        ctx.strokeStyle = isLoading ? "yellow" : "lime";
        ctx.lineWidth = 2;
        ctx.strokeRect(selector.x, selector.y, selector.w, selector.h);

        const textToDisplay = isLoading ? "Processing..." : ocrText || "Selection active...";
        ctx.fillStyle = isLoading ? "orange" : "red";
        ctx.font = `${Math.max(selector.h / 8, 16)}px sans-serif`;
        textToDisplay.split("\n").forEach((line, idx) => {
          ctx.fillText(line, selector.x + 5, selector.y + selector.h + 20 + idx * 20);
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [selector, ocrText, isLoading]);

  if (cameraError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
        <p className="text-gray-600 mb-4">{cameraError}</p>
        <p className="text-sm text-gray-500">Please enable camera permissions in your browser settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full border-2 border-gray-300 rounded-lg"
          playsInline
          muted
        />
        <canvas
          ref={overlayRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            onPointerDown({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onPointerUp();
          }}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">OCR Output</h3>
        <textarea
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          value={ocrText || "Select a text region to extract..."}
          readOnly
        />
        
        {expandedInfo && (
          <div className="space-y-3">
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
            >
              {showMore ? "Hide Details" : "View More Details"}
            </button>
            
            {showMore && (
              <div className="bg-gray-50 rounded-md p-4 space-y-3 border border-gray-200">
                <div>
                  <span className="font-semibold text-gray-900">Place Name:</span>
                  <p className="text-gray-700 mt-1">{expandedInfo.place_name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Target Language:</span>
                  <p className="text-gray-700 mt-1">{expandedInfo.target_language}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Description (English):</span>
                  <p className="text-gray-700 mt-1">{expandedInfo.description_english}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Description (Translated):</span>
                  <p className="text-gray-700 mt-1">{expandedInfo.description_translated}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
 
import React, { useRef, useState, useEffect } from "react";
import { Camera, MousePointer2, Loader, Zap } from 'lucide-react'; 

// The main App component is the default export
export default function App() { 
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const hiddenCanvasRef = useRef(null); // Used for cropping the image before sending to OCR

  // State for selection area
  const [selector, setSelector] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startRef = useRef(null);

  // State for OCR result, loading, and camera errors
  const [ocrText, setOcrText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // State to hold the dynamically rendered size of the video element for canvas alignment
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  /**
   * Resizes the canvas drawing surface to match the video element's displayed size.
   * This is CRUCIAL for the AR overlay (drawing) and ensures mouse/touch coordinates map correctly.
   */
  const updateCanvasDimensions = () => {
    if (videoRef.current && overlayRef.current) {
      const video = videoRef.current;
      const canvas = overlayRef.current;
      const width = video.clientWidth;
      const height = video.clientHeight;

      // Update state for responsiveness
      setVideoDimensions({ width, height });

      // Set canvas drawing surface resolution to match display size (Fixes AR overlay misalignment)
      canvas.width = width;
      canvas.height = height;
    }
  };

  // --- Effects ---

  // 1. Start camera and handle initial sizing (Modified for camera fallback logic)
  useEffect(() => {
    let currentStream = null;
    
    const attemptCameraAccess = async () => {
      setCameraError(null);
      const video = videoRef.current;
      if (!video) return;

      const constraints = [
        { video: { facingMode: "environment" }, audio: false }, // Priority 1: Back camera
        { video: { facingMode: "user" }, audio: false }        // Priority 2: Front camera (fallback)
      ];

      for (const constraint of constraints) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraint);
          
          // Success: Set up the video and stream reference
          video.srcObject = stream;
          await video.play(); 

          // Capture the stream for cleanup
          currentStream = stream;
          
          video.onloadedmetadata = () => {
            updateCanvasDimensions();
            window.addEventListener('resize', updateCanvasDimensions);
          };
          
          console.info(`Successfully started camera with facing mode: ${constraint.video.facingMode}`);
          return; // Exit the function on success
        } catch (e) {
          console.warn(`Camera access failed for mode ${constraint.video.facingMode}:`, e);
          // Continue to the next constraint
        }
      }

      // If loop completes without returning (success)
      setCameraError("Cannot access camera. No suitable camera found or access was denied.");
    };

    attemptCameraAccess();
      
    // Cleanup function: stop camera stream and remove resize listener
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log("Camera stream stopped.");
      }
    };
  }, []); // Empty dependency array, runs once on mount

  // 2. Pointer/Touch handlers
  const onPointerDown = (e) => {
    e.preventDefault();
    if (!overlayRef.current || isLoading) return;
    const rect = overlayRef.current.getBoundingClientRect();
    
    // Normalize coordinates for mouse or touch
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    startRef.current = { x, y };
    setIsSelecting(true);
    setSelector(null);
    setOcrText("");
  };

  const onPointerMove = (e) => {
    if (!isSelecting || !startRef.current || !overlayRef.current) return;
    
    // Use the coordinates from the initial pointer down event
    const rect = overlayRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate selection rectangle
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
    // The useEffect below will handle the capture logic if selector is valid
  };
  
  // Combine touch and mouse handlers for simplicity in the render function
  const interactionProps = {
    onTouchStart: onPointerDown,
    onTouchMove: onPointerMove,
    onTouchEnd: onPointerUp,
    onTouchCancel: onPointerUp,
    onMouseDown: onPointerDown,
    onMouseMove: onPointerMove,
    onMouseUp: onPointerUp,
  };


  // 3. Capture and send to backend OCR
  useEffect(() => {
    // Only run if selection finished AND we have a selector
    if (isSelecting || !selector || !videoRef.current || isLoading) return;

    const timer = setTimeout(async () => {
      // Minimum size check
      if (selector.w < 20 || selector.h < 20) {
        setOcrText("Area too small. Select a larger region.");
        setIsLoading(false); // Ensure loading state is false if we return early
        return;
      }

      setIsLoading(true);
      setOcrText("Capturing and sending for OCR...");

      const hiddenCanvas = hiddenCanvasRef.current;
      const video = videoRef.current;

      // Calculate scaling factor between display size and video intrinsic size (CRUCIAL for correct crop)
      const videoIntrinsicWidth = video.videoWidth;
      const videoIntrinsicHeight = video.videoHeight;
      const displayWidth = videoDimensions.width;
      const displayHeight = videoDimensions.height;

      const scaleX = videoIntrinsicWidth / displayWidth;
      const scaleY = videoIntrinsicHeight / displayHeight;
      
      // Calculate source crop area (sx, sy, sw, sh) on the intrinsic video stream
      const sx = selector.x * scaleX;
      const sy = selector.y * scaleY;
      const sw = selector.w * scaleX;
      const sh = selector.h * scaleY;

      // Set hidden canvas dimensions to match intrinsic cropped area
      hiddenCanvas.width = sw;
      hiddenCanvas.height = sh;

      const ctx = hiddenCanvas.getContext("2d");

      // Draw the cropped area of the video onto the hidden canvas
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

      // Send to backend
      hiddenCanvas.toBlob(async (blob) => {
        if (!blob) {
          setIsLoading(false);
          setOcrText("[Capture failed: Could not create image blob.]");
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "capture.png");

        try {
          // NOTE: Assumes the Python server is running locally on port 8000
          const resp = await fetch("http://localhost:8000/ocr", {
            method: "POST",
            body: formData,
          });
          
          if (!resp.ok) {
             const errorData = await resp.json().catch(() => ({ message: 'Unknown server error' }));
             throw new Error(`Server status ${resp.status}: ${errorData.message || 'Check server logs.'}`);
          }
          
          const json = await resp.json();

          const recognizedText = json.text && json.text.trim() ? json.text : "[No text detected in selected area.]";
          setOcrText(recognizedText);
        } catch (err) {
          console.error("OCR request error:", err);
          setOcrText(`[OCR request failed]: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }, "image/png");
    }, 200); // 200ms delay after mouse up/touch end

    return () => clearTimeout(timer);
  }, [selector, isSelecting, isLoading, videoDimensions]); 

  // 4. AR Overlay rendering (runs continuously to update the UI)
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf;

    const draw = () => {
      // Clear canvas based on its current size (which is matched to video client size)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (selector) {
        // --- 1. Draw Selection Rectangle ---
        ctx.strokeStyle = isLoading ? "#ff9800" : "#4caf50"; // Orange when loading, Green when static
        ctx.lineWidth = 3;
        // Draw using the mouse coordinates (1:1 with canvas size)
        ctx.strokeRect(selector.x, selector.y, selector.w, selector.h);
        
        // --- 2. Draw Text Overlay (AR) ---
        const textToDisplay = isLoading ? "Processing..." : (ocrText || "Release mouse/finger to capture...");
        
        // Styling constants
        const lineHeight = 24;
        const padding = 8;
        const textLines = textToDisplay.split("\n");
        const boxHeight = textLines.length * lineHeight + 2 * padding;
        const textX = selector.x;
        const textY = selector.y + selector.h;

        // Draw a semi-transparent background for readability
        // Maximum width is capped at 400px or selector width
        const maxTextWidth = Math.max(selector.w, 200);

        ctx.fillStyle = "rgba(49, 46, 129, 0.9)"; // Tailwind indigo-700 with high opacity
        ctx.fillRect(textX, textY, maxTextWidth + 2 * padding, boxHeight);

        // Draw text
        ctx.fillStyle = "white";
        ctx.font = `16px Inter, sans-serif`; 
        
        textLines.forEach((line, idx) => {
          ctx.fillText(line, textX + padding, textY + padding + lineHeight * (idx + 0.8));
        });
      }
      
      raf = requestAnimationFrame(draw);
    };

    // Only start the loop if dimensions are known
    if (videoDimensions.width > 0) {
        raf = requestAnimationFrame(draw);
    }
    
    return () => cancelAnimationFrame(raf);
  }, [selector, ocrText, isLoading, videoDimensions]);

  // Main Render Structure (Modern UI with Tailwind)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 space-y-6">
        
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 flex items-center justify-center border-b pb-2">
          <Zap className="w-7 h-7 mr-2 text-yellow-500" /> Live Lens OCR
        </h1>
        <p className="text-sm text-center text-gray-500">
          Use your finger or mouse to **click and drag** a rectangle over the text in the live feed.
        </p>
        
        {cameraError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded-xl text-center font-medium shadow-md">
            <p className="font-bold mb-1">Camera Access Error</p>
            <p className="text-sm">{cameraError}</p>
          </div>
        ) : (
          <div 
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xl border-4 border-indigo-500 bg-black"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              // Ensure video metadata is loaded before trying to size the canvas
              onLoadedMetadata={updateCanvasDimensions} 
            />
            
            {/* Overlay Canvas - Positioned absolutely over the video */}
            <canvas
              ref={overlayRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              {...interactionProps}
            />
            
            {/* Selection Area Helper Text (for UX feedback) */}
            {isSelecting && selector && (
              <div 
                className="absolute text-xs text-white bg-indigo-600 px-3 py-1 rounded-full pointer-events-none shadow-lg z-10"
                style={{ 
                    top: selector.y + selector.h + 5, 
                    left: selector.x,
                    // Use CSS transform to ensure it doesn't clip the edge
                    transform: `translateX(-50%)`,
                }}
              >
                <MousePointer2 className="w-3 h-3 inline mr-1"/> Selecting...
              </div>
            )}

            {/* Hidden Canvas - Used only for image capture, not rendered */}
            <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

          </div>
        )}
        
        {/* Results Panel */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-inner">
          <h3 className="text-lg font-bold text-indigo-800 flex items-center mb-2">
            {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin text-orange-500" /> : <Camera className="w-5 h-5 mr-2 text-indigo-600" />} 
            Recognized Text Output
          </h3>
          <p className={`mt-2 p-3 min-h-[5rem] text-sm rounded-lg border-2 border-dashed transition-all duration-300 ${
            isLoading 
              ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
              : ocrText
                ? 'bg-white border-green-200 text-gray-800' 
                : 'bg-gray-100 border-gray-300 text-gray-400 italic'
          } whitespace-pre-wrap shadow-md`}>
            {ocrText || (cameraError ? "Fix camera access error to start." : "Detected text will appear here after you select a region.")}
          </p>
        </div>
        
        <div className="text-xs text-center text-gray-400 pt-2 border-t">
          **Backend Requirement**: This app requires a **FastAPI server** running on `http://localhost:8000/ocr` to process the image and perform OCR.
        </div>
      </div>
    </div>
  );
}

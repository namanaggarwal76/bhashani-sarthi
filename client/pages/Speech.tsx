import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
<<<<<<< HEAD
import { useUser } from "@/context/UserContext";
import { useEffect, useRef, useState } from "react";

export default function Speech() {
  const { t } = useUser();
  const [recording, setRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordedBuffersRef = useRef<Float32Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup audio nodes on unmount
    return () => {
      if (processorRef.current) {
        try { processorRef.current.disconnect(); } catch {}
      }
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
      if (audioUrlRef.current) {
        try { URL.revokeObjectURL(audioUrlRef.current); } catch {}
        audioUrlRef.current = null;
      }
      if (audioRef.current) {
        try { audioRef.current.src = ''; } catch {}
      }
    };
  }, []);

  const startRecording = async () => {
    setResult(null);
    recordedBuffersRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ac: AudioContext = new AudioCtx();
      audioContextRef.current = ac;
      mediaStreamRef.current = stream;

      const source = ac.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = ac.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (ev: AudioProcessingEvent) => {
        const inputBuffer = ev.inputBuffer.getChannelData(0);
        // copy to Float32Array
        recordedBuffersRef.current.push(new Float32Array(inputBuffer));
      };

      // connect nodes, use a zero-gain to avoid audible feedback
      const gain = ac.createGain();
      gain.gain.value = 0;
      source.connect(processor);
      processor.connect(gain);
      gain.connect(ac.destination);

      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecordingAndUpload = async () => {
    if (!audioContextRef.current) return;
    setRecording(false);

    // stop tracks
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());

    // disconnect nodes
    if (processorRef.current) try { processorRef.current.disconnect(); } catch {}
    if (sourceRef.current) try { sourceRef.current.disconnect(); } catch {}

    const ac = audioContextRef.current;
    const buffers = recordedBuffersRef.current;
    const sampleRate = ac.sampleRate;

    // merge buffers
    let totalLen = 0;
    for (const b of buffers) totalLen += b.length;
    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (const b of buffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    // encode WAV (16-bit PCM)
    const wavBlob = encodeWAV(merged, sampleRate);

    // cleanup audio context
    try { await ac.close(); } catch {}
    audioContextRef.current = null;
    mediaStreamRef.current = null;
    sourceRef.current = null;
    processorRef.current = null;
    recordedBuffersRef.current = [];

    const form = new FormData();
    form.append('audio', wavBlob, 'recording.wav');

    setLoading(true);
    try {
      const resp = await fetch('/api/speech/pipeline', { method: 'POST', body: form });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Upload failed');
      }
      const data = await resp.json();
      // revoke previous object URL if any
      if (audioUrlRef.current) {
        try { URL.revokeObjectURL(audioUrlRef.current); } catch {}
        audioUrlRef.current = null;
      }
      setResult(data);

      if (data.audio_base64) {
        const audioBlob = b64toBlob(data.audio_base64, 'audio/wav');
        const url = URL.createObjectURL(audioBlob);
        audioUrlRef.current = url;
        if (audioRef.current) {
          audioRef.current.src = url;
          // auto-play a bit after setting src to ensure controls update
          try { audioRef.current.play().catch(() => {}); } catch {}
        }
      }
    } catch (err) {
      console.error(err);
      setResult({ error: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  function encodeWAV(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */ writeString(view, 0, 'RIFF');
    /* file length */ view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */ writeString(view, 8, 'WAVE');
    /* format chunk identifier */ writeString(view, 12, 'fmt ');
    /* format chunk length */ view.setUint32(16, 16, true);
    /* sample format (raw) */ view.setUint16(20, 1, true);
    /* channel count */ view.setUint16(22, 1, true);
    /* sample rate */ view.setUint32(24, sampleRate, true);
    /* byte rate (sampleRate * blockAlign) */ view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */ view.setUint16(32, 2, true);
    /* bits per sample */ view.setUint16(34, 16, true);
    /* data chunk identifier */ writeString(view, 36, 'data');
    /* data chunk length */ view.setUint32(40, samples.length * 2, true);

    // write the PCM samples
    floatTo16BitPCM(view, 44, samples);

    return new Blob([view], { type: 'audio/wav' });
  }

  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      output.setInt16(offset, s, true);
    }
  }

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

=======
import { useTranslation } from "react-i18next";

export default function Speech() {
  const { t } = useTranslation();
>>>>>>> origin/main
  return (
    <div className="min-h-screen pb-28 bg-transparent">
      <Header />
<<<<<<< HEAD
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">{t('speech')}</h1>
        <p className="text-sm text-gray-900">Real-time speech-to-speech translation via API.</p>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              className={`rounded-full px-4 py-2 ${recording ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'}`}
              onClick={() => (recording ? stopRecordingAndUpload() : startRecording())}
            >
              {recording ? 'Stop & Translate' : 'Record'}
            </button>
            <span className="text-sm text-gray-700">{recording ? 'Recording...' : 'Press Record and speak'}</span>
            {loading && <span className="text-sm text-gray-700">Processing...</span>}
          </div>

          {result && (
                <div className="rounded-lg border bg-card/80 p-4">
                  {result.error && <div className="text-red-600">Error: {String(result.error)}</div>}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-sm">Detected</h4>
                      <div className="mt-1 rounded-md bg-white/90 p-3 text-sm text-gray-900">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{result.source_language?.toUpperCase() ?? '—'}</div>
                          {/* small helper */}
                          <div className="text-xs text-gray-600">Language code</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Recognized</h4>
                      <div className="mt-1 rounded-md bg-white/90 p-3 text-sm text-gray-900">
                        <div className="flex items-start justify-between gap-3">
                          <div className="whitespace-pre-wrap break-words">{result.recognized_text ?? '—'}</div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              className="text-xs text-indigo-600 hover:underline"
                              onClick={() => { navigator.clipboard?.writeText(result.recognized_text ?? ''); }}
                            >Copy</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-sm">Translated</h4>
                    <div className="mt-1 rounded-md bg-white/90 p-3 text-sm text-gray-900">
                      <div className="flex items-start justify-between gap-3">
                        <div className="whitespace-pre-wrap break-words">{result.translated_text ?? '—'}</div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            className="text-xs text-indigo-600 hover:underline"
                            onClick={() => { navigator.clipboard?.writeText(result.translated_text ?? ''); }}
                          >Copy</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.audio_base64 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm">Translated audio</h4>
                      <div className="mt-2 flex items-center gap-3">
                        <audio controls ref={audioRef} className="w-full rounded-md bg-black/5" />
                        <div className="flex flex-col gap-2">
                          <button
                            className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white"
                            onClick={() => {
                              try {
                                const blob = b64toBlob(result.audio_base64, 'audio/wav');
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = 'translated_output.wav';
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                              } catch (e) { console.error(e); }
                            }}
                          >Download</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
        </div>
=======
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-2">
        <h1 className="text-xl font-semibold">{t("speech.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("speech.description")}
        </p>
>>>>>>> origin/main
      </main>
      <BottomNav />
    </div>
  );
}



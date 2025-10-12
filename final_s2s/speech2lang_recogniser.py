import os
import sys
import glob
import tempfile
from collections import Counter
from typing import Optional, Tuple, Dict, Any, List

from pydub import AudioSegment

# Map language codes to readable names
LANGUAGE_MAP: Dict[str, str] = {
    "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "kn": "Kannada",
    "ml": "Malayalam", "gu": "Gujarati", "mr": "Marathi", "bn": "Bengali",
    "or": "Odia", "pa": "Punjabi", "as": "Assamese", "ur": "Urdu",
    "en": "English"
}

_FW_MODELS: Dict[str, Any] = {}  # cache by model key (size+compute+device)
MAX_SECONDS = int(os.getenv("LANGID_MAX_SECONDS", "20"))
CONF_THRESHOLD = float(os.getenv("LANGID_CONF_THRESHOLD", "0.80"))
CONF_THRESHOLD_HIGH = float(os.getenv("LANGID_CONF_THRESHOLD_HIGH", "0.92"))
PRIMARY_MODEL = os.getenv("FASTER_WHISPER_MODEL", "small")
PRIMARY_COMPUTE = os.getenv("FASTER_WHISPER_COMPUTE", "int8")
FALLBACK_MODEL = os.getenv("FASTER_WHISPER_MODEL_FALLBACK", "large-v2")
FALLBACK_COMPUTE = os.getenv("FASTER_WHISPER_COMPUTE_FALLBACK", "int8_float32")
FW_DEVICE = os.getenv("FASTER_WHISPER_DEVICE", "cpu")  # set to 'cuda' if you have GPU
FAST_BEAM = int(os.getenv("LANGID_FAST_BEAM", "1"))
SLOW_BEAM = int(os.getenv("LANGID_SLOW_BEAM", "5"))


def _get_fw_model(model_size: str, compute_type: str):
    """Lazily initialize and cache the faster-whisper model (CPU-friendly)."""
    key = f"{model_size}:{compute_type}:{FW_DEVICE}"
    if key not in _FW_MODELS:
        try:
            from faster_whisper import WhisperModel  # type: ignore
        except Exception as e:
            raise ImportError(
                "Language ID requires faster-whisper. Install it with: pip install faster-whisper"
            ) from e

        # Try requested compute_type first, then fall back to CPU-safe options
        tried: list[str] = []
        candidates = [compute_type]
        # Allow env override of candidate list, comma-separated
        env_try = os.getenv("FASTER_WHISPER_COMPUTE_TRY", "")
        if env_try:
            candidates.extend([ct.strip() for ct in env_try.split(",") if ct.strip()])
        # Always append safe CPU options
        for ct in ["int8", "int8_float32", "float32"]:
            if ct not in candidates:
                candidates.append(ct)

        created = None
        used_key = key
        for ct in candidates:
            try:
                created = WhisperModel(model_size, device=FW_DEVICE, compute_type=ct)
                used_key = f"{model_size}:{ct}:{FW_DEVICE}"
                break
            except Exception as e:
                tried.append(ct)
                last_err = e
        if created is None:
            raise RuntimeError(
                f"Failed to initialize faster-whisper model '{model_size}' with compute types {tried}."
            ) from last_err  # type: ignore[name-defined]

        # Cache under the compute type actually used, and also alias the requested key
        _FW_MODELS[used_key] = created
        _FW_MODELS[key] = created
    return _FW_MODELS[key]


def _detect_lang_single(model, wav_path: str, beam: int) -> Tuple[str, float]:
    _segments, info = model.transcribe(
        wav_path,
        beam_size=beam,
        vad_filter=True,
        without_timestamps=True,
    )
    lang_code = getattr(info, "language", None)
    prob = float(getattr(info, "language_probability", 0.0) or 0.0)
    if not lang_code:
        raise RuntimeError("Language detection failed (no language reported)")
    return lang_code, prob


def convert_to_wav(input_path: str) -> str:
    """Converts any audio file to 16kHz mono 16-bit PCM WAV for Whisper.

    Returns a path to a temporary .wav file. Caller is responsible to delete it.
    """
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Audio file not found: {input_path}")

    try:
        audio = AudioSegment.from_file(input_path)
    except Exception as e:
        raise RuntimeError(
            "Failed to read audio. Ensure ffmpeg is installed and the file is a supported format."
        ) from e

    # Enforce <= MAX_SECONDS duration by trimming if necessary
    if audio.duration_seconds and audio.duration_seconds > MAX_SECONDS:
        audio = audio[: int(MAX_SECONDS * 1000)]
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)  # 16-bit PCM
    tmp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    audio.export(tmp_wav.name, format="wav")
    return tmp_wav.name

def detect_language(audio_path: str) -> Tuple[str, str]:
    """Detect the spoken language of an audio file.

    Returns: (lang_code, lang_name)
    """
    wav_path = None
    try:
        # Convert input to WAV (works for mp3/m4a/flac/etc.)
        wav_path = convert_to_wav(audio_path)
        
        # Detect language adaptively to reduce latency
        model = _get_fw_model(PRIMARY_MODEL, PRIMARY_COMPUTE)

        # Quick central-window check (3s) with small beam for speed
        try:
            audio = AudioSegment.from_file(wav_path)
        except Exception:
            audio = None

        if audio and len(audio) > 3500:
            total_ms = len(audio)
            center = total_ms // 2
            start = max(0, center - 1500)
            seg = audio[start : min(start + 3000, total_ms)]
            quick_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
            seg.export(quick_path, format="wav")
            try:
                lc_quick, p_quick = _detect_lang_single(model, quick_path, beam=FAST_BEAM)
            finally:
                if os.path.exists(quick_path):
                    try:
                        os.remove(quick_path)
                    except OSError:
                        pass

            if p_quick >= CONF_THRESHOLD_HIGH:
                lang_code = lc_quick
            else:
                # Multi-window voting with small beam
                lang_votes: List[str] = []
                probs: List[float] = []
                segment_paths: List[str] = []

                window_ms = 3000
                starts = []
                # two windows: start and near end
                starts.append(0)
                if total_ms > window_ms:
                    starts.append(max(0, total_ms - window_ms))

                for s in starts:
                    seg = audio[s : min(s + window_ms, total_ms)]
                    seg_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
                    seg.export(seg_path, format="wav")
                    segment_paths.append(seg_path)

                try:
                    for sp in segment_paths:
                        lc, p = _detect_lang_single(model, sp, beam=FAST_BEAM)
                        lang_votes.append(lc)
                        probs.append(p)
                finally:
                    for sp in segment_paths:
                        if os.path.exists(sp):
                            try:
                                os.remove(sp)
                            except OSError:
                                pass

                if not lang_votes:
                    raise RuntimeError("Language detection failed (no segments processed)")

                winner, _ = Counter(lang_votes).most_common(1)[0]
                avg_prob = sum(p for l, p in zip(lang_votes, probs) if l == winner) / max(1, sum(1 for l in lang_votes if l == winner))
                lang_code = winner

                # If still low confidence, run fallback model once on full clip, slower beam
                if avg_prob < CONF_THRESHOLD and FALLBACK_MODEL:
                    try:
                        model_fb = _get_fw_model(FALLBACK_MODEL, FALLBACK_COMPUTE)
                        lang_code, _ = _detect_lang_single(model_fb, wav_path, beam=SLOW_BEAM)
                    except Exception:
                        pass
        else:
            # Very short clip: single pass
            lang_code, _ = _detect_lang_single(model, wav_path, beam=FAST_BEAM)
        # Type guard for static checkers
        assert isinstance(lang_code, str)
        lang_name = LANGUAGE_MAP.get(lang_code, lang_code)
        return lang_code, lang_name
    finally:
        # Clean up temporary file
        if wav_path and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except OSError:
                pass

if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else input("Enter path to audio file (<20s): ").strip()
    # Expand globs like *.mp3 and pick the first match
    matches = sorted(glob.glob(arg)) or [arg]
    path = matches[0]
    try:
        code, name = detect_language(path)
        print(f"{name} ({code})")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

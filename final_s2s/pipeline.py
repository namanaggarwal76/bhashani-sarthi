"""
ASR → MT → TTS Pipeline
Full speech-to-speech translation pipeline using Bhashini API.
Processes audio files, translates text, and generates translated speech.
"""

import os
import time
from typing import Optional
from pydub import AudioSegment
from asr import asr_inference
from mt import translate_text
from tts import tts_inference
from speech2lang_recogniser import detect_language


def trim_audio(audio_path: str, max_duration_sec: int = 15) -> str:
    """
    Trim audio file to maximum duration if it exceeds the limit.
    
    Args:
        audio_path: Path to input audio file
        max_duration_sec: Maximum duration in seconds (default: 15)
    
    Returns:
        Path to trimmed audio file (or original if within limit)
    """
    try:
        # Load audio file
        audio = AudioSegment.from_wav(audio_path)
        duration_sec = len(audio) / 1000.0  # Convert ms to seconds
        
        if duration_sec <= max_duration_sec:
            print(f"Audio duration: {duration_sec:.2f}s (within {max_duration_sec}s limit)")
            return audio_path
        
        # Trim to first max_duration_sec seconds
        print(f"Audio duration: {duration_sec:.2f}s (exceeds {max_duration_sec}s limit)")
        print(f"Trimming to first {max_duration_sec} seconds...")
        
        trimmed_audio = audio[:max_duration_sec * 1000]  # Convert seconds to ms
        
        # Save trimmed audio with new filename
        base, ext = os.path.splitext(audio_path)
        trimmed_path = f"{base}_trimmed{ext}"
        trimmed_audio.export(trimmed_path, format="wav")
        
        print(f"Trimmed audio saved to: {trimmed_path}")
        return trimmed_path
        
    except Exception as e:
        raise RuntimeError(f"Failed to trim audio: {e}")


def run_pipeline(
    audio_path: str,
    target_lang: str,
    source_lang: Optional[str] = None,
    output_audio_path: str = "translated_output.wav",
    gender: str = "female",
    speed: float = 1.0,
    max_audio_duration: int = 15
):
    """
    Run full ASR → MT → TTS pipeline for speech-to-speech translation.
    
    Args:
        audio_path: Path to input WAV audio file
        target_lang: Target language code ('en', 'hi', 'ta', etc.)
        source_lang: Source language code ('hi', 'en', 'te', etc.). If None, will auto-detect.
        output_audio_path: Path to save translated audio (default: "translated_output.wav")
        gender: TTS voice gender - 'male' or 'female' (default: 'female')
        speed: TTS speech speed 0.1-1.99 (default: 1.0)
        max_audio_duration: Maximum audio duration in seconds (default: 15)
    
    Returns:
        Dictionary containing:
            - source_language: Detected or provided source language
            - recognized_text: Original transcribed text
            - translated_text: Translated text
            - output_audio: Path to generated translated audio
            - timings: Dictionary with individual step timings
    """
    print("=" * 60)
    print(f"🎙️  Speech-to-Speech Translation Pipeline")
    if source_lang:
        print(f"📍 {source_lang.upper()} → {target_lang.upper()}")
    else:
        print(f"📍 AUTO-DETECT → {target_lang.upper()}")
    print("=" * 60)
    
    total_start = time.time()
    timings = {}
    
    # Step 0: Validate and trim audio if needed
    print("\n[0/4] Validating audio file...")
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    start = time.time()
    audio_path = trim_audio(audio_path, max_audio_duration)
    timings['audio_processing'] = time.time() - start
    
    # Step 0.5: Auto-detect source language if not provided
    if source_lang is None:
        print("\n[1/4] Detecting source language...")
        start = time.time()
        detected_code, detected_name = detect_language(audio_path)
        timings['language_detection'] = time.time() - start
        source_lang = detected_code
        print(f"✅ Detected language: {detected_name} ({detected_code})")
        print(f"⏱️  Language detection time: {timings['language_detection']:.2f}s")
        step_offset = 1
    else:
        print(f"\n[1/4] Using provided source language: {source_lang.upper()}")
        timings['language_detection'] = 0.0
        step_offset = 1
    
    # Step 1: ASR (Speech to Text)
    print(f"\n[{1+step_offset}/4] Running ASR (Speech Recognition)...")
    start = time.time()
    recognized_text = asr_inference(audio_path, source_lang)
    timings['asr'] = time.time() - start
    print(f"✅ Recognized text: {recognized_text}")
    print(f"⏱️  ASR time: {timings['asr']:.2f}s")
    
    # Step 2: MT (Machine Translation)
    print(f"\n[{2+step_offset}/4] Running MT (Translation)...")
    start = time.time()
    translated_text = translate_text(recognized_text, source_lang, target_lang)
    timings['mt'] = time.time() - start
    print(f"✅ Translated text: {translated_text}")
    print(f"⏱️  MT time: {timings['mt']:.2f}s")
    
    # Step 3: TTS (Text to Speech)
    print(f"\n[{3+step_offset}/4] Running TTS (Speech Synthesis)...")
    start = time.time()
    output_audio = tts_inference(translated_text, target_lang, output_audio_path, gender=gender, speed=speed)
    timings['tts'] = time.time() - start
    print(f"✅ Generated speech: {output_audio}")
    print(f"⏱️  TTS time: {timings['tts']:.2f}s")
    
    # Total time
    total_time = time.time() - total_start
    timings['total'] = total_time
    
    print("\n" + "=" * 60)
    print("✅ Pipeline Complete!")
    print(f"⏱️  Total time: {total_time:.2f}s ({total_time*1000:.0f} ms)")
    print("=" * 60)
    
    return {
        "source_language": source_lang,
        "recognized_text": recognized_text,
        "translated_text": translated_text,
        "output_audio": output_audio,
        "timings": timings
    }


if __name__ == "__main__":
    # Example 1: With explicit source language (Bengali → English)
    print("Example 1: Explicit source language")
    print("-" * 60)
    try:
        result = run_pipeline(
            audio_path="beng.wav",
            source_lang="bn",  # Explicitly specify Bengali
            target_lang="en",
            output_audio_path="bengali_to_english_output.wav",
            gender="female",
            speed=1.0
        )
        
        print("\n📊 Results:")
        print(f"Source Language: {result['source_language']}")
        print(f"Original: {result['recognized_text']}")
        print(f"Translated: {result['translated_text']}")
        print(f"Audio: {result['output_audio']}")
        
    except Exception as e:
        print(f"❌ Pipeline Error: {e}")
    
    print("\n" + "=" * 60)
    print("\nExample 2: Auto-detect source language")
    print("-" * 60)
    try:
        result = run_pipeline(
            audio_path="beng.wav",
            source_lang=None,  # Auto-detect the source language
            target_lang="en",
            output_audio_path="autodetect_to_english_output.wav",
            gender="female",
            speed=1.0
        )
        
        print("\n📊 Results:")
        print(f"Detected Source: {result['source_language']}")
        print(f"Original: {result['recognized_text']}")
        print(f"Translated: {result['translated_text']}")
        print(f"Audio: {result['output_audio']}")
        
    except Exception as e:
        print(f"❌ Pipeline Error: {e}")

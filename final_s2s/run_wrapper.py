#!/usr/bin/env python3
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser(description='Run speech->speech pipeline')
    parser.add_argument('--input', required=True, help='Input audio path (wav)')
    parser.add_argument('--target', required=True, help='Target language code')
    parser.add_argument('--source', required=False, help='Source language code (optional)')
    parser.add_argument('--output', required=False, default='translated_output.wav', help='Output audio filename')
    parser.add_argument('--gender', required=False, default='female', help='TTS gender')
    parser.add_argument('--speed', required=False, type=float, default=1.0, help='TTS speed')

    args = parser.parse_args()

    # The pipeline prints a lot of diagnostic output. Redirect those prints
    # to stderr so stdout remains reserved for the JSON result.
    real_stdout = sys.stdout
    try:
        sys.stdout = sys.stderr
        result = run_pipeline(
            audio_path=args.input,
            target_lang=args.target,
            source_lang=args.source,
            output_audio_path=args.output,
            gender=args.gender,
            speed=args.speed
        )
    finally:
        sys.stdout = real_stdout

    # Normalize paths to absolute
    result['output_audio'] = os.path.abspath(result.get('output_audio', args.output))
    # Print JSON to stdout for backwards-compatibility, but also write
    # an atomic sidecar file that the server can read in case stdout
    # is polluted with debug/logging output.
    out_json = json.dumps(result)
    print(out_json)

    try:
        sidecar_path = os.path.join(os.path.dirname(__file__), 'run_wrapper_result.json')
        tmp_path = sidecar_path + '.tmp'
        with open(tmp_path, 'w', encoding='utf-8') as f:
            f.write(out_json)
        # atomic rename
        os.replace(tmp_path, sidecar_path)
    except Exception as e:
        # Do not fail the whole process if writing the sidecar fails; log to stderr
        print(f"Warning: failed to write sidecar JSON: {e}", file=sys.stderr)


if __name__ == '__main__':
    main()

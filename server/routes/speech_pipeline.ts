import { RequestHandler } from "express";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

// multer will be used by the server when registering this route
export const handleSpeechPipeline: RequestHandler = (req, res) => {
  // multer should have put file on req.file
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  // Save the uploaded file to final_s2s/input.wav
  const repoRoot = path.resolve(__dirname, "..", "..");
  const finalDir = path.join(repoRoot, "final_s2s");
  const inputPath = path.join(finalDir, "input.wav");

  try {
    fs.writeFileSync(inputPath, file.buffer);
  } catch (err) {
    console.error("Failed to write input file", err);
    return res.status(500).json({ error: "Failed to save input" });
  }

  // Choose python executable: prefer venv if present
  const venvPython = path.join(finalDir, "venv", "bin", "python3");
  const venvPythonAlt = path.join(finalDir, "venv", "bin", "python");
  let pythonExe = "python3";
  if (fs.existsSync(venvPython)) pythonExe = venvPython;
  else if (fs.existsSync(venvPythonAlt)) pythonExe = venvPythonAlt;

  console.log(`Running pipeline with python: ${pythonExe}`);

  // Run the python wrapper and pass current env vars through so BHASHINI_* and FORCE_LOCAL_ASR work
  const py = spawn(pythonExe, [path.join(finalDir, "run_wrapper.py"), "--input", inputPath, "--target", "en", "--output", path.join(finalDir, "translated_output.wav")], { cwd: finalDir, env: { ...process.env } });

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (d) => { stdout += d.toString(); });
  py.stderr.on("data", (d) => { stderr += d.toString(); });

  py.on("close", (code) => {
  if (code !== 0) {
    console.error("Pipeline stderr:", stderr);
    return res.status(500).json({ error: "Pipeline failed", detail: stderr });
  }

  try {
    let result: any;
    try {
      result = JSON.parse(stdout);
    } catch (parseErr) {
      console.warn("Stdout JSON parse failed, attempting sidecar file fallback", parseErr);
      // Attempt to read the sidecar JSON written by the wrapper
      const sidecar = path.join(finalDir, "run_wrapper_result.json");
      if (fs.existsSync(sidecar)) {
        try {
          const txt = fs.readFileSync(sidecar, { encoding: "utf-8" });
          result = JSON.parse(txt);
        } catch (fileErr) {
          console.error("Failed to parse sidecar JSON", fileErr);
          throw parseErr; // rethrow original parse error
        }
      } else {
        throw parseErr;
      }
    }

    // --- log detected language and recognized text ---
    console.log("Detected language:", result.source_language);
    console.log("Recognized text:", result.recognized_text);
    console.log("Translated text:", result.translated_text);

    const outputAudioPath: string = result.output_audio;
    if (!fs.existsSync(outputAudioPath)) {
      console.error("Output audio file does not exist:", outputAudioPath);
      return res.status(500).json({ error: "Output audio missing", detail: outputAudioPath });
    }
    const stat = fs.statSync(outputAudioPath);
    console.log(`Output audio file: ${outputAudioPath} (${stat.size} bytes)`);
    const audioData = fs.readFileSync(outputAudioPath);
    const audioBase64 = audioData.toString("base64");

    res.json({ ...result, audio_base64: audioBase64 });
  } catch (err) {
    console.error("Failed to parse pipeline output", err);
    console.error("---- stdout ----\n" + stdout);
    console.error("---- stderr ----\n" + stderr);
    res.status(500).json({ error: "Failed to parse pipeline output", detail: err.toString(), stdout: stdout, stderr: stderr });
  }
});
};
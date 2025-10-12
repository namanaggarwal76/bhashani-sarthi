import { RequestHandler } from "express";
import path from "path";
import fs from "fs";
import { spawn, spawnSync } from "child_process";

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

  // Quick sanity check: ensure the chosen python has pydub installed.
  const requiredCheckCmd = ['-c', "import pydub; import requests"];
  const triedPythons: string[] = [];
  let pythonThatWorks = pythonExe;
  try {
    let check = spawnSync(pythonThatWorks, requiredCheckCmd, { cwd: finalDir, env: { ...process.env } });
    triedPythons.push(pythonThatWorks);
    if (check.status !== 0) {
      // try system python fallbacks
      const candidates = ['python3', 'python'];
      let found = false;
      for (const c of candidates) {
        if (triedPythons.includes(c)) continue;
        try {
          const chk = spawnSync(c, requiredCheckCmd, { cwd: finalDir, env: { ...process.env } });
          triedPythons.push(c);
          if (chk.status === 0) {
            pythonThatWorks = c;
            found = true;
            console.warn(`Preferred python ${pythonExe} missing deps, falling back to ${c}`);
            break;
          }
        } catch (e) {
          // ignore and continue
        }
      }

      if (!found) {
        const errText = (check.stderr || Buffer.from('')).toString();
        console.error(`Required Python modules missing when running candidates: ${triedPythons.join(', ')}`, errText);
        return res.status(500).json({
          error: 'Python environment missing required packages',
          detail: `None of the tested python interpreters could import required modules. Tried: ${triedPythons.join(', ')}.\n\nTo fix, activate the desired python and run:\n\n<python> -m pip install -r ${path.join(finalDir, 'requirements.txt')}\n\nReplace <python> with the interpreter you want to use (e.g. ${pythonExe}).\n\nError: ${errText}`
        });
      }
    }
    // update pythonExe to the working interpreter
    pythonExe = pythonThatWorks;
  } catch (e) {
    console.error('Failed to run python check', e);
  }

  // Read optional form fields (multer does not parse text fields into file.buffer)
  const targetLang = (req as any).body?.target || 'en';
  const model = (req as any).body?.model || '';

  // If a local model is requested, set an env flag that the Python wrapper can use
  const env = { ...process.env } as any;
  if (model && model.toLowerCase().startsWith('local')) {
    env.FORCE_LOCAL_ASR = '1';
  }

  // Run the python wrapper and pass current env vars through so BHASHINI_* and FORCE_LOCAL_ASR work
  const py = spawn(pythonExe, [path.join(finalDir, "run_wrapper.py"), "--input", inputPath, "--target", targetLang, "--output", path.join(finalDir, "translated_output.wav")], { cwd: finalDir, env });

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
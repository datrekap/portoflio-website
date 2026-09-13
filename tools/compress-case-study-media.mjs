#!/usr/bin/env node
/**
 * Compress case-study video/images for PFAL, TrojanStep, and future studies.
 *
 * Usage:
 *   node tools/compress-case-study-media.mjs
 *   node tools/compress-case-study-media.mjs public/work/MyNewStudy
 *   node tools/compress-case-study-media.mjs public/play --force --video-only --crf 28 --max-width 1280 --max-fps 30
 *
 * Uses the ffmpeg-static devDependency, or ffmpeg on PATH.
 * Keeps the original if the compressed file is not smaller.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_DIRS = [
  path.join(ROOT, "public/work/FBF"),
  path.join(ROOT, "public/work/TrojanStep"),
  path.join(ROOT, "public/work/PropertyWorks"),
  path.join(ROOT, "public/work/ParkWise"),
];
const TMP_DIR = path.join(ROOT, ".compress-tmp");
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_VIDEO_CRF = "20";
const WEBP_QUALITY = "80";

const KEEP_AUDIO_NAMES = new Set([
  "hero-video.mp4",
  "final-project-video.mp4",
  "play-video.mp4",
  "look-ahead-1.mp4",
  "look-ahead-3.mp4",
  "overview-1.mp4",
  "artifact-1.mp4",
  "eval-4.mp4",
]);

function whichFfmpeg() {
  try {
    const bundled = require("ffmpeg-static");
    if (bundled && fs.existsSync(bundled)) return bundled;
  } catch {
    /* fall through to PATH */
  }
  const probe = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (probe.status === 0) return "ffmpeg";
  throw new Error(
    "ffmpeg is required. Run npm install, or install ffmpeg on PATH.",
  );
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("._") || entry.name === ".DS_Store") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function collect(target) {
  const stats = fs.statSync(target);
  if (stats.isFile()) return [target];
  return walk(target);
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function probeVideoInfo(ffmpeg, file) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-i", file], {
    encoding: "utf8",
  });
  return `${result.stderr || ""}`;
}

function videoWidth(info) {
  const match = info.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
  return match ? Number(match[1]) : 0;
}

function alreadyOurEncode(info, maxWidth) {
  return (
    /encoder\s+:\s+Lavc.*libx264/.test(info) && videoWidth(info) <= maxWidth
  );
}

function parseArgs(argv) {
  const options = {
    force: false,
    videoOnly: false,
    crf: DEFAULT_VIDEO_CRF,
    maxWidth: DEFAULT_MAX_WIDTH,
    maxFps: null,
    targets: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") options.force = true;
    else if (arg === "--video-only") options.videoOnly = true;
    else if (arg === "--crf") options.crf = String(argv[++i]);
    else if (arg === "--max-width") options.maxWidth = Number(argv[++i]);
    else if (arg === "--max-fps") options.maxFps = Number(argv[++i]);
    else if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      options.targets.push(path.resolve(ROOT, arg));
    }
  }

  return options;
}

function compressVideo(ffmpeg, file, options) {
  const info = probeVideoInfo(ffmpeg, file);
  if (!options.force && alreadyOurEncode(info, options.maxWidth)) {
    console.log(
      `  skip  ${path.relative(ROOT, file)} (already compressed)`,
    );
    return;
  }

  const keepAudio = KEEP_AUDIO_NAMES.has(path.basename(file));
  const tmp = path.join(
    TMP_DIR,
    `cs-compress-${process.pid}-${path.basename(file)}`,
  );
  const scale = `scale='min(${options.maxWidth},iw)':-2`;
  const vf = options.maxFps ? `${scale},fps=${options.maxFps}` : scale;
  const args = [
    "-y",
    "-i",
    file,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-crf",
    options.crf,
    "-preset",
    "medium",
    "-tune",
    "animation",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  ];
  if (keepAudio) {
    args.push("-c:a", "aac", "-b:a", "96k", "-ac", "2");
  } else {
    args.push("-an");
  }
  args.push(tmp);

  execFileSync(ffmpeg, args, { stdio: "pipe" });
  const before = fs.statSync(file).size;
  const after = fs.statSync(tmp).size;
  if (after < before * 0.97) {
    fs.copyFileSync(tmp, file);
    console.log(`  video ${path.relative(ROOT, file)} ${formatMb(before)} → ${formatMb(after)}`);
  } else {
    console.log(`  skip  ${path.relative(ROOT, file)} (already small, ${formatMb(before)})`);
  }
  fs.unlinkSync(tmp);
}

function compressImage(ffmpeg, file) {
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) return;
  const out = file.slice(0, -ext.length) + ".webp";
  const tmp = path.join(TMP_DIR, `${path.basename(file, ext)}.webp`);
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      file,
      "-vf",
      `scale='min(1920,iw)':-2`,
      "-quality",
      WEBP_QUALITY,
      tmp,
    ],
    { stdio: "pipe" },
  );
  const before = fs.statSync(file).size;
  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, out);
    if (out !== file) fs.unlinkSync(file);
    console.log(`  image ${path.relative(ROOT, file)} ${formatMb(before)} → ${formatMb(after)}`);
  } else {
    fs.unlinkSync(tmp);
    console.log(`  skip  ${path.relative(ROOT, file)} (webp not smaller)`);
  }
}

function main() {
  const ffmpeg = whichFfmpeg();
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const options = parseArgs(process.argv.slice(2));
  const targets = options.targets.length ? options.targets : DEFAULT_DIRS;

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      console.error(`Missing folder: ${dir}`);
      process.exit(1);
    }
    console.log(`\nCompressing ${path.relative(ROOT, dir)}`);
    const files = collect(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      try {
        if (ext === ".mp4") compressVideo(ffmpeg, file, options);
        else if (
          !options.videoOnly &&
          [".png", ".jpg", ".jpeg"].includes(ext)
        ) {
          compressImage(ffmpeg, file);
        }
      } catch (error) {
        const details = error.stderr?.toString?.().trim() || error.message;
        console.error(`  fail  ${path.relative(ROOT, file)}: ${details.slice(-500)}`);
      }
    }
  }
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

main();

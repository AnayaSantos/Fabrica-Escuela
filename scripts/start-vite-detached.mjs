import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const out = fs.openSync(path.join(rootDir, "vite.out.log"), "a");
const err = fs.openSync(path.join(rootDir, "vite.err.log"), "a");

const child = spawn(
  process.execPath,
  [viteBin, "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
  {
    cwd: rootDir,
    detached: true,
    env: { ...process.env, VITE_DATA_SOURCE: process.env.VITE_DATA_SOURCE ?? "local" },
    stdio: ["ignore", out, err],
    windowsHide: true,
  },
);

child.unref();

console.log(`Vite iniciado en segundo plano. PID: ${child.pid}`);

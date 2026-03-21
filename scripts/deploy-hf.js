import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const hfDir = path.join(root, "hf-dist");

// Build
execSync("npm run build", { cwd: root, stdio: "inherit" });

// Sync dist/ → hf-dist/ (clear existing files except .git)
for (const entry of fs.readdirSync(hfDir)) {
  if (entry !== ".git") {
    fs.rmSync(path.join(hfDir, entry), { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
copyDir(distDir, hfDir);

// Commit and push to hf remote
const token = process.env.HF_TOKEN;
if (!token) {
  console.error("Error: HF_TOKEN environment variable is not set.");
  console.error("Run: set HF_TOKEN=<your-huggingface-write-token>");
  process.exit(1);
}
const remoteUrl = `https://mugdhav:${token}@huggingface.co/spaces/mugdhav/hackathon-dashboard`;

const git = (cmd) => execSync(`git ${cmd}`, { cwd: hfDir, stdio: "inherit" });
git("add .");
git('commit --allow-empty -m "deploy"');
git(`push ${remoteUrl} HEAD:main --force`);

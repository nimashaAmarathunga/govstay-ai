const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Load Environment Variables manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const agentKernelPath = process.env.AGENT_KERNEL_PATH;
const agentKernelUrl = process.env.AGENT_KERNEL_URL || "http://127.0.0.1:8000";

let agentProcess = null;
let nextProcess = null;

const isWin = process.platform === "win32";

function killProcessTree(pid) {
  if (isWin) {
    try {
      execSync(`taskkill /pid ${pid} /t /f`);
    } catch (e) {
      console.log(`Failed to kill process tree for PID ${pid}`);
    }
  } else {
    try {
      process.kill(-pid);
    } catch (e) {
      console.log(`Failed to kill process tree for PID ${pid}`);
    }
  }
}

function cleanup() {
  console.log("\n[Dev] Shutting down services...");
  if (nextProcess) {
    killProcessTree(nextProcess.pid);
  }
  if (agentProcess) {
    killProcessTree(agentProcess.pid);
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function checkAgentHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${agentKernelUrl}/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitForAgent() {
  process.stdout.write("[Agent Kernel] Waiting for API to be ready...");
  for (let i = 0; i < 60; i++) {
    const isHealthy = await checkAgentHealth();
    if (isHealthy) {
      console.log(`\n[Agent Kernel] API ready on ${agentKernelUrl}`);
      return true;
    }
    process.stdout.write(".");
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("\n[Agent Kernel] Failed to start within 60 seconds.");
  return false;
}

function startAgentKernel() {
  return new Promise((resolve) => {
    if (!agentKernelPath) {
      console.log("[Agent Kernel] AGENT_KERNEL_PATH not set in .env. Skipping local Agent startup.");
      resolve(true);
      return;
    }

    const fullPath = path.resolve(process.cwd(), agentKernelPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[Agent Kernel] Warning: Path ${fullPath} does not exist. Skipping local Agent startup.`);
      resolve(true);
      return;
    }

    // Detect Python executable
    let pythonExe = "python";
    const venvPythonPath = path.join(fullPath, ".venv", "Scripts", "python.exe");
    if (fs.existsSync(venvPythonPath)) {
      pythonExe = venvPythonPath;
    }

    console.log(`[Agent Kernel] Starting in ${fullPath}`);
    console.log(`[Agent Kernel] Using Python: ${pythonExe}`);

    agentProcess = spawn(`"${pythonExe}"`, ["start_all.py"], {
      cwd: fullPath,
      shell: true,
      detached: !isWin // Create new process group on Unix for tree-kill
    });

    agentProcess.stdout.on('data', (data) => {
      process.stdout.write(`[Agent Kernel] ${data}`);
    });

    agentProcess.stderr.on('data', (data) => {
      process.stderr.write(`[Agent Kernel] ${data}`);
    });

    agentProcess.on('close', (code) => {
      console.log(`[Agent Kernel] Exited with code ${code}`);
      if (code !== 0 && code !== null) {
        cleanup();
      }
    });

    resolve(true);
  });
}

function startNextJs() {
  console.log("[GovStay] Starting Next.js...");
  const npmCmd = isWin ? "npm.cmd" : "npm";
  
  nextProcess = spawn(npmCmd, ["run", "dev:web"], {
    cwd: process.cwd(),
    shell: true,
    detached: !isWin
  });

  nextProcess.stdout.on('data', (data) => {
    process.stdout.write(`[GovStay] ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(`[GovStay] ${data}`);
  });

  nextProcess.on('close', (code) => {
    console.log(`[GovStay] Exited with code ${code}`);
    cleanup();
  });
}

async function boot() {
  const agentStarted = await startAgentKernel();
  if (agentStarted) {
    if (agentProcess) {
       const isReady = await waitForAgent();
       if (!isReady) {
         cleanup();
         return;
       }
    }
    
    startNextJs();
  } else {
    cleanup();
  }
}

boot();

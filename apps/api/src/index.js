const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const app = express();

// For demo: allow all origins (works for SWA + local)
app.use(cors());
app.use(express.json());

const dataPathCandidates = [
  // Local dev (repo structure): apps/data/sample.json
  path.join(__dirname, "..", "data", "sample.json"),
  // Container (Dockerfile copies to /app/data): apps/api/data/sample.json
  path.join(__dirname, "data", "sample.json"),
];

function resolveDataPath() {
  for (const p of dataPathCandidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`sample.json not found. Tried: ${dataPathCandidates.join(" | ")}`);
}

const dataPath = resolveDataPath();

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function nextIncidentId(data) {
  let max = 1000;
  for (const inc of data.incidents || []) {
    const m = String(inc.id || "").match(/^INC-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `INC-${max + 1}`;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/incidents", (req, res) => {
  const data = readData();
  res.json(data.incidents || []);
});

app.get("/incidents/:id/trends", (req, res) => {
  const data = readData();
  res.json((data.trends || {})[req.params.id] || []);
});

app.get("/incidents/:id/clusters", (req, res) => {
  const data = readData();
  res.json((data.clusters || {})[req.params.id] || []);
});

const workerDirCandidates = [
  // Local dev: repo structure
  path.join(__dirname, "..", "ml-worker"),
  // If you ever run from apps/api/src (rare), still allow:
  path.join(__dirname, "..", "..", "ml-worker"),
  // Container: Dockerfile copies ml-worker into /app/ml-worker
  path.join(__dirname, "ml-worker"),
];

function resolveWorkerDir() {
  for (const p of workerDirCandidates) {
    if (fs.existsSync(path.join(p, "cluster.py"))) return p;
  }
  throw new Error(
    `cluster.py not found. Tried: ${workerDirCandidates.join(" | ")}`
  );
}


app.post("/simulate-alert", (req, res) => {
  try {
    const data = readData();

    data.trends = data.trends || {};
    data.clusters = data.clusters || {};
    data.incidents = data.incidents || [];

    const incidentId = nextIncidentId(data);

    // scenario from request OR weighted random
    const allowed = ["timeout", "auth", "throttle", "mixed"];
    const weighted = ["mixed", "mixed", "mixed", "timeout", "auth", "throttle"];

    const scenario =
      allowed.includes((req.body?.scenario || "").toLowerCase())
        ? req.body.scenario.toLowerCase()
        : weighted[Math.floor(Math.random() * weighted.length)];

    // seed so every click changes charts
    const seed = String(Date.now() % 100000);

    // Linux container: python3
    const python = process.env.PYTHON_BIN || "python3";

    // ml-worker copied to /app/ml-worker by Dockerfile
    const workerDir = resolveWorkerDir();

    const py = spawnSync(python, ["cluster.py", scenario, seed], {
      cwd: workerDir,
      encoding: "utf-8",
    });

    if (py.error) {
      return res.status(500).json({ error: py.error.message });
    }
    if (py.status !== 0) {
      return res.status(500).json({
        error: "Python failed",
        status: py.status,
        stderr: py.stderr,
        stdout: py.stdout,
      });
    }

    const result = JSON.parse(py.stdout);

    data.incidents.unshift({
      id: incidentId,
      service: result.service || "payments-api",
      severity: scenario === "mixed" ? "Sev2" : "Sev3",
      status: "Open",
      scenario,
      engine: result.engine, // "sklearn" or "fallback"
      createdAt: new Date().toISOString(),
    });

    data.trends[incidentId] = result.trend || [];
    data.clusters[incidentId] = result.clusters || [];

    writeData(data);

    res.json({
      ok: true,
      incidentId,
      scenario,
      engine: result.engine,
      clusterCount: (result.clusters || []).length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, "0.0.0.0", () => console.log(`API running on ${PORT}`));

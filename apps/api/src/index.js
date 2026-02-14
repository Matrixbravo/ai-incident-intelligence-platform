const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // explicit for local dev
app.use(express.json());

const dataPath = path.join(__dirname, "..", "data", "sample.json");

function readData() {
    return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
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
    res.json((data.trends && data.trends[req.params.id]) || []);
});

app.get("/incidents/:id/clusters", (req, res) => {
    const data = readData();
    res.json((data.clusters && data.clusters[req.params.id]) || []);
});

/**
 * Multi-incident + multi-scenario:
 * Every click creates a new incident (INC-1002, INC-1003...)
 * and randomly picks scenario: timeout/auth/throttle/mixed
 */
app.post("/simulate-alert", (req, res) => {
    try {
        const data = readData();

        // Ensure objects exist
        data.trends = data.trends || {};
        data.clusters = data.clusters || {};
        data.incidents = data.incidents || [];

        // NEW incident id
        const incidentId = nextIncidentId(data);

        // Pick a scenario each time (or allow overriding via request body)
        const scenarios = ["mixed", "mixed", "mixed", "timeout", "auth", "throttle"];
        const scenario =
            req.body?.scenario && ["timeout", "auth", "throttle", "mixed"].includes(req.body.scenario)
                ? req.body.scenario
                : scenarios[Math.floor(Math.random() * scenarios.length)];

        // venv python
        const venvPython = path.join(
            __dirname,
            "..",
            "..",
            "ml-worker",
            ".venv",
            "Scripts",
            "python.exe"
        );

        // Run python with scenario argument
        console.log("Using python:", venvPython);
        const py = spawnSync(venvPython, ["cluster.py", scenario], {
            cwd: path.join(__dirname, "..", "..", "ml-worker"),
            encoding: "utf-8",
        });

        if (py.error) return res.status(500).json({ error: py.error.message });
        if (py.status !== 0) {
            return res.status(500).json({
                error: "Python failed",
                status: py.status,
                stderr: py.stderr,
                stdout: py.stdout
            });
        }


        const result = JSON.parse(py.stdout);

        // Create incident record (store scenario too)
        data.incidents.unshift({
            id: incidentId,
            service: result.service || "payments-api",
            severity: scenario === "mixed" ? "Sev2" : "Sev3",
            status: "Open",
            scenario,
            createdAt: new Date().toISOString(),
        });

        // Store AI outputs for that incident
        data.trends[incidentId] = result.trend || [];
        data.clusters[incidentId] = result.clusters || [];

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        res.json({
            ok: true,
            incidentId,
            scenario,
            clusterCount: (result.clusters || []).length,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

// Database setup
const db = new Database("controller_data.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS performance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    setpoint REAL,
    output REAL,
    error REAL,
    kp REAL,
    ki REAL,
    control_signal REAL,
    stability_score REAL
  );
  
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT,
    message TEXT,
    severity TEXT
  );
`);

// PI Controller Simulation State
let state = {
  setpoint: 100,
  output: 0,
  integral: 0,
  kp: 1.2,
  ki: 0.5,
  mode: "AI_ADAPTIVE", // MANUAL, AI_ADAPTIVE, SAFE, SIMULATION
  lastUpdateTime: Date.now(),
  stabilityScore: 95,
  confidenceScore: 88,
  overshoot: 2.5,
  settlingTime: 1.2,
  disturbance: 0,
  lastTunedAt: Date.now(),
  improvement: 12.4,
  modelAccuracy: 98.2,
  trainingDataSize: 142500,
  predictedRisk: 1.2,
  anomalyScore: 0.05,
  learningStatus: "Active",
};

// Simulation Logic
function updateSimulation() {
  const now = Date.now();
  const dt = (now - state.lastUpdateTime) / 1000;
  state.lastUpdateTime = now;

  // Add some random disturbance if not in safe mode
  if (state.mode !== "SAFE") {
    state.disturbance = Math.sin(now / 5000) * 2 + (Math.random() - 0.5) * 1;
  } else {
    state.disturbance = 0;
  }

  const error = state.setpoint - state.output;
  state.integral += error * dt;
  
  // Anti-windup
  state.integral = Math.max(-50, Math.min(50, state.integral));

  const u = state.kp * error + state.ki * state.integral + state.disturbance;
  
  // Simple plant model: first order system with some lag
  const plantGain = 1.0;
  const timeConstant = 0.5;
  const dOutput = (plantGain * u - state.output) / timeConstant;
  state.output += dOutput * dt;

  // AI Tuning Simulation (Slowly adjust gains to "optimize")
  if (state.mode === "AI_ADAPTIVE") {
    // Mock AI logic: if error is high, increase Kp slightly; if oscillating, decrease Ki
    if (Math.abs(error) > 10) {
      state.kp += 0.001;
    } else {
      state.kp -= 0.0005;
    }
    state.kp = Math.max(0.1, Math.min(5.0, state.kp));
    state.lastTunedAt = Date.now();
    
    // Stability calculation
    state.stabilityScore = Math.max(0, 100 - Math.abs(error) * 2 - Math.abs(dOutput) * 0.5);
    
    // Fluctuating AI metrics
    state.modelAccuracy = 98 + Math.random() * 0.5;
    state.predictedRisk = Math.max(0, (100 - state.stabilityScore) / 10 + Math.random() * 0.5);
    state.anomalyScore = Math.random() * 0.1;
    state.trainingDataSize += 1;
  }

  // Log to DB occasionally (every 5 seconds)
  if (Math.random() < 0.02) {
    db.prepare(`
      INSERT INTO performance_logs (setpoint, output, error, kp, ki, control_signal, stability_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(state.setpoint, state.output, error, state.kp, state.ki, u, state.stabilityScore);
  }

  // Broadcast to all clients
  const payload = JSON.stringify({
    type: "DATA_UPDATE",
    data: {
      ...state,
      timestamp: now,
      error: error,
      controlSignal: u,
    }
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

setInterval(updateSimulation, 100);

// API Routes
app.use(express.json());

app.get("/api/history", (req, res) => {
  const logs = db.prepare("SELECT * FROM performance_logs ORDER BY timestamp DESC LIMIT 100").all();
  res.json(logs);
});

app.get("/api/alerts", (req, res) => {
  const alerts = db.prepare("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50").all();
  res.json(alerts);
});

app.post("/api/control", (req, res) => {
  const { mode, setpoint, kp, ki } = req.body;
  if (mode) state.mode = mode;
  if (setpoint !== undefined) state.setpoint = setpoint;
  if (kp !== undefined) state.kp = kp;
  if (ki !== undefined) state.ki = ki;
  
  res.json({ status: "ok", state });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

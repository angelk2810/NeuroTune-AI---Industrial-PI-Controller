import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SystemState, ControlMode } from "./types";

export default function App() {
  const [state, setState] = useState<SystemState>({
    setpoint: 100,
    output: 0,
    integral: 0,
    kp: 1.2,
    ki: 0.5,
    mode: "AI_ADAPTIVE",
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
    timestamp: Date.now(),
    error: 0,
    controlSignal: 0,
  });

  const [history, setHistory] = useState<any[]>([]);

  // 🔥 Simulation Engine (Frontend Only)
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const dt = 0.1;

        const disturbance =
          Math.sin(Date.now() / 5000) * 2 + (Math.random() - 0.5);

        const error = prev.setpoint - prev.output;

        const integral = Math.max(
          -50,
          Math.min(50, prev.integral + error * dt)
        );

        const control =
          prev.kp * error + prev.ki * integral + disturbance;

        const plantGain = 1.0;
        const timeConstant = 0.5;

        const dOutput =
          (plantGain * control - prev.output) / timeConstant;

        const output = prev.output + dOutput * dt;

        const stabilityScore = Math.max(
          0,
          100 - Math.abs(error) * 2 - Math.abs(dOutput) * 0.5
        );

        return {
          ...prev,
          integral,
          output,
          disturbance,
          error,
          controlSignal: control,
          stabilityScore,
          timestamp: Date.now(),
          modelAccuracy: 98 + Math.random() * 0.5,
          predictedRisk:
            (100 - stabilityScore) / 10 + Math.random() * 0.5,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Update Chart History
  useEffect(() => {
    setHistory((prev) => [
      ...prev.slice(-50),
      {
        time: new Date().toLocaleTimeString(),
        output: state.output,
        setpoint: state.setpoint,
        error: state.error,
      },
    ]);
  }, [state]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-8 space-y-8">
      <h1 className="text-3xl font-bold">NeuroTune AI – Frontend Simulation</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-4">
          <p className="text-sm text-slate-400">Output</p>
          <h2 className="text-2xl font-mono text-cyan-400">
            {state.output.toFixed(2)}
          </h2>
        </div>

        <div className="glass-panel p-4">
          <p className="text-sm text-slate-400">Error</p>
          <h2 className="text-2xl font-mono text-orange-400">
            {state.error.toFixed(2)}
          </h2>
        </div>

        <div className="glass-panel p-4">
          <p className="text-sm text-slate-400">Stability</p>
          <h2 className="text-2xl font-mono text-green-400">
            {state.stabilityScore.toFixed(1)}%
          </h2>
        </div>

        <div className="glass-panel p-4">
          <p className="text-sm text-slate-400">AI Accuracy</p>
          <h2 className="text-2xl font-mono text-blue-400">
            {state.modelAccuracy.toFixed(2)}%
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel p-6 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" hide />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip />
            <Line type="monotone" dataKey="output" stroke="#00d2ff" dot={false} />
            <Line type="monotone" dataKey="setpoint" stroke="#ffffff55" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Setpoint Control */}
      <div className="glass-panel p-6 space-y-4">
        <p className="text-sm uppercase tracking-wider text-slate-400">
          Setpoint Control
        </p>
        <input
          type="range"
          min="0"
          max="200"
          value={state.setpoint}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              setpoint: parseInt(e.target.value),
            }))
          }
          className="w-full"
        />
        <p className="font-mono text-cyan-400">
          Setpoint: {state.setpoint}
        </p>
      </div>
    </div>
  );
}

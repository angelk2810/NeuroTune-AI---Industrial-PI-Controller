import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, AlertTriangle, Settings, History, ShieldCheck, BrainCircuit,
  Zap, LayoutDashboard, Bell, Database, Menu, X, ChevronRight,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion } from 'motion/react';
import { SystemState, ControlMode } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  // 🔥 INITIAL STATE (NO BACKEND)
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

  // 🔥 FRONTEND SIMULATION ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
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

  // 🔥 UPDATE CHART HISTORY
  useEffect(() => {
    setHistory(prev => [
      ...prev.slice(-50),
      {
        time: new Date().toLocaleTimeString(),
        output: state.output,
        setpoint: state.setpoint,
        error: state.error,
        kp: state.kp,
        ki: state.ki,
        controlSignal: state.controlSignal,
      }
    ]);
  }, [state]);

  // 🔥 MODE CHANGE (NO API)
  const handleModeChange = (mode: ControlMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  return (
    <div className="flex h-screen bg-[#0a0b0d] overflow-hidden text-white">
      
      {/* Sidebar */}
      <aside className={cn(
        "h-full bg-black/40 border-r border-white/5 flex flex-col z-50",
        isSidebarOpen ? "w-[280px]" : "w-0 overflow-hidden"
      )}>
        <div className="p-6">
          <h1 className="text-lg font-bold">NeuroTune</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        <h2 className="text-xl font-bold">Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400">Output</p>
            <h3 className="text-2xl font-mono text-cyan-400">
              {state.output.toFixed(2)}
            </h3>
          </div>

          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400">Error</p>
            <h3 className="text-2xl font-mono text-orange-400">
              {state.error.toFixed(2)}
            </h3>
          </div>

          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400">Stability</p>
            <h3 className="text-2xl font-mono text-green-400">
              {state.stabilityScore.toFixed(1)}%
            </h3>
          </div>

          <div className="glass-panel p-4">
            <p className="text-xs text-slate-400">AI Accuracy</p>
            <h3 className="text-2xl font-mono text-blue-400">
              {state.modelAccuracy.toFixed(2)}%
            </h3>
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

        {/* Setpoint Slider */}
        <div className="glass-panel p-6">
          <p className="text-xs uppercase text-slate-400 mb-2">Setpoint</p>
          <input
            type="range"
            min="0"
            max="200"
            value={state.setpoint}
            onChange={(e) =>
              setState(prev => ({
                ...prev,
                setpoint: parseInt(e.target.value)
              }))
            }
            className="w-full"
          />
          <p className="font-mono text-cyan-400 mt-2">
            {state.setpoint}
          </p>
        </div>

      </main>
    </div>
  );
}

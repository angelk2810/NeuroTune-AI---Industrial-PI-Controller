import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  History, 
  ShieldCheck, 
  BrainCircuit,
  Gauge,
  Zap,
  LayoutDashboard,
  Bell,
  Database,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { SystemState, ControlMode, PerformanceLog, Alert } from './types';
import { cn } from './lib/utils';

// --- Components ---

const StatCard = ({ title, value, unit, icon: Icon, trend, color = "blue" }: any) => {
  const colorMap: any = {
    blue: "text-neon-blue",
    green: "text-neon-green",
    red: "text-neon-red",
    orange: "text-neon-orange",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon size={20} className={colorMap[color]} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-xs font-medium px-2 py-1 rounded-full bg-white/5",
            trend > 0 ? "text-neon-green" : "text-neon-red"
          )}>
            {trend > 0 ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={cn("text-2xl font-bold font-mono", colorMap[color])}>{value}</h3>
          <span className="text-slate-500 text-xs">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-neon-blue" : "")} />
    <span className="font-medium text-sm">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,210,255,0.8)]" />}
  </button>
);

const ControlButton = ({ label, active, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300",
      active 
        ? "bg-neon-blue/10 border-neon-blue/50 text-neon-blue shadow-[0_0_15px_rgba(0,210,255,0.1)]" 
        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
    )}
  >
    <Icon size={24} />
    <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
  </button>
);

// --- Main App ---

export default function App() {
  const [state, setState] = useState<SystemState | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to NeuroTune AI Server');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'DATA_UPDATE') {
          setState(message.data);
          setHistory(prev => {
            const newHistory = [...prev, {
              time: new Date(message.data.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
              output: message.data.output,
              setpoint: message.data.setpoint,
              error: message.data.error,
              kp: message.data.kp,
              ki: message.data.ki,
            }].slice(-50);
            return newHistory;
          });
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWS, 3000);
      };

      wsRef.current = ws;
    };

    connectWS();
    return () => wsRef.current?.close();
  }, []);

  const handleModeChange = async (mode: ControlMode) => {
    try {
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
    } catch (err) {
      console.error('Failed to update mode', err);
    }
  };

  if (!state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-industrial-bg gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <BrainCircuit size={64} className="text-neon-blue opacity-50" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-neon-blue shadow-[0_0_20px_rgba(0,210,255,1)]" />
          </motion.div>
        </motion.div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Initializing NeuroTune AI</h2>
          <p className="text-slate-500 text-sm animate-pulse">Establishing secure link to industrial controller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-industrial-bg overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="relative h-full bg-black/40 border-r border-white/5 flex flex-col z-50 overflow-hidden"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
            <BrainCircuit size={24} className="text-neon-blue" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">NeuroTune</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-neon-blue font-bold">AI Control v2.4</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Activity} label="Live Monitoring" active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} />
          <SidebarItem icon={Cpu} label="AI Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <SidebarItem icon={History} label="Gain Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <SidebarItem icon={Bell} label="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          <SidebarItem icon={Database} label="Admin Panel" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-panel p-4 bg-white/5 border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-neon-green shadow-[0_0_8px_#39ff14]" : "bg-neon-red shadow-[0_0_8px_#ff3131]")} />
              <span className="text-xs font-medium text-slate-400">{isConnected ? "System Online" : "System Offline"}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                <span>CPU Load</span>
                <span>24%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue w-[24%]" />
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-4 w-px bg-white/10" />
            <h2 className="text-sm font-semibold text-slate-300 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <RefreshCw size={14} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-mono">Sync: 100ms</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-red rounded-full border-2 border-industrial-bg" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
              JD
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="System Stability" value={state.stabilityScore.toFixed(1)} unit="%" icon={ShieldCheck} trend={2.4} color={state.stabilityScore > 80 ? "green" : state.stabilityScore > 50 ? "orange" : "red"} />
                <StatCard title="Current Output" value={state.output.toFixed(2)} unit="Units" icon={Activity} color="blue" />
                <StatCard title="Control Error" value={Math.abs(state.error).toFixed(3)} unit="Δ" icon={AlertTriangle} color={Math.abs(state.error) < 5 ? "green" : "orange"} />
                <StatCard title="AI Confidence" value={state.confidenceScore} unit="%" icon={BrainCircuit} color="blue" />
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Live Performance</h3>
                      <p className="text-xs text-slate-500">Real-time output vs setpoint tracking</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-neon-blue" />
                        <span className="text-[10px] uppercase font-bold text-slate-400">Output</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-600" />
                        <span className="text-[10px] uppercase font-bold text-slate-400">Setpoint</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(10, 11, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="output" stroke="#00d2ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="stepAfter" dataKey="setpoint" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Control Mode</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <ControlButton label="Manual" active={state.mode === 'MANUAL'} onClick={() => handleModeChange('MANUAL')} icon={Settings} />
                    <ControlButton label="AI Adaptive" active={state.mode === 'AI_ADAPTIVE'} onClick={() => handleModeChange('AI_ADAPTIVE')} icon={BrainCircuit} />
                    <ControlButton label="Safe Mode" active={state.mode === 'SAFE'} onClick={() => handleModeChange('SAFE')} icon={ShieldCheck} />
                    <ControlButton label="Simulation" active={state.mode === 'SIMULATION'} onClick={() => handleModeChange('SIMULATION')} icon={RefreshCw} />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Setpoint Control</span>
                      <span className="text-sm font-mono text-neon-blue">{state.setpoint}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="200" 
                      value={state.setpoint} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        fetch('/api/control', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ setpoint: val }),
                        });
                      }}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gain Optimization Panel */}
                <div className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">AI Gain Tuning</h3>
                    <Zap size={18} className="text-neon-orange" />
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Kp Gain</p>
                      <h4 className="text-3xl font-mono font-bold text-neon-blue">{state.kp.toFixed(3)}</h4>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ki Gain</p>
                      <h4 className="text-3xl font-mono font-bold text-neon-green">{state.ki.toFixed(3)}</h4>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Improvement</span>
                      <span className="text-neon-green font-bold">+{state.improvement}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: [-20, 100] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/4 bg-gradient-to-r from-transparent via-neon-blue to-transparent"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 italic text-center">Last auto-tuned {new Date(state.lastTunedAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Stability Metrics */}
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Stability Metrics</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-bold">
                        <span className="text-slate-500">Overshoot</span>
                        <span className={cn(state.overshoot > 5 ? "text-neon-red" : "text-neon-green")}>{state.overshoot.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", state.overshoot > 5 ? "bg-neon-red" : "bg-neon-green")} style={{ width: `${Math.min(100, state.overshoot * 10)}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-bold">
                        <span className="text-slate-500">Settling Time</span>
                        <span className="text-neon-blue">{state.settlingTime.toFixed(2)}s</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue rounded-full" style={{ width: `${Math.min(100, state.settlingTime * 20)}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase font-bold">
                        <span className="text-slate-500">Response Speed</span>
                        <span className="text-neon-orange">High</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-orange rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Predictive Insights */}
                <div className="glass-panel p-6 bg-gradient-to-br from-neon-blue/5 to-transparent">
                  <div className="flex items-center gap-2 mb-6">
                    <BrainCircuit size={20} className="text-neon-blue" />
                    <h3 className="text-lg font-bold text-white">AI Insights</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-neon-green" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">System Stable</p>
                        <p className="text-[10px] text-slate-500">Current gains provide 98% damping ratio.</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-orange/10 flex items-center justify-center shrink-0">
                        <Zap size={16} className="text-neon-orange" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Efficiency Boost</p>
                        <p className="text-[10px] text-slate-500">AI tuning reduced settling time by 14%.</p>
                      </div>
                    </div>
                    <button className="w-full py-2 rounded-xl bg-neon-blue text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors">
                      Generate Full Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Model Accuracy" value={state.modelAccuracy.toFixed(2)} unit="%" icon={Cpu} color="blue" />
                <StatCard title="Training Samples" value={state.trainingDataSize.toLocaleString()} unit="Rows" icon={Database} color="green" />
                <StatCard title="Instability Risk" value={state.predictedRisk.toFixed(2)} unit="%" icon={AlertTriangle} color={state.predictedRisk > 5 ? "red" : "green"} />
                <StatCard title="Anomaly Score" value={state.anomalyScore.toFixed(3)} unit="σ" icon={Activity} color="orange" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Learning Progress</h3>
                      <p className="text-xs text-slate-500">Model convergence and adaptation rate</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-[10px] font-bold text-neon-green uppercase tracking-wider">
                      {state.learningStatus}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[95, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(10, 11, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="kp" stroke="#00d2ff" fillOpacity={1} fill="url(#colorAcc)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Predictive Analysis</h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Load Disturbance Simulation</span>
                        <span className="text-[10px] text-neon-blue font-bold">PREDICTED</span>
                      </div>
                      <div className="flex items-end gap-2 mb-4">
                        <div className="flex-1 h-12 bg-white/5 rounded-lg relative overflow-hidden">
                           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-neon-blue/20" />
                           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-slate-500">Normal Load</div>
                        </div>
                        <div className="w-8 flex flex-col items-center gap-1">
                          <ChevronRight size={16} className="text-slate-600" />
                        </div>
                        <div className="flex-1 h-16 bg-neon-blue/10 border border-neon-blue/20 rounded-lg relative overflow-hidden">
                           <div className="absolute bottom-0 left-0 w-full h-3/4 bg-neon-blue/30" />
                           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-neon-blue font-bold">+40% Load</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        The AI model predicts a <span className="text-neon-green font-bold">94.2%</span> stability retention if load increases by 40% suddenly.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Optimization Trends</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 mb-1">Energy Saved</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-neon-green">18.4%</span>
                            <ArrowUpRight size={14} className="text-neon-green" />
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 mb-1">Wear Reduction</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-neon-blue">22.1%</span>
                            <ArrowUpRight size={14} className="text-neon-blue" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 h-[400px] flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Sensor Telemetry</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 11, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="output" stroke="#00d2ff" strokeWidth={2} dot={false} isAnimationActive={false} name="Sensor Output" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-panel p-6 h-[400px] flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Control Signal (u)</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 11, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Area type="stepAfter" dataKey="controlSignal" stroke="#ff9100" fill="#ff9100" fillOpacity={0.1} isAnimationActive={false} name="u(t)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-6">Raw Data Stream</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3 font-bold">Timestamp</th>
                        <th className="pb-3 font-bold">Output</th>
                        <th className="pb-3 font-bold">Setpoint</th>
                        <th className="pb-3 font-bold">Error</th>
                        <th className="pb-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {history.slice(-10).reverse().map((row, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          <td className="py-3 font-mono">{row.time}</td>
                          <td className="py-3 font-mono text-neon-blue">{row.output.toFixed(4)}</td>
                          <td className="py-3 font-mono">{row.setpoint.toFixed(2)}</td>
                          <td className="py-3 font-mono">{row.error.toFixed(4)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-bold">NOMINAL</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 h-[400px] flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6">Gain Evolution (Kp & Ki)</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 11, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="kp" stroke="#00d2ff" strokeWidth={2} dot={false} name="Proportional (Kp)" />
                        <Line type="monotone" dataKey="ki" stroke="#39ff14" strokeWidth={2} dot={false} name="Integral (Ki)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Performance Comparison</h3>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase">Settling Time Improvement</span>
                        <span className="text-neon-green font-bold">-24.2%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 mb-1">Before AI</p>
                          <p className="text-xl font-mono text-slate-400">1.58s</p>
                        </div>
                        <div className="p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20">
                          <p className="text-[10px] text-neon-blue mb-1">After AI</p>
                          <p className="text-xl font-mono text-neon-blue">1.20s</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase">Steady State Error</span>
                        <span className="text-neon-green font-bold">-88.5%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] text-slate-500 mb-1">Before AI</p>
                          <p className="text-xl font-mono text-slate-400">0.42</p>
                        </div>
                        <div className="p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
                          <p className="text-[10px] text-neon-green mb-1">After AI</p>
                          <p className="text-xl font-mono text-neon-green">0.05</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">System Notifications</h3>
                  <button className="text-xs text-neon-blue font-bold uppercase hover:underline">Clear All</button>
                </div>
                <div className="space-y-4">
                  {[
                    { time: '10:42:15', type: 'INFO', msg: 'AI model successfully retuned Kp to 1.245', severity: 'low' },
                    { time: '10:38:02', type: 'WARN', msg: 'Minor oscillation detected in output sensor', severity: 'medium' },
                    { time: '10:35:12', type: 'INFO', msg: 'System switched to AI_ADAPTIVE mode', severity: 'low' },
                    { time: '10:22:45', type: 'CRIT', msg: 'Load disturbance exceeded safety threshold', severity: 'high' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        alert.severity === 'high' ? "bg-neon-red/10 text-neon-red" : 
                        alert.severity === 'medium' ? "bg-neon-orange/10 text-neon-orange" : "bg-neon-blue/10 text-neon-blue"
                      )}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{alert.type} - {alert.msg}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Source: Controller_Node_01</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Model Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Version</span>
                      <span className="text-white font-mono">v2.4.1-stable</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Architecture</span>
                      <span className="text-white">LSTM-Transformer</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Retrained</span>
                      <span className="text-white">2026-02-20</span>
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">System Health</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Uptime</span>
                      <span className="text-white">14d 06h 22m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sensor Health</span>
                      <span className="text-neon-green font-bold">EXCELLENT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className="text-white">1.2 GB / 4.0 GB</span>
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Network Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Latency</span>
                      <span className="text-neon-green font-mono">12ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Packet Loss</span>
                      <span className="text-white">0.00%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">IP Address</span>
                      <span className="text-white font-mono">192.168.1.104</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mx-auto">
                  <Settings size={32} className="text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold text-white">System Configuration</h3>
                <p className="text-slate-500 max-w-lg mx-auto">Access advanced hardware parameters, safety limit overrides, and model hyperparameter tuning. Restricted to authorized personnel only.</p>
                <div className="flex justify-center gap-4">
                  <button className="px-6 py-2 rounded-xl bg-neon-blue text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors">
                    Enter Maintenance Mode
                  </button>
                  <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider">
                    Download Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'insights' && activeTab !== 'monitoring' && activeTab !== 'analytics' && activeTab !== 'alerts' && activeTab !== 'admin' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 rounded-full bg-white/5 border border-white/5">
                <LayoutDashboard size={48} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Module Under Construction</h3>
                <p className="text-slate-500 max-w-md">The {activeTab} module is currently being calibrated. Please check the main dashboard for real-time telemetry.</p>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

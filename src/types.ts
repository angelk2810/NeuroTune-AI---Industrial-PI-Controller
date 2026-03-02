export type ControlMode = "MANUAL" | "AI_ADAPTIVE" | "SAFE" | "SIMULATION";

export interface SystemState {
  setpoint: number;
  output: number;
  integral: number;
  kp: number;
  ki: number;
  mode: ControlMode;
  lastUpdateTime: number;
  stabilityScore: number;
  confidenceScore: number;
  overshoot: number;
  settlingTime: number;
  disturbance: number;
  lastTunedAt: number;
  improvement: number;
  modelAccuracy: number;
  trainingDataSize: number;
  predictedRisk: number;
  anomalyScore: number;
  learningStatus: string;
  timestamp: number;
  error: number;
  controlSignal: number;
}

export interface PerformanceLog {
  id: number;
  timestamp: string;
  setpoint: number;
  output: number;
  error: number;
  kp: number;
  ki: number;
  control_signal: number;
  stability_score: number;
}

export interface Alert {
  id: number;
  timestamp: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
}

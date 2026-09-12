"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, CheckCircle, ShieldAlert, FileCode } from "lucide-react";

interface StepPayload {
  step: number;
  time: string;
  component: string;
  action: string;
  input: string;
  output: string;
  compliant: boolean;
}

const REPLAY_STEPS: StepPayload[] = [
  {
    step: 1,
    time: "00:00.012",
    component: "PromptGuard Sanitizer",
    action: "Sanitize Inbound User Request",
    input: '{ "user_query": "Transfer $50,000 to Account #88190" }',
    output: '{ "clean_query": "Transfer $50,000 to Account #88190", "jailbreak_detected": false }',
    compliant: true
  },
  {
    step: 2,
    time: "00:00.045",
    component: "Policy Evaluator Engine",
    action: "Check Daily Limit Rules",
    input: '{ "amount": 50000, "user_role": "CORPORATE_TIER_1" }',
    output: '{ "within_limit": true, "max_limit": 250000 }',
    compliant: true
  },
  {
    step: 3,
    time: "00:00.118",
    component: "LLM Decision Core (GPT-4o)",
    action: "Formulate Wire Transfer Payload",
    input: '{ "action": "EXECUTE_WIRE", "dest_acc": "88190", "amount": 50000 }',
    output: '{ "wire_id": "W9901A", "status": "PENDING_DUAL_KEY" }',
    compliant: true
  },
  {
    step: 4,
    time: "00:00.180",
    component: "Anchor Cryptographic Signer",
    action: "Generate SHA-256 DAC Chain Hash",
    input: '{ "wire_id": "W9901A", "timestamp": 1785789120 }',
    output: '{ "hash": "0x8f2a9910b42c00a188f9", "signed": true }',
    compliant: true
  }
];

export default function MissionReplayPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeStepData = REPLAY_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < REPLAY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      {/* Header Banner */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest">FORENSIC EXECUTION PLAYER</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Mission Replay</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Step-by-step playback of AI agent reasoning steps, state mutations, and policy checks.</p>
        </div>

        <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-300">
          <span className="text-slate-500 dark:text-slate-400">TARGET MISSION: </span>
          <span className="text-sky-600 dark:text-sky-400 font-bold pure-glass-badge px-3.5 py-1.5 inline-block rounded-full shadow-sm">dec_9901a (payments-service)</span>
        </div>
      </div>

      {/* Interactive Player Controls Card */}
      <div className="pure-glass-card rounded-2xl p-6 space-y-6 shadow-sm border border-slate-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="font-mono text-xs">
            <span className="text-slate-500 dark:text-slate-400">STEP {currentStep + 1} OF {REPLAY_STEPS.length}: </span>
            <span className="text-slate-900 dark:text-slate-100 font-bold text-sm ml-2">{activeStepData.component}</span>
          </div>

          {/* Playback Button Group */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentStep(0)}
              className="pure-glass-badge p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition rounded-xl shadow-sm"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="pure-glass-badge p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition rounded-xl shadow-sm"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="pure-glass-badge px-5 py-2.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold flex items-center space-x-2 transition rounded-xl shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="font-mono text-xs">{isPlaying ? "PAUSE" : "PLAY"}</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === REPLAY_STEPS.length - 1}
              className="pure-glass-badge p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition rounded-xl shadow-sm"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Timeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {REPLAY_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`p-3.5 rounded-xl border text-left transition shadow-sm ${
                currentStep === idx
                  ? "bg-sky-50 dark:bg-sky-500/10 border-sky-500/60 dark:border-sky-500/40 text-sky-800 dark:text-white font-bold ring-2 ring-sky-500/20"
                  : idx < currentStep
                  ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-slate-300"
                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">STEP 0{s.step} · {s.time}</div>
              <div className="truncate font-sans font-semibold text-xs mt-1 text-slate-900 dark:text-slate-100">{s.component}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Payload State Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Input Payload */}
        <div className="pure-glass-card rounded-2xl p-6 space-y-3 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
            <span className="animus-label text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">INBOUND STEP INPUT</span>
            <FileCode className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <pre className="p-4 bg-slate-900 dark:bg-[#040711] border border-slate-800 dark:border-white/10 rounded-xl text-sky-300 overflow-x-auto text-xs leading-relaxed shadow-inner">
            {activeStepData.input}
          </pre>
        </div>

        {/* Output Payload */}
        <div className="pure-glass-card rounded-2xl p-6 space-y-3 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
            <span className="animus-label text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-wider">MUTATED STEP OUTPUT</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <pre className="p-4 bg-slate-900 dark:bg-[#040711] border border-slate-800 dark:border-white/10 rounded-xl text-emerald-300 overflow-x-auto text-xs leading-relaxed shadow-inner">
            {activeStepData.output}
          </pre>
        </div>
      </div>
    </div>
  );
}

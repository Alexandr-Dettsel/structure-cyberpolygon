import React, { useState, useEffect } from 'react';
import { FLOW_SCENARIOS, NetworkFlowScenario, PROXMOX_NODES } from '../data/proxmoxData';
import { 
  Play, Pause, SkipForward, RotateCcw, ArrowRight, CheckCircle2, 
  Terminal, Shield, FileCode, Server, Radio, Info
} from 'lucide-react';

interface FlowSimulatorProps {
  onSelectNodeById?: (id: string) => void;
  activeScenario?: NetworkFlowScenario;
  onSelectScenario?: (scenario: NetworkFlowScenario) => void;
  currentStepIndex?: number;
  onStepChange?: (index: number) => void;
}

export const FlowSimulator: React.FC<FlowSimulatorProps> = ({ 
  onSelectNodeById,
  activeScenario,
  onSelectScenario,
  currentStepIndex: externalStepIndex,
  onStepChange: externalStepChange
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(activeScenario?.id || FLOW_SCENARIOS[0].id);
  const [internalStepIndex, setInternalStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentStepIndex = externalStepIndex !== undefined ? externalStepIndex : internalStepIndex;
  const setCurrentStepIndex = externalStepChange || setInternalStepIndex;

  const scenario = FLOW_SCENARIOS.find(s => s.id === selectedScenarioId) || FLOW_SCENARIOS[0];
  const currentStep = scenario.steps[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        const next = currentStepIndex < scenario.steps.length - 1 ? currentStepIndex + 1 : 0;
        if (externalStepChange) {
          externalStepChange(next);
        } else {
          setInternalStepIndex(next);
        }
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, scenario.steps.length, currentStepIndex, externalStepChange]);

  const handleSelectScenario = (sc: NetworkFlowScenario) => {
    setSelectedScenarioId(sc.id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const getNodeName = (nodeId: string) => {
    if (nodeId === 'client-remote') return 'Клиент (WAN)';
    const n = PROXMOX_NODES.find(node => node.id === nodeId);
    return n ? `${n.type.toUpperCase()} #${n.vmid} (${n.name})` : nodeId;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
      {/* Scenarios List Sidebar */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/70 p-4 flex flex-col gap-2">
        <div className="px-2 pb-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Сценарии взаимодействия</span>
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {FLOW_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-medium ${
                  isSelected
                    ? 'bg-cyan-500/10 text-cyan-200 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/50 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-200 mb-1">{sc.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{sc.description}</div>
              </button>
            );
          })}
        </div>

        {/* Proxmox Host Badge */}
        <div className="mt-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Серверная среда:</div>
          <div>Хост: <strong className="text-slate-200 font-mono">kiberpoligon</strong> (PVE 8.2)</div>
          <div>Сетевой мост: <strong className="text-cyan-400 font-mono">vmbr0</strong> (172.18.4.x)</div>
        </div>
      </div>

      {/* Interactive Simulation Area */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
                ШАГ {currentStepIndex + 1} ИЗ {scenario.steps.length}
              </div>
              <h2 className="text-xl font-bold text-white">
                {scenario.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {scenario.description}
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  isPlaying 
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? 'Пауза' : 'Авто-воспроизведение'}
              </button>

              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded-lg transition-colors font-medium"
              >
                Назад
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStepIndex === scenario.steps.length - 1}
                className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded-lg transition-colors font-medium flex items-center gap-1"
              >
                Вперед <SkipForward className="w-3 h-3" />
              </button>

              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Сбросить к началу"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            {scenario.steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-850 border-cyan-400 text-white shadow-md shadow-cyan-950/20'
                      : isPast
                      ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={isCurrent ? 'text-cyan-400 font-bold' : ''}>Шаг {idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-semibold truncate">{st.label}</div>
                </div>
              );
            })}
          </div>

          {/* Current Step Animated Pathway Box */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
            {/* Visual Flow Route */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 mb-4">
              {/* Origin Node */}
              <div 
                onClick={() => onSelectNodeById?.(currentStep.fromId)}
                className="flex items-center gap-3 p-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Источник</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {getNodeName(currentStep.fromId)}
                  </div>
                </div>
              </div>

              {/* Protocol Animated Badge */}
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
                  <span>{currentStep.protocol}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 rounded text-slate-300 border border-slate-700">
                    Port {currentStep.port}
                  </span>
                </div>
                <div className="w-full relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[pulse_1.5s_infinite]" />
                </div>
              </div>

              {/* Destination Node */}
              <div 
                onClick={() => onSelectNodeById?.(currentStep.toId)}
                className="flex items-center gap-3 p-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Приемник</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {getNodeName(currentStep.toId)}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Detailed Description */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" /> Механизм работы на этом шаге:
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentStep.detail}
              </p>
            </div>

            {/* Code Snippet if applicable */}
            {currentStep.codeSnippet && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-mono text-purple-400 font-semibold mb-2 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> Фрагмент кода (Cyberpolygon-Interface):
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-purple-200 overflow-x-auto">
                  {currentStep.codeSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Вся передача данных происходит внутри изолированного виртуального свитча <strong className="text-slate-300">vmbr0</strong> на Proxmox хосте.
          </span>
          <span className="text-[11px] text-slate-500">
            Нажимайте «Вперед» для пошагового разбора
          </span>
        </div>
      </div>
    </div>
  );
};

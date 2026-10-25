import React from 'react';
import { 
  X, 
  Cpu, 
  HardDrive, 
  Network, 
  FileCode, 
  Server, 
  ShieldCheck, 
  Terminal, 
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ProxmoxNode } from '../data/proxmoxData';

interface NodeDetailModalProps {
  node: ProxmoxNode | null;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectConnectedNode?: (nodeId: string) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  onClose,
  onSelectNode,
  onSelectConnectedNode,
}) => {
  const handleSelect = onSelectNode || onSelectConnectedNode || (() => {});

  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold">
              {node.vmid}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {node.type === 'lxc' ? 'LXC Контейнер' : 'KVM Виртуальная машина'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{node.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Description */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-1.5">Назначение узла</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              {node.description}
            </p>
          </div>

          {/* Role in Cyberpolygon */}
          <div>
            <h4 className="text-xs font-mono uppercase text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Роль в архитектуре киберполигона (ВУЦ НИУ ВШЭ)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-cyan-950/20 p-3.5 rounded-xl border border-cyan-500/20">
              {node.roleInCyberpolygon}
            </p>
          </div>

          {/* Hardware & Network Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> vCPU
              </div>
              <div className="text-sm font-bold text-white">{node.resources.cores} Cores</div>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> RAM
              </div>
              <div className="text-sm font-bold text-white">{node.resources.ram}</div>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Storage
              </div>
              <div className="text-sm font-bold text-white">{node.resources.disk}</div>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> ОС
              </div>
              <div className="text-xs font-semibold text-white truncate">{node.os}</div>
            </div>
          </div>

          {/* IP & Ports */}
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" /> Сетевой адрес (Proxmox vmbr0)
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                {node.ip}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block mb-2">Слушающие порты и сервисы:</span>
              <div className="flex flex-wrap gap-2">
                {node.ports.map((p, idx) => (
                  <span key={idx} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-200 border border-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Connected Peers */}
          {node.connectedTo.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                Связанные узлы в сети
              </h4>
              <div className="space-y-2">
                {node.connectedTo.map((conn, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{conn.label}</span>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Протокол: {conn.protocol} (Порт {conn.port})
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(conn.targetId)}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20"
                    >
                      Перейти <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Code Files */}
          {node.relatedCodeFiles.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Связанные файлы в репозитории Cyberpolygon-Interface
              </h4>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {node.relatedCodeFiles.map((file, idx) => (
                  <span key={idx} className="rounded-md bg-slate-950 px-2.5 py-1 text-emerald-300 border border-emerald-500/30">
                    {file}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Config Snippet */}
          {node.configSnippet && (
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
                Конфигурационный фрагмент / параметры развертывания
              </h4>
              <pre className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {node.configSnippet}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PROXMOX_NODES, PROXMOX_HOST, ProxmoxNode } from './data/proxmoxData';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { FlowSimulator } from './components/FlowSimulator';
import { NetworkMatrix } from './components/NetworkMatrix';
import { ProxmoxHostOverview } from './components/ProxmoxHostOverview';
import { NodeDetailModal } from './components/NodeDetailModal';
import { 
  Server, Network, Play, HardDrive, Shield, Activity, 
  ExternalLink, Layers, Search, Cpu, Database, Lock
} from 'lucide-react';

type TabType = 'topology' | 'flows' | 'matrix' | 'host';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('topology');
  const [selectedNode, setSelectedNode] = useState<ProxmoxNode | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleSelectNodeById = (nodeId: string) => {
    const node = PROXMOX_NODES.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top NOC Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Node Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Киберполигон ВУЦ НИУ ВШЭ
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Proxmox 8.2.2 Online
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Архитектурная схема взаимодействия сервисов • Узел <span className="text-cyan-400 font-semibold">{PROXMOX_HOST.name}</span>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'topology'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Топология сети
            </button>

            <button
              onClick={() => setActiveTab('flows')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'flows'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Потоки данных
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Матрица портов
            </button>

            <button
              onClick={() => setActiveTab('host')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'host'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Хост Proxmox
            </button>
          </div>

          {/* Quick External Link to Github Repo */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://github.com/Ohlomonchick/Cyberpolygon-Interface"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Cyberpolygon-Interface</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Secondary Bar: Category Filters & Metrics */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-mono mr-1">Фильтр:</span>
            {[
              { id: 'all', label: 'Все узлы (13)' },
              { id: 'core', label: 'Ядро: Web & DB' },
              { id: 'access', label: 'Шлюз VLESS' },
              { id: 'lab', label: 'Лабы: PNET & Win10' },
              { id: 'security', label: 'Безопасность: ELK & SpiderFoot' },
              { id: 'infra', label: 'Инфраструктура: LDAP & Tests' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Шлюз VLESS: <strong className="text-slate-200">443 / Reality</strong></span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Postgres: <strong className="text-slate-200">5432</strong></span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>PNETLab: <strong className="text-slate-200">16 vCPU KVM</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <ArchitectureCanvas
              onSelectNode={(node) => setSelectedNode(node)}
              selectedCategory={categoryFilter}
            />

            {/* Explanatory cards underneath canvas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-bold text-cyan-400 font-mono mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> 1. Безопасный периметр (VLESS)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Все курсанты и преподаватели подключаются через <strong>VM 108 (VLESS)</strong>. Доступ к веб-интерфейсу 102 и лабораторным 111 возможен только после успешной авторизации в туннеле.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 font-mono mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> 2. Автоматизация развертывания
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  При выдаче работы <strong>LXC 102 (Django)</strong> через REST API обращается к <strong>VM 111 (PNETLab)</strong>, создает персональные лабораторные для каждого курсанта и через SSH доставляет динамические флаги.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-bold text-amber-400 font-mono mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 3. Аудит и мониторинг (ELK)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>LXC 112 (Elasticsearch + Kibana)</strong> собирает сетевые логи атак Suricata из виртуальных сегментов, позволяя проводить анализ инцидентов и обучать курсантов защите инфраструктуры.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flows' && (
          <FlowSimulator
            onSelectNodeById={handleSelectNodeById}
          />
        )}

        {activeTab === 'matrix' && (
          <NetworkMatrix />
        )}

        {activeTab === 'host' && (
          <ProxmoxHostOverview />
        )}
      </main>

      {/* Node Detail Slide-over / Modal */}
      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={handleSelectNodeById}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Учебно-лабораторный комплекс (УЛК) Киберполигон • ВУЦ НИУ ВШЭ • Хост: kiberpoligon (Proxmox VE 8.2.2)
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { PROXMOX_NODES, PROXMOX_HOST, ProxmoxNode } from '../data/proxmoxData';
import { 
  Server, Shield, Database, Network, Globe, Lock, Cpu, 
  Terminal, Eye, Layers, ZoomIn, ZoomOut, RotateCcw, 
  ArrowRight, Radio, Laptop, CheckCircle2, Info
} from 'lucide-react';

interface ArchitectureCanvasProps {
  onSelectNode: (node: ProxmoxNode) => void;
  selectedNode?: ProxmoxNode | null;
  activeFlowScenario?: string | null;
  selectedCategory?: string;
  activeScenario?: any;
  currentStepIndex?: number;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  onSelectNode,
  selectedNode,
  activeFlowScenario,
  selectedCategory = 'all'
}) => {
  const [zoom, setZoom] = useState(1);
  const [showFlows, setShowFlows] = useState(true);

  const getNode = (id: string) => PROXMOX_NODES.find(n => n.id === id);

  const vlessNode = getNode('vm-108');
  const webNode = getNode('ct-102');
  const pgNode = getNode('ct-101');
  const pnetNode = getNode('vm-111');
  const elkNode = getNode('ct-112');
  const ldapNode = getNode('ct-200');
  const ldapAdminNode = getNode('ct-201');
  const biblioNode = getNode('ct-104');
  const spiderNode = getNode('ct-115');
  const newsNode = getNode('ct-113');
  const win10Node = getNode('vm-105');
  const testNode = getNode('vm-100');
  const cliNode = getNode('vm-107');

  const isHighlighted = (node: ProxmoxNode) => {
    if (selectedCategory !== 'all' && node.category !== selectedCategory) {
      return false;
    }
    return true;
  };

  return (
    <div className="relative w-full h-[760px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden select-none flex flex-col">
      {/* Top Canvas Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              ХОСТ: {PROXMOX_HOST.name} ({PROXMOX_HOST.version})
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Мост: <span className="text-cyan-400">{PROXMOX_HOST.bridge}</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Подсеть: <span className="text-amber-400">{PROXMOX_HOST.internalSubnet}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFlows(!showFlows)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
              showFlows 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {showFlows ? 'Анимация трафика: ВКЛ' : 'Трафик: ВЫКЛ'}
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Уменьшить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-1.5 text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Увеличить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors ml-0.5"
              title="Сбросить"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-6 relative flex items-center justify-center">
        <div 
          className="relative transition-transform duration-200 origin-center min-w-[1100px] w-full max-w-[1280px]"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* External WAN Client Card */}
          <div className="mb-6 flex items-center justify-center">
            <div className="p-3.5 px-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/70 border border-indigo-500/30 shadow-xl flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-indigo-300 flex items-center gap-2">
                  <span>ВНЕШНИЙ КЛИЕНТ (WAN / ИНТЕРНЕТ)</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 rounded text-indigo-200">
                    Курсанты / Преподаватели дома
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Подключение через приложение-клиент (Xray, v2rayN, NekoBox) по защищенному VLESS Reality протоколу
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40">
                <Lock className="w-3.5 h-3.5" />
                <span>TLS 1.3 / Port 443</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Proxmox Host Enclosure Frame */}
          <div className="relative p-6 rounded-3xl bg-slate-900/60 border-2 border-slate-700/80 shadow-2xl backdrop-blur-md">
            {/* Proxmox Tag Top Right */}
            <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-orange-600 text-white font-mono text-xs font-bold shadow-lg flex items-center gap-2">
              <Server className="w-3.5 h-3.5" />
              PROXMOX VE 8.2.2 HOST [kiberpoligon]
            </div>

            {/* Linux Bridge Banner */}
            <div className="mb-6 p-2.5 px-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-cyan-300">Виртуальный коммутатор:</span>
                <span className="text-slate-400">vmbr0 (Linux Bridge) • 172.18.4.0/24 • Внутренний роутинг контейнеров и ВМ</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> LXC: 8 контейнеров
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> QEMU/KVM: 5 ВМ
                </span>
              </div>
            </div>

            {/* Main Architecture Grid */}
            <div className="grid grid-cols-12 gap-5">
              
              {/* Left Column: Access Gateway (VM 108 VLESS) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 px-1">
                  <Shield className="w-4 h-4 text-cyan-400" /> 1. Входной шлюз (VPN)
                </div>

                {vlessNode && (
                  <div
                    onClick={() => onSelectNode(vlessNode)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isHighlighted(vlessNode)
                        ? 'bg-slate-900 hover:bg-slate-850 border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-950/30'
                        : 'opacity-40 bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        VM #{vlessNode.vmid}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-cyan-400" /> {vlessNode.name}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {vlessNode.description}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Port 443 / Reality</span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Инспектор →</span>
                    </div>

                    {/* Animated Pulse Beam to Web */}
                    {showFlows && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                    )}
                  </div>
                )}

                {/* Extra Infobox on VLESS */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" /> Как работает VLESS:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Трафик шифруется XTLS Vision / Reality и без задержек пробрасывается в сеть полигона. Студент получает доступ к веб-панели и консолям лабораторных из любой точки.
                  </p>
                </div>

                {/* LDAP Services under Gateway */}
                <div className="mt-2 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 px-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" /> Служба учетных записей
                  </div>

                  {ldapNode && (
                    <div
                      onClick={() => onSelectNode(ldapNode)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isHighlighted(ldapNode)
                          ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-700 hover:border-indigo-400'
                          : 'opacity-40 bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-indigo-400 font-semibold">LXC #{ldapNode.vmid} {ldapNode.name}</span>
                        <span className="text-slate-500">Port 389</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">OpenLDAP единый каталог курсантов</div>
                    </div>
                  )}

                  {ldapAdminNode && (
                    <div
                      onClick={() => onSelectNode(ldapAdminNode)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isHighlighted(ldapAdminNode)
                          ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-700 hover:border-indigo-400'
                          : 'opacity-40 bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">LXC #{ldapAdminNode.vmid} {ldapAdminNode.name}</span>
                        <span className="text-slate-500">Port 80</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column: Core Management Tier (Django Web 102 & Postgres 101) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 px-1">
                  <Cpu className="w-4 h-4 text-emerald-400" /> 2. Ядро управления (Control Plane)
                </div>

                {/* Web Interface 102 */}
                {webNode && (
                  <div
                    onClick={() => onSelectNode(webNode)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isHighlighted(webNode)
                        ? 'bg-slate-900 hover:bg-slate-850 border-emerald-500/50 hover:border-emerald-400 shadow-xl shadow-emerald-950/30'
                        : 'opacity-40 bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        LXC #{webNode.vmid} • CENTRAL
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-400" /> {webNode.name}
                    </div>
                    <div className="text-xs text-emerald-300 font-mono mb-2">
                      Django 5.0 + Gunicorn gevent (8002) + Nginx (8080)
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      Оркестратор киберполигона: ведение соревнований, выдача заданий, SSH-раскатка флагов и веб-интерфейс.
                    </p>
                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 mb-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Воркеры:</span>
                        <span className="text-emerald-400 font-semibold">3 Gunicorn (Gevent)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Планировщик:</span>
                        <span className="text-cyan-400 font-semibold">APScheduler (autoclean)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>172.18.4.102</span>
                      <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">Инспектор →</span>
                    </div>
                  </div>
                )}

                {/* PostgreSQL 101 */}
                {pgNode && (
                  <div
                    onClick={() => onSelectNode(pgNode)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isHighlighted(pgNode)
                        ? 'bg-slate-900 hover:bg-slate-850 border-blue-500/40 hover:border-blue-400 shadow-lg shadow-blue-950/30'
                        : 'opacity-40 bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        LXC #{pgNode.vmid} • DATABASE
                      </span>
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" /> {pgNode.name}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      PostgreSQL 15: хранение таблиц соревнований, вариантов лаб, флагов и ответов.
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Port 5432 / TCP</span>
                      <span className="text-blue-400 group-hover:translate-x-1 transition-transform">Инспектор →</span>
                    </div>
                  </div>
                )}

                {/* ELK / SIEM 112 */}
                {elkNode && (
                  <div
                    onClick={() => onSelectNode(elkNode)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isHighlighted(elkNode)
                        ? 'bg-slate-900 hover:bg-slate-850 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/30'
                        : 'opacity-40 bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        LXC #{elkNode.vmid} • OBSERVABILITY
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" /> {elkNode.name} (Elasticsearch & Kibana)
                    </div>
                    <div className="text-[11px] text-slate-400 mb-2">
                      Elasticsearch: 9200 • Kibana: 5601
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Сбор логов атак Suricata NIDS и аудит действий для расследования инцидентов.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Virtual Lab Emulation (VM 111 PNETLab) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 px-1">
                  <Layers className="w-4 h-4 text-purple-400" /> 3. Среда эмуляции лабораторных
                </div>

                {/* PNETLab 111 Card with Nested Nodes */}
                {pnetNode && (
                  <div
                    onClick={() => onSelectNode(pnetNode)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isHighlighted(pnetNode)
                        ? 'bg-slate-900 hover:bg-slate-850 border-purple-500/50 hover:border-purple-400 shadow-xl shadow-purple-950/30'
                        : 'opacity-40 bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        VM #{pnetNode.vmid} • NESTED KVM
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> 16 vCPU / 32 GB RAM
                      </span>
                    </div>

                    <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-purple-400" /> {pnetNode.name} (PNETLab / EVE-NG)
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      Аппаратная виртуализация KVM внутри KVM. Динамически запускает сетевые топологии для каждого курсанта и взвода.
                    </p>

                    {/* Inside Nested Sub-nodes visualizer */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/40 space-y-2 mb-3">
                      <div className="text-[11px] font-mono font-semibold text-purple-300 flex items-center justify-between">
                        <span>Вложенные сущности топологии:</span>
                        <span className="text-slate-500">EVE API</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Docker Nodes
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            pnetlab/ubuntu_sv (SSH, Flag injection)
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Routers / Switches
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Cisco IOU, VyOS, pfSense
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Guacamole HTML5
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Консоли нод прямо в браузере
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Flash / USB emu
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            QEMU usb_flash.img injection
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Динамические порты: 32768+</span>
                      <span className="text-purple-400 group-hover:translate-x-1 transition-transform">Инспектор →</span>
                    </div>
                  </div>
                )}

                {/* Additional VMs row: win10, testing, etc. */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {win10Node && (
                    <div
                      onClick={() => onSelectNode(win10Node)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isHighlighted(win10Node)
                          ? 'bg-slate-900 hover:bg-slate-850 border-slate-700 hover:border-cyan-400'
                          : 'opacity-40 bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-mono font-semibold text-slate-200 flex items-center justify-between">
                        <span>VM #{win10Node.vmid} {win10Node.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Windows 10 для стендов анализа малвари</div>
                    </div>
                  )}

                  {testNode && (
                    <div
                      onClick={() => onSelectNode(testNode)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isHighlighted(testNode)
                          ? 'bg-slate-900 hover:bg-slate-850 border-slate-700 hover:border-emerald-400'
                          : 'opacity-40 bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-mono font-semibold text-slate-200 flex items-center justify-between">
                        <span>VM #{testNode.vmid} {testNode.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">E2E интеграционные тесты (pytest)</div>
                    </div>
                  )}
                </div>

                {/* Auxiliary Services mini bar */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  {biblioNode && (
                    <button
                      onClick={() => onSelectNode(biblioNode)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px]"
                    >
                      LXC #{biblioNode.vmid} biblioteka
                    </button>
                  )}
                  {spiderNode && (
                    <button
                      onClick={() => onSelectNode(spiderNode)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px]"
                    >
                      LXC #{spiderNode.vmid} SpiderFoot
                    </button>
                  )}
                  {newsNode && (
                    <button
                      onClick={() => onSelectNode(newsNode)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px]"
                    >
                      LXC #{newsNode.vmid} news-bot
                    </button>
                  )}
                  {cliNode && (
                    <button
                      onClick={() => onSelectNode(cliNode)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px]"
                    >
                      VM #{cliNode.vmid} CLI
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Storage Pools Strip on Proxmox */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300 font-mono">Пулы хранения Proxmox:</span>
                {PROXMOX_HOST.storagePools.map((pool, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300"
                    title={pool.usage}
                  >
                    💾 {pool.name} <span className="text-slate-500">({pool.type})</span>
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-slate-500">
                Кликните на любой узел для просмотра полного досье и конфигурации
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

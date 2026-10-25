import React from 'react';
import { PROXMOX_HOST, PROXMOX_NODES } from '../data/proxmoxData';
import { 
  Server, HardDrive, Cpu, Network, Shield, CheckCircle2, 
  Layers, Terminal, AlertTriangle, FileCode
} from 'lucide-react';
import { ProxmoxNode } from '../data/proxmoxData';

interface ProxmoxHostOverviewProps {
  onSelectNode?: (node: ProxmoxNode) => void;
}

export const ProxmoxHostOverview: React.FC<ProxmoxHostOverviewProps> = ({ onSelectNode }) => {
  const lxcCount = PROXMOX_NODES.filter(n => n.type === 'lxc').length;
  const qemuCount = PROXMOX_NODES.filter(n => n.type === 'qemu').length;

  return (
    <div className="space-y-6">
      {/* Host Summary Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-orange-600/20 text-orange-400 rounded-2xl border border-orange-500/30 shadow-inner">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Узел: {PROXMOX_HOST.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-600/20 text-orange-300 border border-orange-500/40">
                  {PROXMOX_HOST.version}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="ONLINE" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Management IP: <span className="text-cyan-400">{PROXMOX_HOST.managementIp}</span> • Внутренний коммутатор: <span className="text-amber-400">{PROXMOX_HOST.bridge}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-lg font-bold font-mono text-emerald-400">{lxcCount}</div>
              <div className="text-[10px] font-mono uppercase text-slate-500">LXC Контейнеров</div>
            </div>
            <div className="p-3 px-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-lg font-bold font-mono text-cyan-400">{qemuCount}</div>
              <div className="text-[10px] font-mono uppercase text-slate-500">QEMU / KVM ВМ</div>
            </div>
          </div>
        </div>

        {/* Key Architectural Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 mb-2">
              <Layers className="w-4 h-4" />
              Аппаратная вложенная виртуализация (Nested KVM)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              На хосте включен модуль ядра <code className="text-cyan-300 font-mono">kvm_intel nested=Y</code>. Это позволяет виртуальной машине <strong>VM 111 (PNETLab)</strong> запускать внутри себя полноценные виртуальные роутеры, Cisco IOU и QEMU образы лабораторных работ с аппаратным ускорением процессора.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 mb-2">
              <Shield className="w-4 h-4" />
              Изоляция через LXC и KVM
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Веб-интерфейс (102), PostgreSQL (101) и ELK (112) вынесены в легковесные LXC-контейнеры с общим ядром Linux для максимальной скорости отклика (sub-millisecond latency), а сетевые стенды и VLESS изолированы в KVM для абсолютной стабильности.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 mb-2">
              <Network className="w-4 h-4" />
              Защищенный периметр без открытых портов
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Сервер не имеет открытых веб-портов напрямую в дикий Интернет. Единственная точка входа — <strong>VM 108 (VLESS Reality)</strong> на 443 порту. Доступ к Django и PNETLab возможен только через VPN-туннель.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Pools Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          Пулы хранения данных Proxmox (Storage Pools)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Дисковые разделы хоста kiberpoligon, на которых размещены образы ВМ и файловые системы контейнеров
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROXMOX_HOST.storagePools.map((pool, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-white">{pool.name}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                  {pool.type}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {pool.usage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Manager & Deployment Pipeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          Службы развертывания внутри LXC 102 (web-interface)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Демоны systemd и конфигурации, сгенерированные скриптом <code className="text-purple-300 font-mono">sre/deploy.py</code>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-400">
              <span>cyberpolygon.service</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px]">systemd unit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Основной сервис Gunicorn с асинхронным движком Gevent (3 воркера, порт 8002). Обрабатывает HTTP API вызовы, выдачу заданий, парсинг ответов и авторизацию.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              ExecStart: /root/Cyberpolygon-Interface/sre/run_prod.sh
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-cyan-400">
              <span>cyberpolygon-scheduler.service</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px]">systemd unit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Фоновый планировщик APScheduler. Автоматически очищает завершенные лабораторные сессии в PNETLab через 1 час после окончания соревнования, экономя память хоста.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Command: python manage.py runapscheduler
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

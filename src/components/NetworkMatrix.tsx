import React, { useState } from 'react';
import { PROXMOX_NODES } from '../data/proxmoxData';
import { Network, Search, Filter, ShieldCheck, ArrowRight, Server } from 'lucide-react';

interface MatrixRow {
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  port: string;
  protocol: string;
  purpose: string;
  securityZone: 'WAN to LAN' | 'Internal Core' | 'Management' | 'Observability';
}

const MATRIX_DATA: MatrixRow[] = [
  {
    source: 'Внешний клиент (WAN)',
    sourceType: 'Internet',
    target: 'VM 108 (VLESS)',
    targetType: 'QEMU',
    port: '443 / TCP',
    protocol: 'VLESS Reality / XTLS',
    purpose: 'Защищенный туннель удаленного доступа курсантов и преподавателей из дома',
    securityZone: 'WAN to LAN'
  },
  {
    source: 'VM 108 (VLESS)',
    sourceType: 'QEMU',
    target: 'LXC 102 (web-interface)',
    targetType: 'LXC',
    port: '8080, 80 / TCP',
    protocol: 'HTTP',
    purpose: 'Проброс запросов к веб-интерфейсу Django УЛК и Nginx',
    securityZone: 'Internal Core'
  },
  {
    source: 'LXC 102 (web-interface)',
    sourceType: 'LXC',
    target: 'LXC 101 (postgres)',
    targetType: 'LXC',
    port: '5432 / TCP',
    protocol: 'PostgreSQL Protocol',
    purpose: 'Транзакции Django ORM (пользователи, варианты лаб, задания, ответы)',
    securityZone: 'Internal Core'
  },
  {
    source: 'LXC 102 (web-interface)',
    sourceType: 'LXC',
    target: 'VM 111 (PNETLab)',
    targetType: 'QEMU',
    port: '80 / HTTP',
    protocol: 'REST API & Cookie Auth',
    purpose: 'Создание лаб (/api/labs), сессий (/factory/create), опрос топологии (/session/topology)',
    securityZone: 'Internal Core'
  },
  {
    source: 'LXC 102 (web-interface)',
    sourceType: 'LXC',
    target: 'VM 111 (PNETLab гостевые ноды)',
    targetType: 'QEMU (Nested)',
    port: '32768-36000 / SSH',
    protocol: 'SSH (Fabric / Paramiko)',
    purpose: 'Асинхронная доставка CTF-флагов в /etc/configs/checker_conf.json ноды',
    securityZone: 'Internal Core'
  },
  {
    source: 'Браузер курсанта (через Nginx 102)',
    sourceType: 'LXC / Proxy',
    target: 'VM 111 (PNETLab)',
    targetType: 'QEMU',
    port: '80 / WebSocket',
    protocol: 'Apache Guacamole WebSocket',
    purpose: 'HTML5 веб-консоль терминала Linux и GUI без необходимости ставить софт',
    securityZone: 'Internal Core'
  },
  {
    source: 'LXC 102 (web-interface)',
    sourceType: 'LXC',
    target: 'LXC 112 (elk)',
    targetType: 'LXC',
    port: '9200 / HTTP',
    protocol: 'Elasticsearch REST API',
    purpose: 'Регистрация событий сдачи заданий, синхронизация прав пользователей индексов',
    securityZone: 'Observability'
  },
  {
    source: 'Преподаватель (через VLESS 108)',
    sourceType: 'QEMU',
    target: 'LXC 112 (elk)',
    targetType: 'LXC',
    port: '5601 / HTTP',
    protocol: 'HTTP (Kibana)',
    purpose: 'Просмотр аналитических дашбордов активности полигона и сетевых атак Suricata',
    securityZone: 'Observability'
  },
  {
    source: 'LXC 102 (web-interface)',
    sourceType: 'LXC',
    target: 'LXC 200 (ldap)',
    targetType: 'LXC',
    port: '389 / TCP',
    protocol: 'LDAP',
    purpose: 'Единая сквозная аутентификация курсантов и взводов',
    securityZone: 'Management'
  },
  {
    source: 'VM 100 (testing-platform)',
    sourceType: 'QEMU',
    target: 'LXC 102 & VM 111',
    targetType: 'Internal',
    port: '80, 8080, 55431',
    protocol: 'HTTP & Pytest',
    purpose: 'Регулярные e2e тесты автоматизации полигона (Gunicorn, сессии, флаги)',
    securityZone: 'Management'
  }
];

export const NetworkMatrix: React.FC = () => {
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const filteredData = MATRIX_DATA.filter((item) => {
    const matchesSearch = 
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.target.toLowerCase().includes(search.toLowerCase()) ||
      item.protocol.toLowerCase().includes(search.toLowerCase()) ||
      item.port.toLowerCase().includes(search.toLowerCase()) ||
      item.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesZone = zoneFilter === 'all' || item.securityZone === zoneFilter;

    return matchesSearch && matchesZone;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Сетевая матрица портов и межсетевого взаимодействия
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Таблица сетевых потоков на виртуальном коммутаторе Proxmox VE (vmbr0)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по порту, узлу или протоколу..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden focus:border-cyan-400 transition-colors"
          >
            <option value="all">Все зоны безопасности</option>
            <option value="WAN to LAN">WAN to LAN (Вход)</option>
            <option value="Internal Core">Internal Core (Ядро)</option>
            <option value="Observability">Observability (ELK)</option>
            <option value="Management">Management (Управление)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400">
              <th className="py-3 px-4 font-semibold">ИСТОЧНИК</th>
              <th className="py-3 px-2 text-center">НАПРАВЛЕНИЕ</th>
              <th className="py-3 px-4 font-semibold">ПРИЕМНИК</th>
              <th className="py-3 px-4 font-semibold">ПОРТ / СЕТЬ</th>
              <th className="py-3 px-4 font-semibold">ПРОТОКОЛ</th>
              <th className="py-3 px-4 font-semibold">ЗОНА</th>
              <th className="py-3 px-4 font-semibold">НАЗНАЧЕНИЕ ПОТОКА</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{row.source}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-slate-500">
                  <ArrowRight className="w-3.5 h-3.5 inline text-slate-400" />
                </td>
                <td className="py-3 px-4 font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{row.target}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-amber-300">
                  {row.port}
                </td>
                <td className="py-3 px-4 font-mono text-cyan-300">
                  {row.protocol}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    row.securityZone === 'WAN to LAN' 
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                      : row.securityZone === 'Internal Core'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : row.securityZone === 'Observability'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  }`}>
                    {row.securityZone}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 leading-snug">
                  {row.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Все порты внутри Proxmox защищены фаерволом (pve-firewall) и доступны только через шлюз VLESS
        </span>
        <span className="text-[11px] text-slate-500">
          Всего правил: {filteredData.length}
        </span>
      </div>
    </div>
  );
};

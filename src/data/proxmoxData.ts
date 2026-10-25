export interface ProxmoxNode {
  id: string;
  vmid: number;
  name: string;
  type: 'lxc' | 'qemu';
  category: 'core' | 'infra' | 'lab' | 'security' | 'access';
  ip: string;
  ports: string[];
  os: string;
  status: 'running' | 'stopped';
  description: string;
  roleInCyberpolygon: string;
  relatedCodeFiles: string[];
  configSnippet?: string;
  resources: {
    cores: number;
    ram: string;
    disk: string;
  };
  connectedTo: {
    targetId: string;
    protocol: string;
    port: string;
    label: string;
  }[];
}

export interface NetworkFlowScenario {
  id: string;
  title: string;
  description: string;
  category: 'access' | 'lab_creation' | 'flag_deploy' | 'student_session' | 'scoring' | 'elk_audit';
  steps: {
    fromId: string;
    toId: string;
    label: string;
    protocol: string;
    port: string;
    detail: string;
    codeSnippet?: string;
  }[];
}

export const PROXMOX_HOST = {
  name: 'kiberpoligon',
  version: 'Proxmox Virtual Environment 8.2.2',
  managementIp: '172.18.4.160:8006',
  internalSubnet: '172.18.4.0/24 (и 192.168.100.0/24)',
  bridge: 'vmbr0 (Linux Bridge)',
  storagePools: [
    { name: 'local', type: 'dir', usage: 'ISO-образы, шаблоны VZT' },
    { name: 'local-lvm', type: 'lvmthin', usage: 'Диски базовых контейнеров' },
    { name: 'ssd-2tb-lvm', type: 'lvmthin', usage: 'Быстрые диски для тяжелых лаб PNETLab и ELK' },
    { name: 'BackUp', type: 'nfs/dir', usage: 'Снапшоты и бэкапы Proxmox' },
    { name: 'localnetwork', type: 'bridge', usage: 'Внутренний свитч стендов' }
  ]
};

export const PROXMOX_NODES: ProxmoxNode[] = [
  {
    id: 'vm-108',
    vmid: 108,
    name: 'VLESS',
    type: 'qemu',
    category: 'access',
    ip: '172.18.4.108 / Внешний WAN IP',
    ports: ['443 (VLESS / Xray)', '80 (XTLS/Reality fallback)'],
    os: 'Linux (Debian 12 / Alpine)',
    status: 'running',
    description: 'VPN-шлюз безопасного удаленного доступа через протокол VLESS (Xray / Reality / TLS).',
    roleInCyberpolygon: 'Обеспечивает защищенный вход для курсантов, преподавателей и разработчиков из внешнего Интернета напрямую во внутреннюю закрытую сеть полигона (172.18.4.0/24). Минимизирует риск сканирования периметра и обходит NAT.',
    relatedCodeFiles: ['sre/nginx_local.conf', 'sre/deploy.py'],
    configSnippet: `# Xray VLESS config snippet:
{
  "inbounds": [{
    "port": 443,
    "protocol": "vless",
    "settings": { "clients": [{ "id": "uuid-student-key", "flow": "xtls-rprx-vision" }], "decryption": "none" },
    "streamSettings": { "network": "tcp", "security": "reality" }
  }],
  "outbounds": [{ "protocol": "freedom" }] # Роутит пакеты в vmbr0 (172.18.4.x)
}`,
    resources: { cores: 2, ram: '2 GB', disk: '20 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'HTTP/HTTPS', port: '80/8080', label: 'Доступ к веб-интерфейсу' },
      { targetId: 'vm-111', protocol: 'HTTP/Guacamole', port: '80', label: 'Прямой доступ к стендам лаб' },
      { targetId: 'ct-112', protocol: 'HTTP', port: '5601', label: 'Kibana дашборды преподавателя' }
    ]
  },
  {
    id: 'ct-102',
    vmid: 102,
    name: 'web-interface',
    type: 'lxc',
    category: 'core',
    ip: '172.18.4.102 / 172.18.4.200:8080',
    ports: ['80 (Nginx)', '8080 (Reverse Proxy)', '8002 (Gunicorn / Django)'],
    os: 'Ubuntu 22.04 LTS (LXC)',
    status: 'running',
    description: 'Центральный мозг киберполигона — Django 5.0 веб-сервис УЛК с Gunicorn gevent и Nginx.',
    roleInCyberpolygon: 'Предоставляет UI для студентов и преподавателей, управляет соревнованиями и ККЗ, оркестрирует создание сессий в PNETLab, распределяет воркспейсы, асинхронно развертывает флаги через SSH, валидирует ответы.',
    relatedCodeFiles: [
      'Cyberpolygon/settings.py',
      'interface/eveFunctions.py',
      'interface/pnet_session_manager.py',
      'interface/flag_deployment.py',
      'sre/gunicorn.conf.py',
      'sre/run_service.sh'
    ],
    configSnippet: `# sre/gunicorn.conf.py:
bind = "0.0.0.0:8002"
workers = 3
worker_class = "gevent"
timeout = 90
accesslog = "/var/log/cyberpolygon.access.log"`,
    resources: { cores: 4, ram: '4 GB', disk: '32 GB' },
    connectedTo: [
      { targetId: 'ct-101', protocol: 'TCP/PostgreSQL', port: '5432', label: 'Хранилище данных & сессий' },
      { targetId: 'vm-111', protocol: 'REST API & SSH', port: '80, 22, 32768+', label: 'Управление лабами и нодами' },
      { targetId: 'ct-112', protocol: 'Elasticsearch API', port: '9200', label: 'Отправка аудит-логов & сис-событий' },
      { targetId: 'ct-200', protocol: 'LDAP', port: '389', label: 'Аутентификация курсантов' }
    ]
  },
  {
    id: 'ct-101',
    vmid: 101,
    name: 'postgres',
    type: 'lxc',
    category: 'core',
    ip: '172.18.4.101',
    ports: ['5432 (PostgreSQL)', '5431 (Compose host map)'],
    os: 'Debian 12 / Ubuntu 22.04 (LXC)',
    status: 'running',
    description: 'Реляционная база данных PostgreSQL 15 с высокой надежностью и транзакционностью.',
    roleInCyberpolygon: 'Хранит таблицы пользователей, взводов, соревнований (Competition, TeamCompetition), назначенных вариантов (LabLevel), заданий (LabTask), сгенерированных флагов (generated_flags) и решений (Answers).',
    relatedCodeFiles: [
      'Cyberpolygon/settings.py',
      'interface/models.py',
      'dynamic_config/models.py',
      'sre/compose/docker-compose.yml'
    ],
    configSnippet: `# settings.py:
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': 'cyberpolygon',
    'USER': 'postgres',
    'HOST': '172.18.4.101',
    'PORT': '5432'
  }
}`,
    resources: { cores: 2, ram: '4 GB', disk: '50 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'PostgreSQL Protocol', port: '5432', label: 'Ответы на SQL-запросы' }
    ]
  },
  {
    id: 'vm-111',
    vmid: 111,
    name: 'PNET',
    type: 'qemu',
    category: 'lab',
    ip: '172.18.4.111 / 172.18.4.160',
    ports: ['80/443 (PNETLab Web/API)', '32768-36000 (Динамические порты SSH/Telnet/VNC)'],
    os: 'Ubuntu 20.04 (EVE-NG / PNETLab Engine)',
    status: 'running',
    description: 'Эмулятор сетевых сред PNETLab на базе KVM с аппаратной вложенной виртуализацией (nested=1).',
    roleInCyberpolygon: 'Ядро практических заданий. Поднимает топологии виртуальных маршрутизаторов, серверов, Docker-контейнеров (pnetlab/ubuntu_sv). Предоставляет студенту доступ к графическим и текстовым консолям через Guacamole без сторонних утилит.',
    relatedCodeFiles: [
      'interface/eveFunctions.py',
      'interface/lab_topology.py',
      'interface/ssh_manager.py',
      'interface/flag_deployment.py'
    ],
    configSnippet: `# Включение вложенной виртуализации на хосте Proxmox:
# echo "options kvm-intel nested=Y" > /etc/modprobe.d/kvm-intel.conf
# В настройках VM 111 CPU: host, flags: +vmx / +svm`,
    resources: { cores: 16, ram: '32 GB', disk: '500 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'JSON REST & Guacamole stream', port: '80', label: 'Сессии и топология' }
    ]
  },
  {
    id: 'ct-112',
    vmid: 112,
    name: 'elk',
    type: 'lxc',
    category: 'security',
    ip: '172.18.4.112',
    ports: ['9200 (Elasticsearch HTTP)', '9300 (ES Cluster)', '5601 (Kibana Web)'],
    os: 'Ubuntu 22.04 (LXC)',
    status: 'running',
    description: 'Стек анализа безопасности: Elasticsearch 9.1 + Kibana для сбора и визуализации логов.',
    roleInCyberpolygon: 'Собирает журналы сетевой активности из виртуальных лаб (Suricata NIDS, Syslog, auth логов). Преподаватель может в реальном времени мониторить, какие атаки проводят курсанты, а студенты учатся расследовать инциденты информационной безопасности (SIEM/SOC).',
    relatedCodeFiles: [
      'interface/elastic_utils.py',
      'sre/compose/docker-compose.yml',
      'sre/compose/elk-configs/'
    ],
    configSnippet: `# interface/elastic_utils.py:
client = Elasticsearch(
  "http://172.18.4.112:9200",
  basic_auth=("elastic", "elastic_password")
)`,
    resources: { cores: 4, ram: '8 GB', disk: '100 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'Elasticsearch REST API', port: '9200', label: 'Создание пользователей/ролей' },
      { targetId: 'vm-108', protocol: 'HTTP', port: '5601', label: 'Дашборды Kibana через VPN' }
    ]
  },
  {
    id: 'ct-200',
    vmid: 200,
    name: 'ldap',
    type: 'lxc',
    category: 'infra',
    ip: '172.18.4.200',
    ports: ['389 (LDAP)', '636 (LDAPS)'],
    os: 'Debian 12 (LXC)',
    status: 'running',
    description: 'Сервер каталогов OpenLDAP для централизованной аутентификации курсантов и преподавателей.',
    roleInCyberpolygon: 'Служит единой точкой входа (Single Source of Truth) для учетных записей студентов, групп взводов и прав доступа к полигону.',
    relatedCodeFiles: ['Cyberpolygon/settings.py', 'interface/models.py'],
    resources: { cores: 1, ram: '1 GB', disk: '10 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'LDAP', port: '389', label: 'Проверка учетных данных' },
      { targetId: 'ct-201', protocol: 'LDAP', port: '389', label: 'Администрирование каталога' }
    ]
  },
  {
    id: 'ct-201',
    vmid: 201,
    name: 'ldap-admin',
    type: 'lxc',
    category: 'infra',
    ip: '172.18.4.201',
    ports: ['80 (phpLDAPadmin)'],
    os: 'Debian 12 (LXC)',
    status: 'running',
    description: 'Веб-панель phpLDAPadmin для быстрого управления деревом учетных записей и взводов.',
    roleInCyberpolygon: 'Позволяет дежурным преподавателям заводить взводы, сбрасывать пароли и проверять OU.',
    relatedCodeFiles: ['interface/management/commands/create_users.py'],
    resources: { cores: 1, ram: '512 MB', disk: '8 GB' },
    connectedTo: [
      { targetId: 'ct-200', protocol: 'LDAP Bind', port: '389', label: 'Управление пользователями' }
    ]
  },
  {
    id: 'ct-104',
    vmid: 104,
    name: 'biblioteka',
    type: 'lxc',
    category: 'infra',
    ip: '172.18.4.104',
    ports: ['80 (HTTP)'],
    os: 'Ubuntu 22.04 (LXC)',
    status: 'running',
    description: 'Внутренняя библиотека методических пособий, регламентов и документации по киберучениям.',
    roleInCyberpolygon: 'Хранилище методичек, инструкций к лабораторным работам и справочников для курсантов во время выполнения практик.',
    relatedCodeFiles: ['templates/'],
    resources: { cores: 1, ram: '1 GB', disk: '30 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'HTTP Links', port: '80', label: 'Ссылки на методички' }
    ]
  },
  {
    id: 'ct-115',
    vmid: 115,
    name: 'SpiderFoot',
    type: 'lxc',
    category: 'security',
    ip: '172.18.4.115',
    ports: ['5001 (Web UI)'],
    os: 'Debian 12 (LXC)',
    status: 'running',
    description: 'Автоматизированный инструмент OSINT и сканирования поверхности атаки (Attack Surface Recon).',
    roleInCyberpolygon: 'Используется на продвинутых лабораторных работах по разведке уязвимостей и сбору данных о тренировочных целях.',
    relatedCodeFiles: ['interface/models.py'],
    resources: { cores: 2, ram: '2 GB', disk: '20 GB' },
    connectedTo: []
  },
  {
    id: 'ct-113',
    vmid: 113,
    name: 'news-bot',
    type: 'lxc',
    category: 'infra',
    ip: '172.18.4.113',
    ports: ['Background Service'],
    os: 'Alpine Linux (LXC)',
    status: 'running',
    description: 'Telegram/чат бот оповещений об этапах соревнований, старте лабораторных и скоринге.',
    roleInCyberpolygon: 'Служба рассылки уведомлений взводам о начале экзаменационных испытаний и статусе деплоя стендов.',
    relatedCodeFiles: ['dynamic_config/models.py'],
    resources: { cores: 1, ram: '512 MB', disk: '5 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'REST API', port: '8002', label: 'Опрос статусов мероприятий' }
    ]
  },
  {
    id: 'vm-105',
    vmid: 105,
    name: 'win10',
    type: 'qemu',
    category: 'lab',
    ip: '172.18.4.105',
    ports: ['3389 (RDP)', '5985 (WinRM)'],
    os: 'Windows 10 Enterprise (KVM)',
    status: 'running',
    description: 'Эталонная рабочая станция Windows 10 для стендов Active Directory, криминалистики и реверс-инжиниринга.',
    roleInCyberpolygon: 'Используется как рабочее место атакующего или жертвы в сценариях расследования инцидентов.',
    relatedCodeFiles: [],
    resources: { cores: 4, ram: '8 GB', disk: '60 GB' },
    connectedTo: [
      { targetId: 'vm-111', protocol: 'Bridged Network', port: 'Any', label: 'Подключение к сетевым сегментам лабы' }
    ]
  },
  {
    id: 'vm-100',
    vmid: 100,
    name: 'testing-platform',
    type: 'qemu',
    category: 'infra',
    ip: '172.18.4.100',
    ports: ['80 (Runner / Jenkins / PyTest)'],
    os: 'Ubuntu 22.04 (KVM)',
    status: 'running',
    description: 'Платформа автоматического e2e тестирования киберполигона и проверки решений.',
    roleInCyberpolygon: 'Запускает интеграционные тесты (pytest -m integration), проверяет целостность скриптов деплоя и готовность окружений.',
    relatedCodeFiles: [
      'integration_tests/README.md',
      'integration_tests/test_flag_deployment_e2e.py',
      'integration_tests/test_competition_lab_provisioning_e2e.py'
    ],
    resources: { cores: 4, ram: '6 GB', disk: '40 GB' },
    connectedTo: [
      { targetId: 'ct-102', protocol: 'HTTP', port: '80', label: 'Тестирование веб-интерфейса' },
      { targetId: 'vm-111', protocol: 'API', port: '80', label: 'Тестирование развертывания лаб' }
    ]
  },
  {
    id: 'vm-107',
    vmid: 107,
    name: 'command-line',
    type: 'qemu',
    category: 'infra',
    ip: '172.18.4.107',
    ports: ['22 (SSH)'],
    os: 'Debian 12 Minimal (KVM)',
    status: 'running',
    description: 'Изолированный jump-host (бастион) для администрирования внутренней подсети полигона.',
    roleInCyberpolygon: 'Терминальная точка входа системных инженеров для прямой отладки сетевых свитчей и мостов.',
    relatedCodeFiles: ['sre/run_service.sh'],
    resources: { cores: 2, ram: '2 GB', disk: '20 GB' },
    connectedTo: [
      { targetId: 'vm-111', protocol: 'SSH', port: '22', label: 'SSH доступ к хосту PNET' }
    ]
  }
];

export const FLOW_SCENARIOS: NetworkFlowScenario[] = [
  {
    id: 'flow-vless-access',
    title: '1. Внешний доступ через VLESS VPN',
    category: 'access',
    description: 'Как курсант или преподаватель подключается из дома во внутреннюю инфраструктуру полигона.',
    steps: [
      {
        fromId: 'client-remote',
        toId: 'vm-108',
        label: 'VLESS туннель (TLS / Reality)',
        protocol: 'TCP / Reality',
        port: '443',
        detail: 'Клиент (Xray/v2rayN/NekoBox) устанавливает шифрованный VLESS-туннель до шлюза 108. Трафик маскируется под легитимный HTTPS, преодолевая любые внешние фаерволы.'
      },
      {
        fromId: 'vm-108',
        toId: 'ct-102',
        label: 'Внутренняя маршрутизация (vmbr0)',
        protocol: 'HTTP',
        port: '8080 / 80',
        detail: 'VLESS-шлюз передает расшифрованный трафик через виртуальный сетевой мост Proxmox в контейнер 102 (web-interface) на Nginx.'
      },
      {
        fromId: 'ct-102',
        toId: 'ct-102',
        label: 'Nginx -> Gunicorn (unix socket/8002)',
        protocol: 'Reverse Proxy',
        port: '8002',
        detail: 'Nginx передает запрос на Gunicorn WSGI воркеры (Django), которые отдают HTML-страницы авторизации и личного кабинета.'
      }
    ]
  },
  {
    id: 'flow-lab-creation',
    title: '2. Выдача лабораторной / соревнований',
    category: 'lab_creation',
    description: 'Преподаватель запускает мероприятие на взвод: создание сессий и папок в PNETLab.',
    steps: [
      {
        fromId: 'ct-102',
        toId: 'ct-101',
        label: 'Транзакция создания соревнования',
        protocol: 'SQL (PostgreSQL)',
        port: '5432',
        detail: 'Django создает записи Competition, привязывает взвод (Platoon) и генерирует персональные записи Competition2User для каждого курсанта.',
        codeSnippet: `scenario = Competition.objects.create(name="Лаб. №3", lab=lab, ...)`
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Авторизация в PNETLab (Admin Session)',
        protocol: 'HTTP POST /store/public/auth/login/login',
        port: '80',
        detail: 'PNetSessionManager логинится под служебной учетной записью (pnet_scripts) и получает cookie и XSRF-токен.',
        codeSnippet: `session_manager = ensure_admin_pnet_session()\nsession_manager.login()`
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Создание лаб & воркспейсов курсантов',
        protocol: 'HTTP POST /api/labs',
        port: '80',
        detail: 'Для каждого курсанта создается персональная папка /Practice work/Test_Labs/it_.../<username> и импортируется файл топологии (.unl).',
        codeSnippet: `create_lab(url, lab_name, "", get_pnet_base_dir(), cookie, xsrf, username)`
      }
    ]
  },
  {
    id: 'flow-flag-deployment',
    title: '3. Асинхронная доставка CTF-флагов (SSH)',
    category: 'flag_deploy',
    description: 'Генерация уникальных флагов и запись в конфигурацию нод виртуальной лабы.',
    steps: [
      {
        fromId: 'ct-102',
        toId: 'ct-101',
        label: 'Генерация персональных флагов',
        protocol: 'Django ORM',
        port: '5432',
        detail: 'Генерируются криптостойкие флаги (FLAG_xxx) для каждого задания и сохраняются в JSON поле generated_flags в Postgres.',
        codeSnippet: `generate_and_save_flags(instance, tasks)`
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Включение SSH-нод в лабе',
        protocol: 'HTTP POST /api/labs/session/nodes/start',
        port: '80',
        detail: 'Фоновый пул потоков FlagDeploymentQueue отправляет команду на включение виртуальных машин/контейнеров (например, pnetlab/ubuntu_sv).',
        codeSnippet: `turn_on_node(pnet_url, node_id, session.cookies)`
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Fabric SSH инъекция конфига',
        protocol: 'SSH (Paramiko/Fabric)',
        port: '32768+ (Динамический порт ноды)',
        detail: 'Подключение по SSH к ноде и запись файла /etc/configs/checker_conf.json с флагами для валидатора checker.',
        codeSnippet: `transfer.put(BytesIO(config_json), '/tmp/checker_conf.json')\nconn.sudo('mv /tmp/checker_conf.json /etc/configs/')`
      }
    ]
  },
  {
    id: 'flow-student-session',
    title: '4. Работа курсанта в HTML5-консоли',
    category: 'student_session',
    description: 'Курсант открывает интерактивный терминал в веб-браузере без стороннего софта.',
    steps: [
      {
        fromId: 'vm-108',
        toId: 'ct-102',
        label: 'Запрос на открытие терминала',
        protocol: 'HTTP GET /utils/console/<slug>/<node>/',
        port: '8080',
        detail: 'Курсант нажимает кнопку «Открыть консоль» в веб-интерфейсе.'
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Получение ссылки Apache Guacamole',
        protocol: 'HTTP GET /api/labs/session/console_guac_link',
        port: '80',
        detail: 'Django запрашивает у PNETLab токен и URL HTML5-консоли (Apache Guacamole client).',
        codeSnippet: `guacamole_url = get_guacamole_url(pnet_url, node_id, cookies, xsrf)`
      },
      {
        fromId: 'ct-102',
        toId: 'vm-111',
        label: 'Nginx WebSocket проксирование консоли',
        protocol: 'WebSocket / SubFilter',
        port: '80 -> 111:80',
        detail: 'Nginx прозрачно проксирует WebSocket-поток терминала (HTML5 Guacamole) в браузер курсанта, поддерживая полноэкранный терминал Linux или GUI Windows.'
      }
    ]
  },
  {
    id: 'flow-scoring',
    title: '5. Проверка ответов и скоринг',
    category: 'scoring',
    description: 'Курсант находит флаг или вводит ответ: автоматическая валидация и начисление баллов.',
    steps: [
      {
        fromId: 'vm-108',
        toId: 'ct-102',
        label: 'Отправка ответа',
        protocol: 'HTTP POST /api/answers',
        port: '8080',
        detail: 'Форма отправляет payload: { "lab": "slug", "task": "1", "answer": "FLAG_7K39DA" }.'
      },
      {
        fromId: 'ct-102',
        toId: 'ct-101',
        label: 'Проверка хэша и сохранение зачёта',
        protocol: 'PostgreSQL Query',
        port: '5432',
        detail: 'Django сверяет ответ с generated_flags или выполняет regex-валидацию (validate_lab_task_json_config). При успехе создается запись Answers(datetime=now).',
        codeSnippet: `Answers.objects.update_or_create(user=user, lab=lab, lab_task=task, defaults={'datetime': now})`
      },
      {
        fromId: 'ct-102',
        toId: 'ct-112',
        label: 'Аудит-событие в Elasticsearch',
        protocol: 'Elasticsearch Document Indexing',
        port: '9200',
        detail: 'Событие успешной сдачи задания отправляется в индекс audit-events для отображения в реальном времени на экранах преподавательской.'
      }
    ]
  }
];

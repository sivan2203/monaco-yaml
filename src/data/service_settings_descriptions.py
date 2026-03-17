import yaml

from app.core.utils import convert_keys_to_snake


def _md(description: str, yaml_example: str) -> str:
    return f"\n{description}\n\n### Пример:\n\n```yaml\n{yaml_example.strip()}\n```\n"


def _dict(yaml_str: str, key: str) -> dict:
    return convert_keys_to_snake(yaml.safe_load(yaml_str)[key])


# unimon
UNIMON_YAML_DEFAULT = """
unimon:
  enabled: true
  topic: unimon-metrics
  kafkaBrokers:
    - kafka-1:9092
    - kafka-2:9092
  agent:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 256Mi
    livenessProbe:
      initialDelaySeconds: 10
    readinessProbe:
      initialDelaySeconds: 5
    istio:
      limits:
        cpu: 100m
        memory: 128Mi
      requests:
        cpu: 50m
        memory: 64Mi
      livenessProbe:
        initialDelaySeconds: 120
      readinessProbe:
        initialDelaySeconds: 120
      replicas: 1
    vault:
      limits:
        cpu: 100m
        memory: 128Mi
      requests:
        cpu: 50m
        memory: 64Mi
      livenessProbe:
        initialDelaySeconds: 120
      readinessProbe:
        initialDelaySeconds: 120
  sender:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 50m
      memory: 128Mi
    livenessProbe:
      initialDelaySeconds: 10
    readinessProbe:
      initialDelaySeconds: 5
    istio:
      limits:
        cpu: 100m
        memory: 128Mi
      requests:
        cpu: 50m
        memory: 64Mi
      livenessProbe:
        initialDelaySeconds: 120
      readinessProbe:
        initialDelaySeconds: 120
      replicas: 1
    vault:
      limits:
        cpu: 100m
        memory: 128Mi
      requests:
        cpu: 50m
        memory: 64Mi
      livenessProbe:
        initialDelaySeconds: 120
      readinessProbe:
        initialDelaySeconds: 120
"""
UNIMON_DESCRIPTION = "Настройки Unimon"
UNIMON_MARKDOWN = _md(UNIMON_DESCRIPTION, UNIMON_YAML_DEFAULT)
UNIMON_DEFAULT_DICT = _dict(UNIMON_YAML_DEFAULT, 'unimon')

# fluentbit
FLUENTBIT_YAML_DEFAULT = """
fluentbit:
  enabled: true
  topic: app-logs
  kafkaBrokers:
    - kafka-1:9092
    - kafka-2:9092
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi
  livenessProbe:
    initialDelaySeconds: 10
  readinessProbe:
    initialDelaySeconds: 5
"""
FLUENTBIT_DESCRIPTION = "Настройки FluentBit"
FLUENTBIT_MARKDOWN = _md(FLUENTBIT_DESCRIPTION, FLUENTBIT_YAML_DEFAULT)
FLUENTBIT_DEFAULT_DICT = _dict(FLUENTBIT_YAML_DEFAULT, 'fluentbit')

# cn
CN_YAML_DEFAULT = """
cn:
  enabled: true
  whitelist:
    - CI1234567890-CLIENT
    - CI0987654321-SERVER-CLIENT
"""
CN_DESCRIPTION = "Фильтрация по CN"
CN_MARKDOWN = _md(CN_DESCRIPTION, CN_YAML_DEFAULT)
CN_DEFAULT_DICT = _dict(CN_YAML_DEFAULT, 'cn')

# ufs_session
UFS_SESSION_YAML_DEFAULT = """
ufsSession:
  limits:
    cpu: 300m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi
  livenessProbe:
    initialDelaySeconds: 15
  readinessProbe:
    initialDelaySeconds: 10
"""
UFS_SESSION_DESCRIPTION = "Настройки UFS сессии"
UFS_SESSION_MARKDOWN = _md(UFS_SESSION_DESCRIPTION, UFS_SESSION_YAML_DEFAULT)
UFS_SESSION_DEFAULT_DICT = _dict(UFS_SESSION_YAML_DEFAULT, 'ufsSession')

# ufs_params
UFS_PARAMS_YAML_DEFAULT = """
ufsParams:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi
  livenessProbe:
    initialDelaySeconds: 10
  readinessProbe:
    initialDelaySeconds: 5
"""
UFS_PARAMS_DESCRIPTION = "Параметры UFS"
UFS_PARAMS_MARKDOWN = _md(UFS_PARAMS_DESCRIPTION, UFS_PARAMS_YAML_DEFAULT)
UFS_PARAMS_DEFAULT_DICT = _dict(UFS_PARAMS_YAML_DEFAULT, 'ufsParams')

# ott_params
OTT_PARAMS_YAML_DEFAULT = """
ottParams:
  mode: strict
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi
  livenessProbe:
    initialDelaySeconds: 10
  readinessProbe:
    initialDelaySeconds: 5
"""
OTT_PARAMS_DESCRIPTION = "Параметры OTT"
OTT_PARAMS_MARKDOWN = _md(OTT_PARAMS_DESCRIPTION, OTT_PARAMS_YAML_DEFAULT)
OTT_DEFAULT_DICT = _dict(OTT_PARAMS_YAML_DEFAULT, 'ottParams')

# rate_limits
RATE_LIMITS_YAML_DEFAULT = """
rateLimits:
  enabled: true
  rps: 100
"""
RATE_LIMITS_DESCRIPTION = "Лимиты запросов"
RATE_LIMITS_MARKDOWN = _md(RATE_LIMITS_DESCRIPTION, RATE_LIMITS_YAML_DEFAULT)
RATE_LIMITS_DEFAULT_DICT = _dict(RATE_LIMITS_YAML_DEFAULT, 'rateLimits')

# union_audit
UNION_AUDIT_YAML_DEFAULT = """
unionAudit:
  enabled: true
  kafkaBrokers:
    - kafka-1:9092
    - kafka-2:9092
"""
UNION_AUDIT_DESCRIPTION = "Аудит Union"
UNION_AUDIT_MARKDOWN = _md(UNION_AUDIT_DESCRIPTION, UNION_AUDIT_YAML_DEFAULT)
UNION_AUDIT_DEFAULT_DICT = _dict(UNION_AUDIT_YAML_DEFAULT, 'unionAudit')

# dynatrace
DYNATRACE_YAML_DEFAULT = """
dynatrace:
  enabled: true
  reflexHost:
    clusterName: my-cluster
    envName: production
  reflexLabels:
    agentVersion: 1.2.3
    cluster: my-cluster
    env: prod
    projectName: my-service
"""
DYNATRACE_DESCRIPTION = "Настройки Dynatrace"
DYNATRACE_MARKDOWN = _md(DYNATRACE_DESCRIPTION, DYNATRACE_YAML_DEFAULT)
DEFAULT_DYNATRACE_DICT = _dict(DYNATRACE_YAML_DEFAULT, 'dynatrace')

# db_migration
DB_MIGRATION_YAML_DEFAULT = """
dbMigration:
  command: flyway migrate
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi
"""
DB_MIGRATION_DESCRIPTION = "Настройки миграции БД"
DB_MIGRATION_MARKDOWN = _md(DB_MIGRATION_DESCRIPTION, DB_MIGRATION_YAML_DEFAULT)
DB_MIGRATION_DEFAULT_DICT = _dict(DB_MIGRATION_YAML_DEFAULT, 'dbMigration')


### Commons settings
VAULT_SIDECAR_DEFAULT = """
vault:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 50m
    memory: 64Mi
  livenessProbe:
    initialDelaySeconds: 120
  readinessProbe:
    initialDelaySeconds: 120
"""
VAULT_SIDECAR = "Блок настройки vault-agent sidecar"
VAULT_SIDECAR_DESCRIPTION = _md(VAULT_SIDECAR, VAULT_SIDECAR_DEFAULT)
VAULT_SIDECAR_DEFAULT_DICT = _dict(VAULT_SIDECAR_DEFAULT, 'vault')


ISTIO_SIDECAR_DEFAULT = """
istio:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 50m
    memory: 64Mi
  livenessProbe:
    initialDelaySeconds: 120
  readinessProbe:
    initialDelaySeconds: 120
  replicas: 1
"""
ISTIO_SIDECAR = "Блок настройки istio-proxy sidecar"
ISTIO_SIDECAR_DESCRIPTION = _md(ISTIO_SIDECAR, ISTIO_SIDECAR_DEFAULT)
ISTIO_SIDECAR_DEFAULT_DICT = _dict(ISTIO_SIDECAR_DEFAULT, 'istio')

LIMITS_YAML_DEFAULT="""
limits:
  cpu: 200m
  memory: 500M
"""
LIMITS = "Значения Limits в Namespace"
LIMITS_DESCRIPTION = _md(LIMITS, LIMITS_YAML_DEFAULT)
LIMITS_DEFAULT_DICT = _dict(LIMITS_YAML_DEFAULT, 'limits')


REQUESTS_YAML_DEFAULT="""
requests:
  cpu: 150m
  memory: 250M
"""
REQUESTS = "Значения Requests в Namespace"
REQUESTS_DESCRIPTION = _md(REQUESTS, REQUESTS_YAML_DEFAULT)
REQUESTS_DEFAULT_DICT = _dict(REQUESTS_YAML_DEFAULT, 'requests')

LIVENESS_PROBE_YAML_DEFAULT="""
livenessProbe:
  initialDelaySeconds: 120
"""
LIVENESS_PROBE = "Параметры Liveness Probe в Namespace"
LIVENESS_PROBE_DESCRIPTION = _md(LIVENESS_PROBE, LIVENESS_PROBE_YAML_DEFAULT)
LIVENESS_PROBE_DEFAULT_DICT = _dict(LIVENESS_PROBE_YAML_DEFAULT, 'livenessProbe')

READINESS_PROBE_YAML_DEFAULT="""
readinessProbe:
  initialDelaySeconds: 120
"""
READINESS_PROBE = "Параметры Readiness Probe в Namespace"
READINESS_PROBE_DESCRIPTION = _md(READINESS_PROBE, READINESS_PROBE_YAML_DEFAULT)
READINESS_PROBE_DEFAULT_DICT = _dict(READINESS_PROBE_YAML_DEFAULT, 'readinessProbe')

KAFKA_BROKERS_YAML_DEFAULT = """
kafkaBrokers:
  - kafka-1:9092
  - kafka-2:9092
"""
KAFKA_BROKERS = "Список kafka brokers"
KAFKA_BROKERS_DESCRIPTION = _md(KAFKA_BROKERS, KAFKA_BROKERS_YAML_DEFAULT)
KAFKA_BROKERS_DEFAULT_DICT = _dict(KAFKA_BROKERS_YAML_DEFAULT, 'kafkaBrokers')

APP_DESCRIPTION_YAML_DEFAULT = """
app:
  command: java -jar app.jar
  port: 8080
  istio:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi
    replicas: 2
  vault:
    limits:
      cpu: 50m
      memory: 64Mi
    requests:
      cpu: 25m
      memory: 32Mi
  probe:
    path: /health
    port: 8080
    initialDelaySeconds: 30
    livenessProbe:
      path: /live
      port: 8080
      initialDelaySeconds: 30
    readinessProbe:
      path: /ready
      port: 8080
      initialDelaySeconds: 30
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 200m
      memory: 256Mi
    initialDelaySeconds: 30
    replicas: 2
"""
APP_DESCRIPTION = "Настройки приложения"
APP_MARKDOWN = _md(APP_DESCRIPTION, APP_DESCRIPTION_YAML_DEFAULT)
APP_DEFAULT_DICT = _dict(APP_DESCRIPTION_YAML_DEFAULT, 'app')

INGRESS_DESCRIPTION_YAML_DEFAULT = """
ingress:
  istio:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi
    replicas: 2
    livenessProbe:
      initialDelaySeconds: 120
    readinessProbe:
      initialDelaySeconds: 120
  vault:
    limits:
      cpu: 50m
      memory: 64Mi
    requests:
      cpu: 25m
      memory: 32Mi
    livenessProbe:
      initialDelaySeconds: 120
    readinessProbe:
      initialDelaySeconds: 120
"""
INGRESS_DESCRIPTION = "Настройки Ingress"
INGRESS_MARKDOWN = _md(INGRESS_DESCRIPTION, INGRESS_DESCRIPTION_YAML_DEFAULT)
INGRESS_DEFAULT_DICT = _dict(INGRESS_DESCRIPTION_YAML_DEFAULT, 'ingress')


EGRESS_DESCRIPTION_YAML_DEFAULT = """
egress:
  istio:
    limits:
      cpu: 100m
      memory: 128Mi
    requests:
      cpu: 50m
      memory: 64Mi
    replicas: 2
    livenessProbe:
      initialDelaySeconds: 120
    readinessProbe:
      initialDelaySeconds: 120
  vault:
    limits:
      cpu: 50m
      memory: 64Mi
    requests:
      cpu: 25m
      memory: 32Mi
    livenessProbe:
      initialDelaySeconds: 120
    readinessProbe:
      initialDelaySeconds: 120
"""
EGRESS_DESCRIPTION = "Настройки Egress"
EGRESS_MARKDOWN = _md(EGRESS_DESCRIPTION, EGRESS_DESCRIPTION_YAML_DEFAULT)
EGRESS_DEFAULT_DICT = _dict(EGRESS_DESCRIPTION_YAML_DEFAULT, 'egress')

### Описания полей вложенных моделей

# PerformanceSettings — cpu, memory
CPU = "Лимит CPU (например: 200m, 1)"
CPU_DESCRIPTION = _md("Лимит CPU", "cpu: 200m")

MEMORY = "Лимит памяти (например: 256Mi, 1Gi)"
MEMORY_DESCRIPTION = _md("Лимит памяти", "memory: 256Mi")

# Probe — initialDelaySeconds, path, port
INITIAL_DELAY_SECONDS = "Задержка перед первой пробой (секунды)"
INITIAL_DELAY_SECONDS_DESCRIPTION = _md("Задержка перед первой пробой", "initialDelaySeconds: 30")

PROBE_PATH = "HTTP путь для пробы (например: /health)"
PROBE_PATH_DESCRIPTION = _md("HTTP путь для health-check пробы", "path: /health")

PROBE_PORT = "Порт HTTP пробы"
PROBE_PORT_DESCRIPTION = _md("Порт для HTTP health-check пробы", "port: 8080")

PROBE_LIVENESS = "Настройки Liveness Probe"
PROBE_LIVENESS_DESCRIPTION = _md(PROBE_LIVENESS, "livenessProbe:\n  path: /live\n  port: 8080\n  initialDelaySeconds: 30")

PROBE_READINESS = "Настройки Readiness Probe"
PROBE_READINESS_DESCRIPTION = _md(PROBE_READINESS, "readinessProbe:\n  path: /ready\n  port: 8080\n  initialDelaySeconds: 30")

# Общие — replicas
REPLICAS = "Количество реплик"
REPLICAS_DESCRIPTION = _md(REPLICAS, "replicas: 2")

# AppPropertiesServiceGo — command, port, probe, resources
APP_COMMAND = "Команда запуска приложения"
APP_COMMAND_DESCRIPTION = _md(APP_COMMAND, "command: java -jar app.jar")

APP_PORT = "Порт приложения"
APP_PORT_DESCRIPTION = _md("Порт, на котором запускается приложение", "port: 8080")

APP_PROBE = "Настройки проб приложения (liveness/readiness)"
APP_PROBE_DESCRIPTION = _md("Настройки HTTP проб приложения", (
    "probe:\n"
    "  path: /health\n"
    "  port: 8080\n"
    "  initialDelaySeconds: 30\n"
    "  livenessProbe:\n"
    "    path: /live\n"
    "    port: 8080\n"
    "    initialDelaySeconds: 30\n"
    "  readinessProbe:\n"
    "    path: /ready\n"
    "    port: 8080\n"
    "    initialDelaySeconds: 30"
))

APP_RESOURCES = "Ресурсы приложения (limits, requests, replicas)"
APP_RESOURCES_DESCRIPTION = _md("Ресурсы основного контейнера приложения", (
    "resources:\n"
    "  limits:\n"
    "    cpu: 1000m\n"
    "    memory: 1Gi\n"
    "  requests:\n"
    "    cpu: 200m\n"
    "    memory: 256Mi\n"
    "  initialDelaySeconds: 30\n"
    "  replicas: 2"
))

# DBMigration — command
DB_MIGRATION_COMMAND = "Команда миграции БД"
DB_MIGRATION_COMMAND_DESCRIPTION = _md("Команда для выполнения миграции базы данных", "command: flyway migrate")

# Dynatrace — enabled, reflex_host, reflex_labels
DYNATRACE_ENABLED = "Включить интеграцию с Dynatrace"
DYNATRACE_ENABLED_DESCRIPTION = _md("Включить/выключить интеграцию с Dynatrace", "enabled: true")

DYNATRACE_HOST = "Параметры Reflex Host для Dynatrace"
DYNATRACE_HOST_DESCRIPTION = _md("Параметры хоста Reflex для подключения к Dynatrace", "reflexHost:\n  clusterName: my-cluster\n  envName: production")

DYNATRACE_LABELS = "Метки Reflex Labels для Dynatrace"
DYNATRACE_LABELS_DESCRIPTION = _md("Метки для идентификации сервиса в Dynatrace", (
    "reflexLabels:\n"
    "  agentVersion: 1.2.3\n"
    "  cluster: my-cluster\n"
    "  env: prod\n"
    "  projectName: my-service"
))

DYNATRACE_CLUSTER_NAME = "Название кластера"
DYNATRACE_CLUSTER_NAME_DESCRIPTION = _md("Название кластера для Dynatrace", "clusterName: my-cluster")

DYNATRACE_ENV_NAME = "Название окружения"
DYNATRACE_ENV_NAME_DESCRIPTION = _md("Название окружения для Dynatrace", "envName: production")

DYNATRACE_AGENT_VERSION = "Версия Dynatrace агента"
DYNATRACE_AGENT_VERSION_DESCRIPTION = _md("Версия агента Dynatrace", "agentVersion: 1.2.3")

DYNATRACE_CLUSTER = "Кластер для Dynatrace меток"
DYNATRACE_CLUSTER_DESCRIPTION = _md("Название кластера в метках Dynatrace", "cluster: my-cluster")

DYNATRACE_ENV = "Окружение для Dynatrace меток"
DYNATRACE_ENV_DESCRIPTION = _md("Название окружения в метках Dynatrace", "env: prod")

DYNATRACE_PROJECT_NAME = "Название проекта для Dynatrace меток"
DYNATRACE_PROJECT_NAME_DESCRIPTION = _md("Название проекта/сервиса в метках Dynatrace", "projectName: my-service")

# RateLimits — enabled, rps
RATE_LIMITS_ENABLED = "Включить rate limiting"
RATE_LIMITS_ENABLED_DESCRIPTION = _md("Включить/выключить ограничение запросов", "enabled: true")

RATE_LIMITS_RPS = "Максимальное количество запросов в секунду"
RATE_LIMITS_RPS_DESCRIPTION = _md("Лимит запросов в секунду (RPS)", "rps: 100")

# CN — enabled, whitelist
CN_ENABLED = "Включить фильтрацию по CN"
CN_ENABLED_DESCRIPTION = _md("Включить/выключить фильтрацию по Common Name сертификата", "enabled: true")

CN_WHITELIST = "Список разрешённых CN"
CN_WHITELIST_DESCRIPTION = _md("Список разрешённых Common Name для фильтрации", "whitelist:\n  - CI1234567890-CLIENT\n  - CI0987654321-SERVER-CLIENT")

# Unimon — enabled, agent, sender, topic, always_enabled
UNIMON_ENABLED = "Включить Unimon"
UNIMON_ENABLED_DESCRIPTION = _md("Включить/выключить интеграцию с Unimon", "enabled: true")

UNIMON_AGENT = "Настройки Unimon agent sidecar"
UNIMON_AGENT_DESCRIPTION = _md("Параметры контейнера unimon-agent", (
    "agent:\n"
    "  limits:\n"
    "    cpu: 500m\n"
    "    memory: 512Mi\n"
    "  requests:\n"
    "    cpu: 100m\n"
    "    memory: 256Mi\n"
    "  livenessProbe:\n"
    "    initialDelaySeconds: 10\n"
    "  readinessProbe:\n"
    "    initialDelaySeconds: 5"
))

UNIMON_SENDER = "Настройки Unimon sender sidecar"
UNIMON_SENDER_DESCRIPTION = _md("Параметры контейнера unimon-sender", (
    "sender:\n"
    "  limits:\n"
    "    cpu: 200m\n"
    "    memory: 256Mi\n"
    "  requests:\n"
    "    cpu: 50m\n"
    "    memory: 128Mi\n"
    "  livenessProbe:\n"
    "    initialDelaySeconds: 10\n"
    "  readinessProbe:\n"
    "    initialDelaySeconds: 5"
))

UNIMON_TOPIC = "Kafka топик для Unimon"
UNIMON_TOPIC_DESCRIPTION = _md("Название Kafka топика для отправки метрик Unimon", "topic: unimon-metrics")

UNIMON_ALWAYS_ENABLED = "Принудительно включить Unimon"
UNIMON_ALWAYS_ENABLED_DESCRIPTION = _md("Если true — Unimon включён всегда, независимо от флага enabled", "alwaysEnabled: true")

# UnionAudit — enabled
UNION_AUDIT_ENABLED = "Включить UnionAudit"
UNION_AUDIT_ENABLED_DESCRIPTION = _md("Включить/выключить аудит Union", "enabled: true")

# Fluentbit — enabled, topic
FLUENTBIT_ENABLED = "Включить FluentBit"
FLUENTBIT_ENABLED_DESCRIPTION = _md("Включить/выключить сбор логов через FluentBit", "enabled: true")

FLUENTBIT_TOPIC = "Kafka топик для FluentBit"
FLUENTBIT_TOPIC_DESCRIPTION = _md("Название Kafka топика для отправки логов", "topic: app-logs")
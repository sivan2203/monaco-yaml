import yaml

from app.core.utils import convert_keys_to_snake

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
UNIMON_MARKDOWN = f"""

Настройки Unimon

### Пример:

```yaml
{UNIMON_YAML_DEFAULT.strip()}
```
"""


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
FLUENTBIT_MARKDOWN = f"""

Настройки FluentBit

### Пример:

```yaml
{FLUENTBIT_YAML_DEFAULT.strip()}
```
"""

# cn
CN_YAML_DEFAULT = """
cn:
  enabled: true
  whitelist:
    - CI1234567890-CLIENT
    - CI0987654321-SERVER-CLIENT
"""
CN_DESCRIPTION = "Фильтрация по CN"
CN_MARKDOWN = f"""

Фильтрация по CN

### Пример:

```yaml
{CN_YAML_DEFAULT.strip()}
```
"""

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
UFS_SESSION_MARKDOWN = f"""

Настройки UFS сессии

### Пример:


```yaml
{UFS_SESSION_YAML_DEFAULT.strip()}
```
"""

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
UFS_PARAMS_MARKDOWN = f"""

Параметры UFS

### Пример:


```yaml
{UFS_PARAMS_YAML_DEFAULT.strip()}
```
"""

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
OTT_PARAMS_MARKDOWN = f"""

Параметры OTT

### Пример:


```yaml
{OTT_PARAMS_YAML_DEFAULT.strip()}
```
"""

# rate_limits
RATE_LIMITS_YAML_DEFAULT = """
rateLimits:
  enabled: true
  rps: 100
"""
RATE_LIMITS_DESCRIPTION = "Лимиты запросов"
RATE_LIMITS_MARKDOWN = f"""

Лимиты запросов"

### Пример:


```yaml
{RATE_LIMITS_YAML_DEFAULT.strip()}
```
"""

# union_audit
UNION_AUDIT_YAML_DEFAULT = """
unionAudit:
  enabled: true
  kafkaBrokers:
    - kafka-1:9092
    - kafka-2:9092
"""
UNION_AUDIT_DESCRIPTION = "Аудит Union"
UNION_AUDIT_MARKDOWN = f"""

Аудит Union

### Пример:

```yaml
{UNION_AUDIT_YAML_DEFAULT.strip()}
```
"""

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
DYNATRACE_MARKDOWN = f"""

Настройки Dynatrace

### Пример:

```yaml
{DYNATRACE_YAML_DEFAULT.strip()}
```
"""

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
DB_MIGRATION_MARKDOWN = f"""

Настройки миграции БД

### Пример:

```yaml
{DB_MIGRATION_YAML_DEFAULT.strip()}
```
"""


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
VAULT_SIDECAR="Блок настройки vault-agent sidecar"
VAULT_SIDECAR_DESCRIPTION=f"""

Блок настройки vault-agent sidecar

### Пример:

```yaml
{VAULT_SIDECAR_DEFAULT.strip()}
```
"""


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
ISTIO_SIDECAR="Блок настройки istio-proxy sidecar"
ISTIO_SIDECAR_DESCRIPTION=f"""

Блок настройки istio-proxy sidecar

### Пример:

```yaml
{ISTIO_SIDECAR_DEFAULT.strip()}
```
"""

LIMITS_YAML_DEFAULT="""
limits:
  cpu: 200m
  memory: 500M
"""
LIMITS="Значения Limits в Namespace"
LIMITS_DESCRIPTION=f"""

Значения Limits в Namespace

### Пример:

```yaml
{LIMITS_YAML_DEFAULT.strip()}
"""


REQUESTS_YAML_DEFAULT="""
requests:
  cpu: 150m
  memory: 250M
"""
REQUESTS="Значения Requests в Namespace"
REQUESTS_DESCRIPTION=f"""

Значения Requests в Namespace

### Пример:

```yaml
{REQUESTS_YAML_DEFAULT.strip()}
```
"""

LIVENESS_PROBE_YAML_DEFAULT="""
livenessProbe:
  initialDelaySeconds: 120
"""
LIVENESS_PROBE="Параметры Liveness Probe в Namespace"
LIVENESS_PROBE_DESCRIPTION=f"""

Параметры Liveness Probe в Namespace

### Пример:

```yaml
{LIVENESS_PROBE_YAML_DEFAULT.strip()}
```

"""

READINESS_PROBE_YAML_DEFAULT="""
readinessProbe:
  initialDelaySeconds: 120
"""
READINESS_PROBE="Параметры Readiness Probe в Namespace"
READINESS_PROBE_DESCRIPTION=f"""

Параметры Readiness Probe в Namespace

### Пример:

```yaml
{READINESS_PROBE_YAML_DEFAULT.strip()}
```
"""

KAFKA_BROKERS_YAML_DEFAULT = """
kafkaBrokers:
  - kafka-1:9092
  - kafka-2:9092
"""
KAFKA_BROKERS = "Список kafka brokers"
KAFKA_BROKERS_DESCRIPTION = f"""

Список kafka brokers

### Пример:

```yaml
  {KAFKA_BROKERS_YAML_DEFAULT.strip()}  
```
"""

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
APP_MARKDOWN = f"""

Настройки приложения

### Пример:

```yaml
  {APP_DESCRIPTION_YAML_DEFAULT.strip()}  
```
"""

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
INGRESS_MARKDOWN = f"""

Настройки Ingress

### Пример:
```yaml
  {INGRESS_DESCRIPTION_YAML_DEFAULT.strip()}  
```
"""


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
EGRESS_MARKDOWN = f"""

Настройки Egress

### Пример:
```yaml
  {EGRESS_DESCRIPTION_YAML_DEFAULT.strip()}  
```
"""

# unimon
UNIMON_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(UNIMON_YAML_DEFAULT)['unimon'])

# fluentbit
FLUENTBIT_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(FLUENTBIT_YAML_DEFAULT)['fluentbit'])

# cn
CN_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(CN_YAML_DEFAULT)['cn'])

# dynatrace
DEFAULT_DYNATRACE_DICT = convert_keys_to_snake(yaml.safe_load(DYNATRACE_YAML_DEFAULT)['dynatrace'])

# db_migration
DB_MIGRATION_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(DB_MIGRATION_YAML_DEFAULT)['dbMigration'])

# vault sidecar
VAULT_SIDECAR_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(VAULT_SIDECAR_DEFAULT)['vault'])

# istio sidecar
ISTIO_SIDECAR_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(ISTIO_SIDECAR_DEFAULT)['istio'])

# limits
LIMITS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(LIMITS_YAML_DEFAULT)['limits'])

# requests
REQUESTS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(REQUESTS_YAML_DEFAULT)['requests'])

# liveness_probe
LIVENESS_PROBE_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(LIVENESS_PROBE_YAML_DEFAULT)['livenessProbe'])

# readiness_probe
READINESS_PROBE_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(READINESS_PROBE_YAML_DEFAULT)['readinessProbe'])

# kafka_brokers
KAFKA_BROKERS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(KAFKA_BROKERS_YAML_DEFAULT)['kafkaBrokers'])

# app
APP_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(APP_DESCRIPTION_YAML_DEFAULT)['app'])

# ingress
INGRESS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(INGRESS_DESCRIPTION_YAML_DEFAULT)['ingress'])

# egress
EGRESS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(EGRESS_DESCRIPTION_YAML_DEFAULT)['egress'])

# ottParams
OTT_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(OTT_PARAMS_YAML_DEFAULT)['ottParams'])

# rateLimita (опечатка, вероятно rateLimits)
RATE_LIMITS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(RATE_LIMITS_YAML_DEFAULT)['rateLimits'])

# ufsParams
UFS_PARAMS_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(UFS_PARAMS_YAML_DEFAULT)['ufsParams'])

# ufsSession
UFS_SESSION_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(UFS_SESSION_YAML_DEFAULT)['ufsSession'])

# unionAudit
UNION_AUDIT_DEFAULT_DICT = convert_keys_to_snake(yaml.safe_load(UNION_AUDIT_YAML_DEFAULT)['unionAudit'])


### Описания полей вложенных моделей

# PerformanceSettings — cpu, memory
CPU = "Лимит CPU (например: 200m, 1)"
CPU_DESCRIPTION = """

Лимит CPU

### Пример:

```yaml
cpu: 200m
```
"""

MEMORY = "Лимит памяти (например: 256Mi, 1Gi)"
MEMORY_DESCRIPTION = """

Лимит памяти

### Пример:

```yaml
memory: 256Mi
```
"""

# Probe — initialDelaySeconds, path, port
INITIAL_DELAY_SECONDS = "Задержка перед первой пробой (секунды)"
INITIAL_DELAY_SECONDS_DESCRIPTION = """

Задержка перед первой пробой

### Пример:

```yaml
initialDelaySeconds: 30
```
"""

PROBE_PATH = "HTTP путь для пробы (например: /health)"
PROBE_PATH_DESCRIPTION = """

HTTP путь для health-check пробы

### Пример:

```yaml
path: /health
```
"""

PROBE_PORT = "Порт HTTP пробы"
PROBE_PORT_DESCRIPTION = """

Порт для HTTP health-check пробы

### Пример:

```yaml
port: 8080
```
"""

PROBE_LIVENESS = "Настройки Liveness Probe"
PROBE_LIVENESS_DESCRIPTION = """

Настройки Liveness Probe

### Пример:

```yaml
livenessProbe:
  path: /live
  port: 8080
  initialDelaySeconds: 30
```
"""

PROBE_READINESS = "Настройки Readiness Probe"
PROBE_READINESS_DESCRIPTION = """

Настройки Readiness Probe

### Пример:

```yaml
readinessProbe:
  path: /ready
  port: 8080
  initialDelaySeconds: 30
```
"""

# Общие — replicas
REPLICAS = "Количество реплик"
REPLICAS_DESCRIPTION = """

Количество реплик

### Пример:

```yaml
replicas: 2
```
"""

# AppPropertiesServiceGo — command, port, probe, resources
APP_COMMAND = "Команда запуска приложения"
APP_COMMAND_DESCRIPTION = """

Команда запуска приложения

### Пример:

```yaml
command: java -jar app.jar
```
"""

APP_PORT = "Порт приложения"
APP_PORT_DESCRIPTION = """

Порт, на котором запускается приложение

### Пример:

```yaml
port: 8080
```
"""

APP_PROBE = "Настройки проб приложения (liveness/readiness)"
APP_PROBE_DESCRIPTION = """

Настройки HTTP проб приложения

### Пример:

```yaml
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
```
"""

APP_RESOURCES = "Ресурсы приложения (limits, requests, replicas)"
APP_RESOURCES_DESCRIPTION = """

Ресурсы основного контейнера приложения

### Пример:

```yaml
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi
  initialDelaySeconds: 30
  replicas: 2
```
"""

# DBMigration — command
DB_MIGRATION_COMMAND = "Команда миграции БД"
DB_MIGRATION_COMMAND_DESCRIPTION = """

Команда для выполнения миграции базы данных

### Пример:

```yaml
command: flyway migrate
```
"""

# Dynatrace — enabled, reflex_host, reflex_labels
DYNATRACE_ENABLED = "Включить интеграцию с Dynatrace"
DYNATRACE_ENABLED_DESCRIPTION = """

Включить/выключить интеграцию с Dynatrace

### Пример:

```yaml
enabled: true
```
"""

DYNATRACE_HOST = "Параметры Reflex Host для Dynatrace"
DYNATRACE_HOST_DESCRIPTION = """

Параметры хоста Reflex для подключения к Dynatrace

### Пример:

```yaml
reflexHost:
  clusterName: my-cluster
  envName: production
```
"""

DYNATRACE_LABELS = "Метки Reflex Labels для Dynatrace"
DYNATRACE_LABELS_DESCRIPTION = """

Метки для идентификации сервиса в Dynatrace

### Пример:

```yaml
reflexLabels:
  agentVersion: 1.2.3
  cluster: my-cluster
  env: prod
  projectName: my-service
```
"""

DYNATRACE_CLUSTER_NAME = "Название кластера"
DYNATRACE_CLUSTER_NAME_DESCRIPTION = """

Название кластера для Dynatrace

### Пример:

```yaml
clusterName: my-cluster
```
"""

DYNATRACE_ENV_NAME = "Название окружения"
DYNATRACE_ENV_NAME_DESCRIPTION = """

Название окружения для Dynatrace

### Пример:

```yaml
envName: production
```
"""

DYNATRACE_AGENT_VERSION = "Версия Dynatrace агента"
DYNATRACE_AGENT_VERSION_DESCRIPTION = """

Версия агента Dynatrace

### Пример:

```yaml
agentVersion: 1.2.3
```
"""

DYNATRACE_CLUSTER = "Кластер для Dynatrace меток"
DYNATRACE_CLUSTER_DESCRIPTION = """

Название кластера в метках Dynatrace

### Пример:

```yaml
cluster: my-cluster
```
"""

DYNATRACE_ENV = "Окружение для Dynatrace меток"
DYNATRACE_ENV_DESCRIPTION = """

Название окружения в метках Dynatrace

### Пример:

```yaml
env: prod
```
"""

DYNATRACE_PROJECT_NAME = "Название проекта для Dynatrace меток"
DYNATRACE_PROJECT_NAME_DESCRIPTION = """

Название проекта/сервиса в метках Dynatrace

### Пример:

```yaml
projectName: my-service
```
"""

# RateLimits — enabled, rps
RATE_LIMITS_ENABLED = "Включить rate limiting"
RATE_LIMITS_ENABLED_DESCRIPTION = """

Включить/выключить ограничение запросов

### Пример:

```yaml
enabled: true
```
"""

RATE_LIMITS_RPS = "Максимальное количество запросов в секунду"
RATE_LIMITS_RPS_DESCRIPTION = """

Лимит запросов в секунду (RPS)

### Пример:

```yaml
rps: 100
```
"""

# CN — enabled, whitelist
CN_ENABLED = "Включить фильтрацию по CN"
CN_ENABLED_DESCRIPTION = """

Включить/выключить фильтрацию по Common Name сертификата

### Пример:

```yaml
enabled: true
```
"""

CN_WHITELIST = "Список разрешённых CN"
CN_WHITELIST_DESCRIPTION = """

Список разрешённых Common Name для фильтрации

### Пример:

```yaml
whitelist:
  - CI1234567890-CLIENT
  - CI0987654321-SERVER-CLIENT
```
"""

# Unimon — enabled, agent, sender, topic, always_enabled
UNIMON_ENABLED = "Включить Unimon"
UNIMON_ENABLED_DESCRIPTION = """

Включить/выключить интеграцию с Unimon

### Пример:

```yaml
enabled: true
```
"""

UNIMON_AGENT = "Настройки Unimon agent sidecar"
UNIMON_AGENT_DESCRIPTION = """

Параметры контейнера unimon-agent

### Пример:

```yaml
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
```
"""

UNIMON_SENDER = "Настройки Unimon sender sidecar"
UNIMON_SENDER_DESCRIPTION = """

Параметры контейнера unimon-sender

### Пример:

```yaml
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
```
"""

UNIMON_TOPIC = "Kafka топик для Unimon"
UNIMON_TOPIC_DESCRIPTION = """

Название Kafka топика для отправки метрик Unimon

### Пример:

```yaml
topic: unimon-metrics
```
"""

UNIMON_ALWAYS_ENABLED = "Принудительно включить Unimon"
UNIMON_ALWAYS_ENABLED_DESCRIPTION = """

Если true — Unimon включён всегда, независимо от флага enabled

### Пример:

```yaml
alwaysEnabled: true
```
"""

# UnionAudit — enabled
UNION_AUDIT_ENABLED = "Включить UnionAudit"
UNION_AUDIT_ENABLED_DESCRIPTION = """

Включить/выключить аудит Union

### Пример:

```yaml
enabled: true
```
"""

# Fluentbit — enabled, topic
FLUENTBIT_ENABLED = "Включить FluentBit"
FLUENTBIT_ENABLED_DESCRIPTION = """

Включить/выключить сбор логов через FluentBit

### Пример:

```yaml
enabled: true
```
"""

FLUENTBIT_TOPIC = "Kafka топик для FluentBit"
FLUENTBIT_TOPIC_DESCRIPTION = """

Название Kafka топика для отправки логов

### Пример:

```yaml
topic: app-logs
```
"""
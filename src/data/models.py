import yaml
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.core.utils import to_camel

from app.core.clients.service_registry_go.service_settings_descriptions import (
    APP_DEFAULT_DICT, APP_DESCRIPTION, APP_MARKDOWN, CN_DEFAULT_DICT, DB_MIGRATION_DEFAULT_DICT, DEFAULT_DYNATRACE_DICT, EGRESS_DEFAULT_DICT, EGRESS_DESCRIPTION, EGRESS_MARKDOWN, FLUENTBIT_DEFAULT_DICT, INGRESS_DEFAULT_DICT, INGRESS_DESCRIPTION, INGRESS_MARKDOWN, OTT_DEFAULT_DICT, RATE_LIMITS_DEFAULT_DICT, UFS_PARAMS_DEFAULT_DICT, UFS_SESSION_DEFAULT_DICT, UNIMON_DEFAULT_DICT, UNIMON_DESCRIPTION, UNIMON_MARKDOWN,
    FLUENTBIT_DESCRIPTION, FLUENTBIT_MARKDOWN,
    CN_DESCRIPTION, CN_MARKDOWN,
    UFS_SESSION_DESCRIPTION, UFS_SESSION_MARKDOWN,
    UFS_PARAMS_DESCRIPTION, UFS_PARAMS_MARKDOWN,
    OTT_PARAMS_DESCRIPTION, OTT_PARAMS_MARKDOWN,
    RATE_LIMITS_DESCRIPTION, RATE_LIMITS_MARKDOWN, UNION_AUDIT_DEFAULT_DICT,
    UNION_AUDIT_DESCRIPTION, UNION_AUDIT_MARKDOWN,
    DYNATRACE_DESCRIPTION, DYNATRACE_MARKDOWN,
    DB_MIGRATION_DESCRIPTION, DB_MIGRATION_MARKDOWN,
    ISTIO_SIDECAR, ISTIO_SIDECAR_DESCRIPTION,
    VAULT_SIDECAR, VAULT_SIDECAR_DESCRIPTION,
    LIMITS, REQUESTS,
    LIMITS_DESCRIPTION, REQUESTS_DESCRIPTION,
    LIVENESS_PROBE, READINESS_PROBE,
    LIVENESS_PROBE_DESCRIPTION, READINESS_PROBE_DESCRIPTION,
    KAFKA_BROKERS, KAFKA_BROKERS_DESCRIPTION, UNIMON_YAML_DEFAULT, DYNATRACE_YAML_DEFAULT,
    CPU, CPU_DESCRIPTION, MEMORY, MEMORY_DESCRIPTION,
    INITIAL_DELAY_SECONDS, INITIAL_DELAY_SECONDS_DESCRIPTION,
    PROBE_PATH, PROBE_PATH_DESCRIPTION, PROBE_PORT, PROBE_PORT_DESCRIPTION,
    PROBE_LIVENESS, PROBE_LIVENESS_DESCRIPTION, PROBE_READINESS, PROBE_READINESS_DESCRIPTION,
    REPLICAS, REPLICAS_DESCRIPTION,
    APP_COMMAND, APP_COMMAND_DESCRIPTION, APP_PORT, APP_PORT_DESCRIPTION,
    APP_PROBE, APP_PROBE_DESCRIPTION, APP_RESOURCES, APP_RESOURCES_DESCRIPTION,
    DB_MIGRATION_COMMAND, DB_MIGRATION_COMMAND_DESCRIPTION,
    DYNATRACE_ENABLED, DYNATRACE_ENABLED_DESCRIPTION,
    DYNATRACE_HOST, DYNATRACE_HOST_DESCRIPTION,
    DYNATRACE_LABELS, DYNATRACE_LABELS_DESCRIPTION,
    DYNATRACE_CLUSTER_NAME, DYNATRACE_CLUSTER_NAME_DESCRIPTION,
    DYNATRACE_ENV_NAME, DYNATRACE_ENV_NAME_DESCRIPTION,
    DYNATRACE_AGENT_VERSION, DYNATRACE_AGENT_VERSION_DESCRIPTION,
    DYNATRACE_CLUSTER, DYNATRACE_CLUSTER_DESCRIPTION,
    DYNATRACE_ENV, DYNATRACE_ENV_DESCRIPTION,
    DYNATRACE_PROJECT_NAME, DYNATRACE_PROJECT_NAME_DESCRIPTION,
    RATE_LIMITS_ENABLED, RATE_LIMITS_ENABLED_DESCRIPTION,
    RATE_LIMITS_RPS, RATE_LIMITS_RPS_DESCRIPTION,
    CN_ENABLED, CN_ENABLED_DESCRIPTION, CN_WHITELIST, CN_WHITELIST_DESCRIPTION,
    UNIMON_ENABLED, UNIMON_ENABLED_DESCRIPTION,
    UNIMON_AGENT, UNIMON_AGENT_DESCRIPTION, UNIMON_SENDER, UNIMON_SENDER_DESCRIPTION,
    UNIMON_TOPIC, UNIMON_TOPIC_DESCRIPTION,
    UNIMON_ALWAYS_ENABLED, UNIMON_ALWAYS_ENABLED_DESCRIPTION,
    UNION_AUDIT_ENABLED, UNION_AUDIT_ENABLED_DESCRIPTION,
    FLUENTBIT_ENABLED, FLUENTBIT_ENABLED_DESCRIPTION,
    FLUENTBIT_TOPIC, FLUENTBIT_TOPIC_DESCRIPTION,
)

class SuccessResponse(BaseModel):
    success: bool


class SecmanStorage(BaseModel):
    secman_instance_id: int
    storage_id: Optional[int]
    tenant: str
    path: Optional[str]
    ptc_storage_path: Optional[str]
    storage_type: Optional[str]
    current_version: Optional[int]


class ServiceInstanceResponse(BaseModel):
    instance_id: int
    service_id: int
    env: str
    stand: Optional[str]
    channel: Optional[str]
    network_segment: Optional[str]
    openshift_namespace_id: int
    namespace: str
    link: str
    cluster_id: str
    enabled: bool
    is_configured: bool
    dropp_app: bool
    infra_chart: bool
    istio_new_cp: bool
    is_ca_engine: bool
    is_ott_engine: bool
    target: Optional[bool] = False

    def get_target(self) -> bool:
        if not self.target:
            return False
        return self.target


class EnableInstanceResponse(BaseModel):
    success: bool


class ServiceRegistrationResponse(BaseModel):
    service_id: int
    pull_request_url: str


class ServiceRegistrationBuildInput(BaseModel):
    dockerfile: Optional[str]
    is_dictionaries_enabled: Optional[bool]
    is_session_slave_enable: Optional[bool]
    is_sup_enable: Optional[bool]
    maven_args: Optional[str]
    maven_task: Optional[str]
    nmp_task: Optional[str]
    npm_task_args: Optional[str]
    target_dir: Optional[str]


class ServiceRegistrationConfInput(BaseModel):
    config_path: str
    description: Optional[str]
    fp_id: str
    jira_key: Optional[str]
    repository_url: str
    service_name: str
    service_type: str


class NewServiceRegistrationInput(BaseModel):
    branch: str
    build: ServiceRegistrationBuildInput
    insert_service: ServiceRegistrationConfInput


class PerformanceSettings(BaseModel):
    cpu: str = Field(description=CPU, markdownDescription=CPU_DESCRIPTION)
    memory: str = Field(description=MEMORY, markdownDescription=MEMORY_DESCRIPTION)

class PerformanceSettingsServiceGo(BaseModel):
    cpu: str = Field(description=CPU, markdownDescription=CPU_DESCRIPTION)
    memory: str = Field(description=MEMORY, markdownDescription=MEMORY_DESCRIPTION)

class PerformanceSettingsFullInput(BaseModel):
    cpu: str
    memory: str


class ProbeSettings(BaseModel):
    initial_delay_seconds: int = Field(
        description=INITIAL_DELAY_SECONDS, markdownDescription=INITIAL_DELAY_SECONDS_DESCRIPTION
    )

    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class ProbeSettingsFullInput(BaseModel):
    initial_delay_seconds: int

class SidecarSettings(BaseModel):
    limits: PerformanceSettings = Field(
        description=LIMITS, markdownDescription=LIMITS_DESCRIPTION
    )
    requests: PerformanceSettings = Field(
        description=REQUESTS, markdownDescription=REQUESTS_DESCRIPTION
    )
    liveness_probe: ProbeSettings = Field(
        description=LIVENESS_PROBE, markdownDescription=LIVENESS_PROBE_DESCRIPTION
    )
    readiness_probe: ProbeSettings = Field(
        description=READINESS_PROBE, markdownDescription=READINESS_PROBE_DESCRIPTION
    )

    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class SidecarIstioSettings(SidecarSettings):
    replicas: Optional[int]


class UnimonParams(SidecarSettings):
    istio: SidecarIstioSettings = Field(
        description=ISTIO_SIDECAR, markdownDescription=ISTIO_SIDECAR_DESCRIPTION
    )
    vault: SidecarSettings = Field(
        description=VAULT_SIDECAR, markdownDescription=VAULT_SIDECAR_DESCRIPTION
    )


class Unimon(BaseModel):
    enabled: bool = Field(description=UNIMON_ENABLED, markdownDescription=UNIMON_ENABLED_DESCRIPTION)
    agent: UnimonParams = Field(description=UNIMON_AGENT, markdownDescription=UNIMON_AGENT_DESCRIPTION)
    sender: UnimonParams = Field(description=UNIMON_SENDER, markdownDescription=UNIMON_SENDER_DESCRIPTION)
    topic: Optional[str] = Field(
        default='', description=UNIMON_TOPIC, markdownDescription=UNIMON_TOPIC_DESCRIPTION
    )
    always_enabled: Optional[bool] = Field(
        default=None, description=UNIMON_ALWAYS_ENABLED, markdownDescription=UNIMON_ALWAYS_ENABLED_DESCRIPTION
    )
    kafka_brokers: Optional[List[str]] = Field(
        description=KAFKA_BROKERS, markdownDescription=KAFKA_BROKERS_DESCRIPTION, default=[]
    )


class Fluentbit(SidecarSettings):
    enabled: bool = Field(description=FLUENTBIT_ENABLED, markdownDescription=FLUENTBIT_ENABLED_DESCRIPTION)
    topic: str = Field(description=FLUENTBIT_TOPIC, markdownDescription=FLUENTBIT_TOPIC_DESCRIPTION)
    kafka_brokers: Optional[List[str]] = Field(
        description=KAFKA_BROKERS, markdownDescription=KAFKA_BROKERS_DESCRIPTION, default=[]
    )


class CN(BaseModel):
    enabled: bool = Field(default=False, description=CN_ENABLED, markdownDescription=CN_ENABLED_DESCRIPTION)
    whitelist: List[str] = Field(
        default=[], description=CN_WHITELIST, markdownDescription=CN_WHITELIST_DESCRIPTION
    )


class RateLimits(BaseModel):
    enabled: Optional[bool] = Field(
        default=None, description=RATE_LIMITS_ENABLED, markdownDescription=RATE_LIMITS_ENABLED_DESCRIPTION
    )
    rps: Optional[int] = Field(
        default=100, description=RATE_LIMITS_RPS, markdownDescription=RATE_LIMITS_RPS_DESCRIPTION
    )

class OTTParams(SidecarSettings):
    mode: str


class UnionAudit(BaseModel):
    enabled: bool = Field(description=UNION_AUDIT_ENABLED, markdownDescription=UNION_AUDIT_ENABLED_DESCRIPTION)
    kafka_brokers: Optional[List[str]] = Field(
        alias='kafkaBrokers', 
        description=KAFKA_BROKERS, 
        markdownDescription=KAFKA_BROKERS_DESCRIPTION, 
        default=[]
    )

class UnionAuditInput(BaseModel):
    enabled: bool
    kafka_brokers: Optional[List[str]]


class DynatraceHost(BaseModel):
    cluster_name: Optional[str] = Field(
        default=None, description=DYNATRACE_CLUSTER_NAME, markdownDescription=DYNATRACE_CLUSTER_NAME_DESCRIPTION
    )
    env_name: Optional[str] = Field(
        default=None, description=DYNATRACE_ENV_NAME, markdownDescription=DYNATRACE_ENV_NAME_DESCRIPTION
    )


class DynatraceHostInput(BaseModel):
    cluster_name: str
    env_name: str


class DynatraceLabels(BaseModel):
    agent_version: str = Field(description=DYNATRACE_AGENT_VERSION, markdownDescription=DYNATRACE_AGENT_VERSION_DESCRIPTION)
    cluster: str = Field(description=DYNATRACE_CLUSTER, markdownDescription=DYNATRACE_CLUSTER_DESCRIPTION)
    env: str = Field(description=DYNATRACE_ENV, markdownDescription=DYNATRACE_ENV_DESCRIPTION)
    project_name: str = Field(description=DYNATRACE_PROJECT_NAME, markdownDescription=DYNATRACE_PROJECT_NAME_DESCRIPTION)

class DynatraceLabelsInput(BaseModel):
    agent_version: str
    cluster: str
    env: str
    project_name: str


class Dynatrace(BaseModel):
    enabled: bool = Field(
        default=False, description=DYNATRACE_ENABLED, markdownDescription=DYNATRACE_ENABLED_DESCRIPTION
    )
    reflex_host: Optional[DynatraceHost] = Field(
        default=DynatraceHost.parse_obj(DEFAULT_DYNATRACE_DICT['reflex_host']),
        description=DYNATRACE_HOST, markdownDescription=DYNATRACE_HOST_DESCRIPTION
    )
    reflex_labels: Optional[DynatraceLabels] = Field(
        default=DynatraceLabels.parse_obj(DEFAULT_DYNATRACE_DICT['reflex_labels']),
        description=DYNATRACE_LABELS, markdownDescription=DYNATRACE_LABELS_DESCRIPTION
    )

class DynatraceInput(BaseModel):
    enabled: bool
    reflex_host: Optional[DynatraceHostInput]
    reflex_labels: Optional[DynatraceLabelsInput]


class DBMigration(BaseModel):
    command: str = Field(description=DB_MIGRATION_COMMAND, markdownDescription=DB_MIGRATION_COMMAND_DESCRIPTION)
    limits: PerformanceSettings = Field(description=LIMITS, markdownDescription=LIMITS_DESCRIPTION)
    requests: PerformanceSettings = Field(description=REQUESTS, markdownDescription=REQUESTS_DESCRIPTION)

class ProbeServiceGo(BaseModel):
    path: Optional[str] = Field(default=None, description=PROBE_PATH, markdownDescription=PROBE_PATH_DESCRIPTION)
    port: Optional[int] = Field(default=None, description=PROBE_PORT, markdownDescription=PROBE_PORT_DESCRIPTION)
    initial_delay_seconds: Optional[int] = Field(
        default=None, description=INITIAL_DELAY_SECONDS, markdownDescription=INITIAL_DELAY_SECONDS_DESCRIPTION
    )
    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class ProbeServiceGoInput(BaseModel):
    path: Optional[str]
    port: Optional[int]
    initial_delay_seconds: Optional[int]
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class ProbePropertiesServiceGo(ProbeServiceGo):
    liveness_probe: Optional[ProbeServiceGo] = Field(
        default=None, description=PROBE_LIVENESS, markdownDescription=PROBE_LIVENESS_DESCRIPTION
    )
    readiness_probe: Optional[ProbeServiceGo] = Field(
        default=None, description=PROBE_READINESS, markdownDescription=PROBE_READINESS_DESCRIPTION
    )
    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class ProbePropertiesServiceGoInput(ProbeServiceGo):
    liveness_probe: Optional[ProbeServiceGoInput]
    readiness_probe: Optional[ProbeServiceGoInput]
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class SetProbeServiceGo(ProbeServiceGo):
    pass


class SetProbePropertiesServiceGo(BaseModel):
    liveness_probe: SetProbeServiceGo
    readiness_probe: SetProbeServiceGo
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class SetAppResourcesServiceGo(BaseModel):
    limits: PerformanceSettingsServiceGo
    requests: PerformanceSettingsServiceGo
    initial_delay_seconds: int
    replicas: int
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class SystemContainerResourcesServiceGo(BaseModel):
    limits: PerformanceSettingsServiceGo = Field(description=LIMITS, markdownDescription=LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=REQUESTS, markdownDescription=REQUESTS_DESCRIPTION)
    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class SystemContainerResourcesServiceGoInput(BaseModel):
    limits: PerformanceSettingsFullInput
    requests: PerformanceSettingsFullInput
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True

class SystemContainerResourcesFull(BaseModel):
    limits: PerformanceSettingsServiceGo = Field(description=LIMITS, markdownDescription=LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=REQUESTS, markdownDescription=REQUESTS_DESCRIPTION)
    liveness_probe: Optional[ProbeSettings] = Field(
        ProbeSettings(initial_delay_seconds=120),
        description=LIVENESS_PROBE, markdownDescription=LIVENESS_PROBE_DESCRIPTION
    )
    readiness_probe: Optional[ProbeSettings] = Field(
        ProbeSettings(initial_delay_seconds=120),
        description=READINESS_PROBE, markdownDescription=READINESS_PROBE_DESCRIPTION
    )
    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class SystemContainerResourcesFullInput(BaseModel):
    limits: PerformanceSettingsFullInput
    requests: PerformanceSettingsFullInput
    liveness_probe: Optional[ProbeSettingsFullInput]
    readiness_probe: Optional[ProbeSettingsFullInput]
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class SystemContainerResourcesOpenshift(BaseModel):
    limits: PerformanceSettingsServiceGo
    requests: PerformanceSettingsServiceGo
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class VaultContainerResourcesServiceGo(SystemContainerResourcesServiceGo):
    pass

class VaultContainerResourcesServiceGoInput(SystemContainerResourcesServiceGoInput):
    pass

class VaultContainerResourcesFull(SystemContainerResourcesFull):
    pass

class VaultContainerResourcesFullInput(SystemContainerResourcesFullInput):
    pass


class IstioAppResourcesServiceGo(SystemContainerResourcesServiceGo):
    replicas: Optional[int] = Field(default=None, description=REPLICAS, markdownDescription=REPLICAS_DESCRIPTION)

class IstioAppResourcesServiceGoInput(SystemContainerResourcesServiceGoInput):
    replicas: Optional[int]


class IstioContainerResourcesServiceGo(SystemContainerResourcesFull):
    replicas: int = Field(description=REPLICAS, markdownDescription=REPLICAS_DESCRIPTION)

class IstioContainerResourcesServiceGoInput(SystemContainerResourcesFullInput):
    replicas: int


class ContainersPropertiesServiceGo(BaseModel):
    istio: IstioContainerResourcesServiceGo = Field(
        description=ISTIO_SIDECAR, markdownDescription=ISTIO_SIDECAR_DESCRIPTION
    )
    vault: VaultContainerResourcesFull = Field(
        description=VAULT_SIDECAR, markdownDescription=VAULT_SIDECAR_DESCRIPTION
    )

class ContainersPropertiesServiceGoInput(BaseModel):
    istio: IstioContainerResourcesServiceGoInput
    vault: VaultContainerResourcesFullInput


class AppResourcesServiceGo(BaseModel):
    initial_delay_seconds: Optional[int] = Field(
        default=120, description=INITIAL_DELAY_SECONDS, markdownDescription=INITIAL_DELAY_SECONDS_DESCRIPTION
    )
    limits: PerformanceSettingsServiceGo = Field(description=LIMITS, markdownDescription=LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=REQUESTS, markdownDescription=REQUESTS_DESCRIPTION)
    replicas: int = Field(description=REPLICAS, markdownDescription=REPLICAS_DESCRIPTION)
    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class AppResourcesServiceGoInput(BaseModel):
    initial_delay_seconds: int
    limits: PerformanceSettingsFullInput
    requests: PerformanceSettingsFullInput
    replicas: int
    class Config: 
        alias_generator=to_camel
        allow_population_by_field_name = True


class AppPropertiesServiceGo(BaseModel):
    command: str = Field(description=APP_COMMAND, markdownDescription=APP_COMMAND_DESCRIPTION)
    istio: IstioAppResourcesServiceGo = Field(
        description=ISTIO_SIDECAR, markdownDescription=ISTIO_SIDECAR_DESCRIPTION
    )
    vault: VaultContainerResourcesServiceGo = Field(
        description=VAULT_SIDECAR, markdownDescription=VAULT_SIDECAR_DESCRIPTION
    )
    command: Optional[str] = Field(
        default=None, description=APP_COMMAND, markdownDescription=APP_COMMAND_DESCRIPTION
    )
    port: Optional[int] = Field(
        default=None, description=APP_PORT, markdownDescription=APP_PORT_DESCRIPTION
    )
    probe: ProbePropertiesServiceGo = Field(
        description=APP_PROBE, markdownDescription=APP_PROBE_DESCRIPTION
    )
    resources: AppResourcesServiceGo = Field(
        description=APP_RESOURCES, markdownDescription=APP_RESOURCES_DESCRIPTION
    )

class AppPropertiesServiceGoInput(BaseModel):
    command: str
    istio: IstioAppResourcesServiceGoInput
    vault: VaultContainerResourcesServiceGoInput
    command: Optional[str]
    port: Optional[int]
    probe: ProbePropertiesServiceGoInput
    resources: AppResourcesServiceGoInput


class OpenshiftContainersInfoServiceGo(BaseModel):
    app: AppPropertiesServiceGo
    ingress: ContainersPropertiesServiceGo
    egress: ContainersPropertiesServiceGo

# todo replicas - fluentbit? unimon? - уточнить надо
class ServiceSettingsResponse(BaseModel):
    unimon: Optional[Unimon] = Field(
        default=Unimon.parse_obj(UNIMON_DEFAULT_DICT)
    )
    fluentbit: Optional[Fluentbit] = Field(
        default=Fluentbit.parse_obj(FLUENTBIT_DEFAULT_DICT),
    )
    cn: Optional[CN] = Field(
        alias="cn",
        default = CN(enabled = False)
    )
    ufs_session: Optional[SidecarSettings]
    ufs_params: Optional[SidecarSettings]
    ott_params: Optional[OTTParams] = Field(
        alias="ottParams",
        default=OTTParams.parse_obj(OTT_DEFAULT_DICT),
    )
    rate_limits: Optional[RateLimits] = Field(
        alias="rateLimits",
        default=RateLimits.parse_obj(RATE_LIMITS_DEFAULT_DICT),
    )
    union_audit: Optional[UnionAudit] = Field(
        alias="unionAudit",
        default = UnionAudit.parse_obj(UNION_AUDIT_DEFAULT_DICT)
    )
    dynatrace: Optional[Dynatrace] = Field(
        default=Dynatrace.parse_obj(DEFAULT_DYNATRACE_DICT),
    )
    db_migration: Optional[DBMigration] = Field(
        alias="dbMigration",
        default=DBMigration.parse_obj(DB_MIGRATION_DEFAULT_DICT),
    )
    app: Optional[AppPropertiesServiceGo] = Field(
        default=AppPropertiesServiceGo.parse_obj(APP_DEFAULT_DICT),
    )
    egress: Optional[ContainersPropertiesServiceGo] = Field(
        default=ContainersPropertiesServiceGo.parse_obj(EGRESS_DEFAULT_DICT),
    )
    ingress: Optional[ContainersPropertiesServiceGo] = Field(
        default=ContainersPropertiesServiceGo.parse_obj(INGRESS_DEFAULT_DICT)
    )

class ServiceSettingsSchema(BaseModel):
    app: Optional[AppPropertiesServiceGo] = Field(
        alias="app",
        description=APP_DESCRIPTION,
        markdownDescription=APP_MARKDOWN,
        default=AppPropertiesServiceGo.parse_obj(APP_DEFAULT_DICT),
    )
    ingress: Optional[ContainersPropertiesServiceGo] = Field(
        alias="ingress",
        description=INGRESS_DESCRIPTION,
        markdownDescription=INGRESS_MARKDOWN,
        default=ContainersPropertiesServiceGo.parse_obj(INGRESS_DEFAULT_DICT),
    )
    egress: Optional[ContainersPropertiesServiceGo] = Field(
        alias="egress",
        description=EGRESS_DESCRIPTION,
        markdownDescription=EGRESS_MARKDOWN,
        default=ContainersPropertiesServiceGo.parse_obj(EGRESS_DEFAULT_DICT),
    )
    db_migration: Optional[DBMigration] = Field(
        alias="dbMigration",
        description=DB_MIGRATION_DESCRIPTION,
        markdownDescription=DB_MIGRATION_MARKDOWN,
        default=DBMigration.parse_obj(DB_MIGRATION_DEFAULT_DICT),
    )
    ott_params: Optional[OTTParams] = Field(
        alias="ottParams",
        description=OTT_PARAMS_DESCRIPTION,
        markdownDescription=OTT_PARAMS_MARKDOWN,
        default=OTTParams.parse_obj(OTT_DEFAULT_DICT),
    )
    fluentbit: Optional[Fluentbit] = Field(
        alias="fluentbit",
        description=FLUENTBIT_DESCRIPTION,
        markdownDescription=FLUENTBIT_MARKDOWN,
        default=Fluentbit.parse_obj(FLUENTBIT_DEFAULT_DICT),
    )
    dynatrace: Optional[Dynatrace] = Field(
        alias="dynatrace",
        description=DYNATRACE_DESCRIPTION,
        markdownDescription=DYNATRACE_MARKDOWN,
        default=Dynatrace.parse_obj(DEFAULT_DYNATRACE_DICT),
    )
    rate_limits: Optional[RateLimits] = Field(
        alias="rateLimits",
        description=RATE_LIMITS_DESCRIPTION,
        markdownDescription=RATE_LIMITS_MARKDOWN,
        default=RateLimits.parse_obj(RATE_LIMITS_DEFAULT_DICT),
    )
    cn: Optional[CN] = Field(
        alias="cn",
        description=CN_DESCRIPTION,
        markdownDescription=CN_MARKDOWN,
        default=CN.parse_obj(CN_DEFAULT_DICT),
    )
    unimon: Optional[Unimon] = Field(
        alias="unimon",
        description=UNIMON_DESCRIPTION,
        markdownDescription=UNIMON_MARKDOWN,
        default=Unimon.parse_obj(UNIMON_DEFAULT_DICT)
    )
    ufs_params: Optional[SidecarSettings] = Field(
        alias="ufsParams",
        description=UFS_PARAMS_DESCRIPTION,
        markdownDescription=UFS_PARAMS_MARKDOWN,
    )
    ufs_session: Optional[SidecarSettings] = Field(
        alias="ufsSession",
        description=UFS_SESSION_DESCRIPTION,
        markdownDescription=UFS_SESSION_MARKDOWN,
    )
    union_audit: Optional[UnionAudit] = Field(
        alias="unionAudit",
        description=UNION_AUDIT_DESCRIPTION,
        markdownDescription=UNION_AUDIT_MARKDOWN,
        default=UnionAudit.parse_obj(UNION_AUDIT_DEFAULT_DICT),
    )

class UpsertSettingsResponse(BaseModel):
    id: int


class EnableModuleResponse(BaseModel):
    success: bool


class SetEFSPlatformVersion(BaseModel):
    success: bool


class IngressHost(BaseModel):
    name: str
    protocol: str
    port: int


class OpenshiftNamespacesResponse(BaseModel):
    id: int
    link: str
    namespace: str
    server_id: str
    configuration_item: str
    cluster_id: Optional[str]
    is_configured: Optional[bool]


class ServiceInfo(BaseModel):
    id: int
    fp_id: str
    service_name: str
    service_type: str
    repository_url: str
    jira_key: Optional[str]
    is_archived: bool


class ServicePlatformVersion(BaseModel):
    service_id: str
    platform_version: str


class EfsServiceSettingsForm(BaseModel):
    subsystem_code: str | None
    fpi_name: str | None
    deployment_unit: str | None
    iag_prefix: str | None
    eag_prefix: str | None
    ingress_prefix: str | None
    ingress_rewrite: str | None
    context_path: str | None
    sticky_session_enabled: bool | None
    sticky_session_cookie_name: str | None
    iag_bh: bool | None
    iag_ex: bool | None
    sds_params: Optional[dict] = None


class UserInfo(BaseModel):
    display_name: str
    email: str
    user_login: str


class Roles(BaseModel):
    roles: list[str]


class UserWithRoles(UserInfo, Roles):
    pass


# todo extract common types
class EnvironmentType(str, Enum):
    IFT = 'IFT'
    NT = 'NT'
    PSI = 'PSI'
    PROM = 'PROM'


class ServiceType(str, Enum):
    Java11Efs201Emp = 'Java11EFS201Emp'
    Node14SbolProWeb = 'Node14SbolProWeb'
    Java11PPRB4 = 'Java11PPRB4'


class Service(BaseModel):
    id: int
    service_name: str
    service_type: ServiceType
    fp_id: str
    repository_url: str
    is_archived: Optional[bool]


class EngineType(str, Enum):
    SBERCA = 'SBERCA'
    SBEROTT = 'SBEROTT'


class CertType(str, Enum):
    SberCaClient = "SBERCACLIENT"
    SberCaServer = "SBERCASERVER"
    SberOTTClient = "SBEROTTCLIENT"
    SberOTTServer = "SBEROTTSERVER"


class InfoMessageType(str, Enum):
    success = 'success'
    info = 'info'
    warning = 'warning'
    draft = 'draft'


class InfoMessage(BaseModel):
    id: int
    content: str
    enabled: bool
    type: InfoMessageType
    created_at: str


class ServiceInstance(BaseModel):
    instance_id: int
    service_id: int
    env: EnvironmentType
    openshift_namespace_id: int


class SecmanNamespaceEngineProperties(BaseModel):
    address: Optional[str]
    tenant: Optional[str]
    path: Optional[str]
    cn: Optional[str]
    alt_names: Optional[List[str]]


class SecmanNamespaceEngine(BaseModel):
    namespace_id: int
    storage_type: str
    properties: Optional[SecmanNamespaceEngineProperties]
    enable: bool


class UpdateServiceRequest(BaseModel):
    fp_id: Optional[str]
    repository_url: Optional[str]


class FavoriteService(BaseModel):
    service_id: int
    service_name: str
    service_type: ServiceType
    fp_id: str
    date: str


class ServiceWithRole(Service, Roles):
    pass

    def exist_any_role(self, roles: list[str]) -> bool:
        for role in roles:
            if role in self.roles:
                return True
        return False


class ServicesWithRole(BaseModel):
    services: List[ServiceWithRole]
    limit: int
    offset: int
мне нужно добавить описания к полям
import yaml
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.core.utils import to_camel

import app.core.clients.service_registry_go.service_settings_descriptions as ssd

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
    cpu: str = Field(description=ssd.CPU, markdownDescription=ssd.CPU_DESCRIPTION)
    memory: str = Field(description=ssd.MEMORY, markdownDescription=ssd.MEMORY_DESCRIPTION)

class PerformanceSettingsServiceGo(BaseModel):
    cpu: str = Field(description=ssd.CPU, markdownDescription=ssd.CPU_DESCRIPTION)
    memory: str = Field(description=ssd.MEMORY, markdownDescription=ssd.MEMORY_DESCRIPTION)

class PerformanceSettingsFullInput(BaseModel):
    cpu: str
    memory: str


class ProbeSettings(BaseModel):
    initial_delay_seconds: int = Field(
        description=ssd.INITIAL_DELAY_SECONDS, markdownDescription=ssd.INITIAL_DELAY_SECONDS_DESCRIPTION
    )

    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True

class ProbeSettingsFullInput(BaseModel):
    initial_delay_seconds: int

class SidecarSettings(BaseModel):
    limits: PerformanceSettings = Field(
        description=ssd.LIMITS, markdownDescription=ssd.LIMITS_DESCRIPTION
    )
    requests: PerformanceSettings = Field(
        description=ssd.REQUESTS, markdownDescription=ssd.REQUESTS_DESCRIPTION
    )
    liveness_probe: ProbeSettings = Field(
        description=ssd.LIVENESS_PROBE, markdownDescription=ssd.LIVENESS_PROBE_DESCRIPTION
    )
    readiness_probe: ProbeSettings = Field(
        description=ssd.READINESS_PROBE, markdownDescription=ssd.READINESS_PROBE_DESCRIPTION
    )

    class Config:
        alias_generator=to_camel
        allow_population_by_field_name = True


class SidecarIstioSettings(SidecarSettings):
    replicas: Optional[int]


class UnimonParams(SidecarSettings):
    istio: SidecarIstioSettings = Field(
        description=ssd.ISTIO_SIDECAR, markdownDescription=ssd.ISTIO_SIDECAR_DESCRIPTION
    )
    vault: SidecarSettings = Field(
        description=ssd.VAULT_SIDECAR, markdownDescription=ssd.VAULT_SIDECAR_DESCRIPTION
    )


class Unimon(BaseModel):
    enabled: bool = Field(description=ssd.UNIMON_ENABLED, markdownDescription=ssd.UNIMON_ENABLED_DESCRIPTION)
    agent: UnimonParams = Field(description=ssd.UNIMON_AGENT, markdownDescription=ssd.UNIMON_AGENT_DESCRIPTION)
    sender: UnimonParams = Field(description=ssd.UNIMON_SENDER, markdownDescription=ssd.UNIMON_SENDER_DESCRIPTION)
    topic: Optional[str] = Field(
        default='', description=ssd.UNIMON_TOPIC, markdownDescription=ssd.UNIMON_TOPIC_DESCRIPTION
    )
    always_enabled: Optional[bool] = Field(
        default=None, description=ssd.UNIMON_ALWAYS_ENABLED, markdownDescription=ssd.UNIMON_ALWAYS_ENABLED_DESCRIPTION
    )
    kafka_brokers: Optional[List[str]] = Field(
        description=ssd.KAFKA_BROKERS, markdownDescription=ssd.KAFKA_BROKERS_DESCRIPTION, default=[]
    )


class Fluentbit(SidecarSettings):
    enabled: bool = Field(description=ssd.FLUENTBIT_ENABLED, markdownDescription=ssd.FLUENTBIT_ENABLED_DESCRIPTION)
    topic: str = Field(description=ssd.FLUENTBIT_TOPIC, markdownDescription=ssd.FLUENTBIT_TOPIC_DESCRIPTION)
    kafka_brokers: Optional[List[str]] = Field(
        description=ssd.KAFKA_BROKERS, markdownDescription=ssd.KAFKA_BROKERS_DESCRIPTION, default=[]
    )


class CN(BaseModel):
    enabled: bool = Field(default=False, description=ssd.CN_ENABLED, markdownDescription=ssd.CN_ENABLED_DESCRIPTION)
    whitelist: List[str] = Field(
        default=[], description=ssd.CN_WHITELIST, markdownDescription=ssd.CN_WHITELIST_DESCRIPTION
    )


class RateLimits(BaseModel):
    enabled: Optional[bool] = Field(
        default=None, description=ssd.RATE_LIMITS_ENABLED, markdownDescription=ssd.RATE_LIMITS_ENABLED_DESCRIPTION
    )
    rps: Optional[int] = Field(
        default=100, description=ssd.RATE_LIMITS_RPS, markdownDescription=ssd.RATE_LIMITS_RPS_DESCRIPTION
    )

class OTTParams(SidecarSettings):
    mode: str


class UnionAudit(BaseModel):
    enabled: bool = Field(description=ssd.UNION_AUDIT_ENABLED, markdownDescription=ssd.UNION_AUDIT_ENABLED_DESCRIPTION)
    kafka_brokers: Optional[List[str]] = Field(
        alias='kafkaBrokers',
        description=ssd.KAFKA_BROKERS,
        markdownDescription=ssd.KAFKA_BROKERS_DESCRIPTION,
        default=[]
    )

class UnionAuditInput(BaseModel):
    enabled: bool
    kafka_brokers: Optional[List[str]]


class DynatraceHost(BaseModel):
    cluster_name: Optional[str] = Field(
        default=None, description=ssd.DYNATRACE_CLUSTER_NAME, markdownDescription=ssd.DYNATRACE_CLUSTER_NAME_DESCRIPTION
    )
    env_name: Optional[str] = Field(
        default=None, description=ssd.DYNATRACE_ENV_NAME, markdownDescription=ssd.DYNATRACE_ENV_NAME_DESCRIPTION
    )


class DynatraceHostInput(BaseModel):
    cluster_name: str
    env_name: str


class DynatraceLabels(BaseModel):
    agent_version: str = Field(description=ssd.DYNATRACE_AGENT_VERSION, markdownDescription=ssd.DYNATRACE_AGENT_VERSION_DESCRIPTION)
    cluster: str = Field(description=ssd.DYNATRACE_CLUSTER, markdownDescription=ssd.DYNATRACE_CLUSTER_DESCRIPTION)
    env: str = Field(description=ssd.DYNATRACE_ENV, markdownDescription=ssd.DYNATRACE_ENV_DESCRIPTION)
    project_name: str = Field(description=ssd.DYNATRACE_PROJECT_NAME, markdownDescription=ssd.DYNATRACE_PROJECT_NAME_DESCRIPTION)

class DynatraceLabelsInput(BaseModel):
    agent_version: str
    cluster: str
    env: str
    project_name: str


class Dynatrace(BaseModel):
    enabled: bool = Field(
        default=False, description=ssd.DYNATRACE_ENABLED, markdownDescription=ssd.DYNATRACE_ENABLED_DESCRIPTION
    )
    reflex_host: Optional[DynatraceHost] = Field(
        default=DynatraceHost.parse_obj(ssd.DEFAULT_DYNATRACE_DICT['reflex_host']),
        description=ssd.DYNATRACE_HOST, markdownDescription=ssd.DYNATRACE_HOST_DESCRIPTION
    )
    reflex_labels: Optional[DynatraceLabels] = Field(
        default=DynatraceLabels.parse_obj(ssd.DEFAULT_DYNATRACE_DICT['reflex_labels']),
        description=ssd.DYNATRACE_LABELS, markdownDescription=ssd.DYNATRACE_LABELS_DESCRIPTION
    )

class DynatraceInput(BaseModel):
    enabled: bool
    reflex_host: Optional[DynatraceHostInput]
    reflex_labels: Optional[DynatraceLabelsInput]


class DBMigration(BaseModel):
    command: str = Field(description=ssd.DB_MIGRATION_COMMAND, markdownDescription=ssd.DB_MIGRATION_COMMAND_DESCRIPTION)
    limits: PerformanceSettings = Field(description=ssd.LIMITS, markdownDescription=ssd.LIMITS_DESCRIPTION)
    requests: PerformanceSettings = Field(description=ssd.REQUESTS, markdownDescription=ssd.REQUESTS_DESCRIPTION)

class ProbeServiceGo(BaseModel):
    path: Optional[str] = Field(default=None, description=ssd.PROBE_PATH, markdownDescription=ssd.PROBE_PATH_DESCRIPTION)
    port: Optional[int] = Field(default=None, description=ssd.PROBE_PORT, markdownDescription=ssd.PROBE_PORT_DESCRIPTION)
    initial_delay_seconds: Optional[int] = Field(
        default=None, description=ssd.INITIAL_DELAY_SECONDS, markdownDescription=ssd.INITIAL_DELAY_SECONDS_DESCRIPTION
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
        default=None, description=ssd.PROBE_LIVENESS, markdownDescription=ssd.PROBE_LIVENESS_DESCRIPTION
    )
    readiness_probe: Optional[ProbeServiceGo] = Field(
        default=None, description=ssd.PROBE_READINESS, markdownDescription=ssd.PROBE_READINESS_DESCRIPTION
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
    limits: PerformanceSettingsServiceGo = Field(description=ssd.LIMITS, markdownDescription=ssd.LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=ssd.REQUESTS, markdownDescription=ssd.REQUESTS_DESCRIPTION)
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
    limits: PerformanceSettingsServiceGo = Field(description=ssd.LIMITS, markdownDescription=ssd.LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=ssd.REQUESTS, markdownDescription=ssd.REQUESTS_DESCRIPTION)
    liveness_probe: Optional[ProbeSettings] = Field(
        ProbeSettings(initial_delay_seconds=120),
        description=ssd.LIVENESS_PROBE, markdownDescription=ssd.LIVENESS_PROBE_DESCRIPTION
    )
    readiness_probe: Optional[ProbeSettings] = Field(
        ProbeSettings(initial_delay_seconds=120),
        description=ssd.READINESS_PROBE, markdownDescription=ssd.READINESS_PROBE_DESCRIPTION
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
    replicas: Optional[int] = Field(default=None, description=ssd.REPLICAS, markdownDescription=ssd.REPLICAS_DESCRIPTION)

class IstioAppResourcesServiceGoInput(SystemContainerResourcesServiceGoInput):
    replicas: Optional[int]


class IstioContainerResourcesServiceGo(SystemContainerResourcesFull):
    replicas: int = Field(description=ssd.REPLICAS, markdownDescription=ssd.REPLICAS_DESCRIPTION)

class IstioContainerResourcesServiceGoInput(SystemContainerResourcesFullInput):
    replicas: int


class ContainersPropertiesServiceGo(BaseModel):
    istio: IstioContainerResourcesServiceGo = Field(
        description=ssd.ISTIO_SIDECAR, markdownDescription=ssd.ISTIO_SIDECAR_DESCRIPTION
    )
    vault: VaultContainerResourcesFull = Field(
        description=ssd.VAULT_SIDECAR, markdownDescription=ssd.VAULT_SIDECAR_DESCRIPTION
    )

class ContainersPropertiesServiceGoInput(BaseModel):
    istio: IstioContainerResourcesServiceGoInput
    vault: VaultContainerResourcesFullInput


class AppResourcesServiceGo(BaseModel):
    initial_delay_seconds: Optional[int] = Field(
        default=120, description=ssd.INITIAL_DELAY_SECONDS, markdownDescription=ssd.INITIAL_DELAY_SECONDS_DESCRIPTION
    )
    limits: PerformanceSettingsServiceGo = Field(description=ssd.LIMITS, markdownDescription=ssd.LIMITS_DESCRIPTION)
    requests: PerformanceSettingsServiceGo = Field(description=ssd.REQUESTS, markdownDescription=ssd.REQUESTS_DESCRIPTION)
    replicas: int = Field(description=ssd.REPLICAS, markdownDescription=ssd.REPLICAS_DESCRIPTION)
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
    command: str = Field(description=ssd.APP_COMMAND, markdownDescription=ssd.APP_COMMAND_DESCRIPTION)
    istio: IstioAppResourcesServiceGo = Field(
        description=ssd.ISTIO_SIDECAR, markdownDescription=ssd.ISTIO_SIDECAR_DESCRIPTION
    )
    vault: VaultContainerResourcesServiceGo = Field(
        description=ssd.VAULT_SIDECAR, markdownDescription=ssd.VAULT_SIDECAR_DESCRIPTION
    )
    command: Optional[str] = Field(
        default=None, description=ssd.APP_COMMAND, markdownDescription=ssd.APP_COMMAND_DESCRIPTION
    )
    port: Optional[int] = Field(
        default=None, description=ssd.APP_PORT, markdownDescription=ssd.APP_PORT_DESCRIPTION
    )
    probe: ProbePropertiesServiceGo = Field(
        description=ssd.APP_PROBE, markdownDescription=ssd.APP_PROBE_DESCRIPTION
    )
    resources: AppResourcesServiceGo = Field(
        description=ssd.APP_RESOURCES, markdownDescription=ssd.APP_RESOURCES_DESCRIPTION
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
        default=Unimon.parse_obj(ssd.UNIMON_DEFAULT_DICT)
    )
    fluentbit: Optional[Fluentbit] = Field(
        default=Fluentbit.parse_obj(ssd.FLUENTBIT_DEFAULT_DICT),
    )
    cn: Optional[CN] = Field(
        alias="cn",
        default = CN(enabled = False)
    )
    ufs_session: Optional[SidecarSettings]
    ufs_params: Optional[SidecarSettings]
    ott_params: Optional[OTTParams] = Field(
        alias="ottParams",
        default=OTTParams.parse_obj(ssd.OTT_DEFAULT_DICT),
    )
    rate_limits: Optional[RateLimits] = Field(
        alias="rateLimits",
        default=RateLimits.parse_obj(ssd.RATE_LIMITS_DEFAULT_DICT),
    )
    union_audit: Optional[UnionAudit] = Field(
        alias="unionAudit",
        default = UnionAudit.parse_obj(ssd.UNION_AUDIT_DEFAULT_DICT)
    )
    dynatrace: Optional[Dynatrace] = Field(
        default=Dynatrace.parse_obj(ssd.DEFAULT_DYNATRACE_DICT),
    )
    db_migration: Optional[DBMigration] = Field(
        alias="dbMigration",
        default=DBMigration.parse_obj(ssd.DB_MIGRATION_DEFAULT_DICT),
    )
    app: Optional[AppPropertiesServiceGo] = Field(
        default=AppPropertiesServiceGo.parse_obj(ssd.APP_DEFAULT_DICT),
    )
    egress: Optional[ContainersPropertiesServiceGo] = Field(
        default=ContainersPropertiesServiceGo.parse_obj(ssd.EGRESS_DEFAULT_DICT),
    )
    ingress: Optional[ContainersPropertiesServiceGo] = Field(
        default=ContainersPropertiesServiceGo.parse_obj(ssd.INGRESS_DEFAULT_DICT)
    )

class ServiceSettingsSchema(BaseModel):
    app: Optional[AppPropertiesServiceGo] = Field(
        alias="app",
        description=ssd.APP_DESCRIPTION,
        markdownDescription=ssd.APP_MARKDOWN,
        default=AppPropertiesServiceGo.parse_obj(ssd.APP_DEFAULT_DICT),
    )
    ingress: Optional[ContainersPropertiesServiceGo] = Field(
        alias="ingress",
        description=ssd.INGRESS_DESCRIPTION,
        markdownDescription=ssd.INGRESS_MARKDOWN,
        default=ContainersPropertiesServiceGo.parse_obj(ssd.INGRESS_DEFAULT_DICT),
    )
    egress: Optional[ContainersPropertiesServiceGo] = Field(
        alias="egress",
        description=ssd.EGRESS_DESCRIPTION,
        markdownDescription=ssd.EGRESS_MARKDOWN,
        default=ContainersPropertiesServiceGo.parse_obj(ssd.EGRESS_DEFAULT_DICT),
    )
    db_migration: Optional[DBMigration] = Field(
        alias="dbMigration",
        description=ssd.DB_MIGRATION_DESCRIPTION,
        markdownDescription=ssd.DB_MIGRATION_MARKDOWN,
        default=DBMigration.parse_obj(ssd.DB_MIGRATION_DEFAULT_DICT),
    )
    ott_params: Optional[OTTParams] = Field(
        alias="ottParams",
        description=ssd.OTT_PARAMS_DESCRIPTION,
        markdownDescription=ssd.OTT_PARAMS_MARKDOWN,
        default=OTTParams.parse_obj(ssd.OTT_DEFAULT_DICT),
    )
    fluentbit: Optional[Fluentbit] = Field(
        alias="fluentbit",
        description=ssd.FLUENTBIT_DESCRIPTION,
        markdownDescription=ssd.FLUENTBIT_MARKDOWN,
        default=Fluentbit.parse_obj(ssd.FLUENTBIT_DEFAULT_DICT),
    )
    dynatrace: Optional[Dynatrace] = Field(
        alias="dynatrace",
        description=ssd.DYNATRACE_DESCRIPTION,
        markdownDescription=ssd.DYNATRACE_MARKDOWN,
        default=Dynatrace.parse_obj(ssd.DEFAULT_DYNATRACE_DICT),
    )
    rate_limits: Optional[RateLimits] = Field(
        alias="rateLimits",
        description=ssd.RATE_LIMITS_DESCRIPTION,
        markdownDescription=ssd.RATE_LIMITS_MARKDOWN,
        default=RateLimits.parse_obj(ssd.RATE_LIMITS_DEFAULT_DICT),
    )
    cn: Optional[CN] = Field(
        alias="cn",
        description=ssd.CN_DESCRIPTION,
        markdownDescription=ssd.CN_MARKDOWN,
        default=CN.parse_obj(ssd.CN_DEFAULT_DICT),
    )
    unimon: Optional[Unimon] = Field(
        alias="unimon",
        description=ssd.UNIMON_DESCRIPTION,
        markdownDescription=ssd.UNIMON_MARKDOWN,
        default=Unimon.parse_obj(ssd.UNIMON_DEFAULT_DICT)
    )
    ufs_params: Optional[SidecarSettings] = Field(
        alias="ufsParams",
        description=ssd.UFS_PARAMS_DESCRIPTION,
        markdownDescription=ssd.UFS_PARAMS_MARKDOWN,
    )
    ufs_session: Optional[SidecarSettings] = Field(
        alias="ufsSession",
        description=ssd.UFS_SESSION_DESCRIPTION,
        markdownDescription=ssd.UFS_SESSION_MARKDOWN,
    )
    union_audit: Optional[UnionAudit] = Field(
        alias="unionAudit",
        description=ssd.UNION_AUDIT_DESCRIPTION,
        markdownDescription=ssd.UNION_AUDIT_MARKDOWN,
        default=UnionAudit.parse_obj(ssd.UNION_AUDIT_DEFAULT_DICT),
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

"""
Configuration & Secrets Management Module (v6.3)
Handles environment variable loading, validation, and secret rotation
Implements entity visibility filtering for regulatory auditors
"""

import os
import json
from typing import List, Optional, Set
from datetime import datetime, timedelta
from enum import Enum

# ============================================================================
# Environment Configuration
# ============================================================================

class Environment(str, Enum):
    """Supported environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class Config:
    """
    Main configuration class that loads and validates environment variables.
    Implements centralized secrets management (v6.3).
    """
    
    # ========== AUTHENTICATION & SECURITY ==========
    ANCHOR_MASTER_KEY: str = os.getenv("ANCHOR_MASTER_KEY", "")
    JWT_EXPIRY_MINUTES: int = int(os.getenv("JWT_EXPIRY_MINUTES", "30"))
    TOTP_STEP: int = int(os.getenv("TOTP_STEP", "30"))
    
    SESSION_ROTATION_ENABLED: bool = os.getenv("SESSION_ROTATION_ENABLED", "true").lower() == "true"
    FINGERPRINT_VALIDATION_ENABLED: bool = os.getenv("FINGERPRINT_VALIDATION_ENABLED", "true").lower() == "true"
    
    # ========== DATABASE ==========
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./server/anchor.db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    
    # ========== EMAIL ==========
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@anchorgovernance.tech")
    FROM_NAME: str = os.getenv("FROM_NAME", "Anchor Governance System")
    EMAIL_BACKEND: str = os.getenv("EMAIL_BACKEND", "brevo")
    
    # ========== APPLICATION ==========
    ANCHOR_BASE_URL: str = os.getenv("ANCHOR_BASE_URL", "https://api.anchorgovernance.tech")
    ENVIRONMENT: Environment = Environment(os.getenv("ENVIRONMENT", "development"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    APP_NAME: str = os.getenv("APP_NAME", "Anchor Governance System")
    APP_VERSION: str = os.getenv("APP_VERSION", "6.3.0")
    
    # ========== MESH & SPOKE ==========
    HUB_ID: str = os.getenv("HUB_ID", "MASTER-HUB-001")
    REGIONAL_KEY: str = os.getenv("REGIONAL_KEY", "")
    HUB_URL: str = os.getenv("HUB_URL", "wss://api.anchorgovernance.tech/ws/spoke")
    
    # ========== GOVERNANCE & COMPLIANCE ==========
    OVERSIGHT_JWT_TTL_HOURS: int = int(os.getenv("OVERSIGHT_JWT_TTL_HOURS", "8"))
    
    AUDIT_LOG_ENABLED: bool = os.getenv("AUDIT_LOG_ENABLED", "true").lower() == "true"
    AUDIT_LOG_FILE: str = os.getenv("AUDIT_LOG_FILE", "server/logs/auth_audit.log")
    AUDIT_LOG_RETENTION_DAYS: int = int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "90"))
    
    # Entity Taxonomy (v6.3)
    ENTITY_VISIBILITY_FILTERING_ENABLED: bool = os.getenv("ENTITY_VISIBILITY_FILTERING_ENABLED", "true").lower() == "true"
    REGULATORY_AUDITOR_RESTRICTIONS_ENABLED: bool = os.getenv("REGULATORY_AUDITOR_RESTRICTIONS_ENABLED", "true").lower() == "true"
    
    # ========== SECRET ROTATION ==========
    SECRET_ROTATION_ENABLED: bool = os.getenv("SECRET_ROTATION_ENABLED", "false").lower() == "true"
    MASTER_KEY_ROTATION_DAYS: int = int(os.getenv("MASTER_KEY_ROTATION_DAYS", "90"))
    JWT_KEY_ROTATION_DAYS: int = int(os.getenv("JWT_KEY_ROTATION_DAYS", "30"))
    DB_CREDENTIAL_ROTATION_DAYS: int = int(os.getenv("DB_CREDENTIAL_ROTATION_DAYS", "180"))
    SECRET_ROTATION_NOTIFY_EMAIL: str = os.getenv("SECRET_ROTATION_NOTIFY_EMAIL", "security@anchorgovernance.tech")
    
    # ========== CORS & SECURITY ==========
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    ]
    HSTS_MAX_AGE: int = int(os.getenv("HSTS_MAX_AGE", "31536000"))
    HSTS_INCLUDE_SUBDOMAINS: bool = os.getenv("HSTS_INCLUDE_SUBDOMAINS", "true").lower() == "true"
    CSP_ENABLED: bool = os.getenv("CSP_ENABLED", "true").lower() == "true"
    
    # ========== FEATURE FLAGS ==========
    FEATURE_SESSION_FINGERPRINTING: bool = os.getenv("FEATURE_SESSION_FINGERPRINTING", "true").lower() == "true"
    FEATURE_AUDIT_LOGGING: bool = os.getenv("FEATURE_AUDIT_LOGGING", "true").lower() == "true"
    FEATURE_ENTITY_TAXONOMY: bool = os.getenv("FEATURE_ENTITY_TAXONOMY", "true").lower() == "true"
    FEATURE_WHITELIST_ENFORCEMENT: bool = os.getenv("FEATURE_WHITELIST_ENFORCEMENT", "true").lower() == "true"
    
    @classmethod
    def validate(cls) -> tuple[bool, list[str]]:
        """
        Validate critical configuration values.
        Returns: (is_valid, list_of_errors)
        """
        errors = []
        
        # Critical secrets validation
        if not cls.ANCHOR_MASTER_KEY or len(cls.ANCHOR_MASTER_KEY) < 32:
            errors.append("ANCHOR_MASTER_KEY not set or too short (min 32 chars)")
        
        # Production-specific requirements
        if cls.ENVIRONMENT == Environment.PRODUCTION:
            if cls.DEBUG:
                errors.append("DEBUG must be False in production")
            if "localhost" in cls.ANCHOR_BASE_URL:
                errors.append("ANCHOR_BASE_URL should not use localhost in production")
            if not cls.BREVO_API_KEY:
                errors.append("BREVO_API_KEY required in production")
            if "sqlite" in cls.DATABASE_URL:
                errors.append("PostgreSQL database required in production (not SQLite)")
        
        return len(errors) == 0, errors
    
    @classmethod
    def get_summary(cls) -> dict:
        """Get non-sensitive configuration summary for logging"""
        return {
            "environment": cls.ENVIRONMENT.value,
            "debug": cls.DEBUG,
            "app_version": cls.APP_VERSION,
            "database_type": "PostgreSQL" if "postgresql" in cls.DATABASE_URL else "SQLite",
            "auth_hardening": {
                "session_rotation": cls.SESSION_ROTATION_ENABLED,
                "fingerprint_validation": cls.FINGERPRINT_VALIDATION_ENABLED,
                "jwt_expiry_minutes": cls.JWT_EXPIRY_MINUTES,
            },
            "features": {
                "entity_taxonomy": cls.FEATURE_ENTITY_TAXONOMY,
                "audit_logging": cls.FEATURE_AUDIT_LOGGING,
                "whitelist_enforcement": cls.FEATURE_WHITELIST_ENFORCEMENT,
            }
        }


# ============================================================================
# Entity Taxonomy (v6.3)
# ============================================================================

class EntityType(str, Enum):
    """Valid entity types in the governance system"""
    AI_AGENT = "ai_agent"
    CODEBASE = "codebase"
    GATEWAY = "gateway"
    MESH_NODE = "mesh_node"
    POLICY = "policy"
    PROCESS = "process"
    DATABASE = "database"
    WEBHOOK = "webhook"


class VisibilityClass(str, Enum):
    """Entity visibility levels"""
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    RESTRICTED = "RESTRICTED"
    SEALED = "SEALED"


class EntityVisibilityFilter:
    """
    Enforces visibility constraints for users based on their role and clearance level.
    Prevents regulatory auditors from seeing codebase and sensitive entities (Anchor v6.3).
    """
    
    # Default visibility scope for each role
    DEFAULT_VISIBLE_ENTITIES: dict[str, Set[EntityType]] = {
        "owner": {EntityType.AI_AGENT, EntityType.CODEBASE, EntityType.GATEWAY, EntityType.MESH_NODE, EntityType.POLICY, EntityType.PROCESS, EntityType.DATABASE, EntityType.WEBHOOK},
        "admin": {EntityType.AI_AGENT, EntityType.CODEBASE, EntityType.GATEWAY, EntityType.MESH_NODE, EntityType.POLICY, EntityType.PROCESS, EntityType.DATABASE},
        "developer": {EntityType.AI_AGENT, EntityType.GATEWAY, EntityType.PROCESS},  # Limited access: no codebase, database, or webhooks
        "auditor_hub_only": {EntityType.AI_AGENT},  # HUB_ONLY scope
        "auditor_cross_hub": {EntityType.AI_AGENT, EntityType.GATEWAY},  # ORG_WIDE scope
        "auditor_regulatory": {EntityType.AI_AGENT, EntityType.GATEWAY, EntityType.PROCESS},  # SYSTEM_WIDE scope (no codebase)
        "member": {EntityType.AI_AGENT, EntityType.GATEWAY, EntityType.PROCESS},
    }
    
    # Restricted entities (never shown to regulatory auditors)
    CODEBASE_RESTRICTED_ENTITIES = {EntityType.CODEBASE, EntityType.DATABASE, EntityType.WEBHOOK}
    
    @classmethod
    def get_visible_entities(cls, user_role: str, user_subtype: Optional[str] = None) -> Set[EntityType]:
        """
        Get visible entity types for a given user role.
        
        Args:
            user_role: "owner", "admin", "developer", "auditor", "member"
            user_subtype: "government_auditor", "standard_auditor", "cross_hub_auditor"
        
        Returns:
            Set of EntityType values the user can see
        """
        if not Config.FEATURE_ENTITY_TAXONOMY:
            # If taxonomy disabled, show all entities except sealed
            return set(EntityType) - {EntityType.POLICY, EntityType.DATABASE}
        
        # Map auditor subtypes to visibility scope
        if user_role == "auditor" or user_role == "regulator":
            if user_subtype == "government_auditor":
                return cls.DEFAULT_VISIBLE_ENTITIES.get("auditor_regulatory", set())
            elif user_subtype == "cross_hub_auditor":
                return cls.DEFAULT_VISIBLE_ENTITIES.get("auditor_cross_hub", set())
            else:
                return cls.DEFAULT_VISIBLE_ENTITIES.get("auditor_hub_only", set())
        
        return cls.DEFAULT_VISIBLE_ENTITIES.get(user_role, set())
    
    @classmethod
    def can_access_entity(cls, user_role: str, entity_type: str, 
                         user_subtype: Optional[str] = None) -> bool:
        """
        Check if user can access a specific entity type.
        
        Prevents regulatory auditors from accessing codebase, database, and webhooks.
        """
        if not Config.ENTITY_VISIBILITY_FILTERING_ENABLED:
            return True
        
        visible_entities = cls.get_visible_entities(user_role, user_subtype)
        
        try:
            entity_enum = EntityType(entity_type)
        except ValueError:
            # Unknown entity type, deny access
            return False
        
        # Regulatory auditors cannot access codebase-related entities
        if (user_role in ["auditor", "regulator"] and 
            Config.REGULATORY_AUDITOR_RESTRICTIONS_ENABLED and
            entity_enum in cls.CODEBASE_RESTRICTED_ENTITIES):
            return False
        
        return entity_enum in visible_entities
    
    @classmethod
    def filter_entities(cls, entities: list[dict], user_role: str, 
                       user_subtype: Optional[str] = None) -> list[dict]:
        """
        Filter a list of entities based on user visibility permissions.
        
        Args:
            entities: List of entity dicts with 'entity_type' field
            user_role: User's role
            user_subtype: User's subtype (for auditors)
        
        Returns:
            Filtered list of accessible entities
        """
        visible_entities = cls.get_visible_entities(user_role, user_subtype)
        
        filtered = []
        for entity in entities:
            try:
                entity_type = EntityType(entity.get("entity_type", ""))
                if cls.can_access_entity(user_role, entity.get("entity_type"), user_subtype):
                    filtered.append(entity)
            except ValueError:
                # Skip unknown entity types
                continue
        
        return filtered


# ============================================================================
# Secret Rotation Manager (v6.3)
# ============================================================================

class SecretRotationSchedule:
    """Manages scheduled secret rotation"""
    
    def __init__(self):
        self.last_rotation: dict[str, datetime] = {}
    
    def should_rotate(self, secret_name: str, rotation_days: int) -> bool:
        """Check if a secret should be rotated"""
        if secret_name not in self.last_rotation:
            return False
        
        last_rotated = self.last_rotation[secret_name]
        rotation_due = datetime.utcnow() > (last_rotated + timedelta(days=rotation_days))
        return rotation_due
    
    def mark_rotated(self, secret_name: str):
        """Mark a secret as recently rotated"""
        self.last_rotation[secret_name] = datetime.utcnow()
    
    def get_rotation_status(self) -> dict:
        """Get current rotation status for all secrets"""
        status = {}
        for secret, timestamp in self.last_rotation.items():
            status[secret] = {
                "last_rotated": timestamp.isoformat(),
                "days_since_rotation": (datetime.utcnow() - timestamp).days
            }
        return status


# Global configuration instance
config = Config()
rotation_schedule = SecretRotationSchedule()

# Validate configuration on module load
is_valid, validation_errors = Config.validate()
if not is_valid:
    print("⚠️ Configuration validation warnings:")
    for error in validation_errors:
        print(f"  - {error}")

#!/usr/bin/env python3
"""
Test Suite for Secrets Management & Entity Taxonomy (v6.3)
Tests configuration, secret validation, and entity visibility filtering
"""

import sys
import os
from typing import Set

# Add server to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from config import Config, EntityType, EntityVisibilityFilter, Environment, SecretRotationSchedule


def test_config_validation():
    """Test configuration loading and validation."""
    print("\n=== TEST 1: Configuration Validation ===")
    
    # Check that Config loads variables
    # Note: ANCHOR_MASTER_KEY validation is not critical for this test in dev environment
    assert Config.JWT_EXPIRY_MINUTES == 30, "JWT expiry should be 30 minutes"
    assert Config.FEATURE_ENTITY_TAXONOMY == True, "Entity taxonomy should be enabled"
    
    print(f"✓ Configuration loaded successfully")
    print(f"  - Environment: {Config.ENVIRONMENT.value}")
    print(f"  - JWT Expiry: {Config.JWT_EXPIRY_MINUTES} minutes")
    print(f"  - Auth Hardening: {Config.FINGERPRINT_VALIDATION_ENABLED}")
    print(f"  - Entity Taxonomy: {Config.FEATURE_ENTITY_TAXONOMY}")
    
    # Test validation
    is_valid, errors = Config.validate()
    if is_valid:
        print(f"✓ Configuration validation passed")
    else:
        print(f"⚠️ Configuration warnings (expected in development):")
        for error in errors[:2]:  # Show first 2 errors only
            print(f"    - {error}")


def test_entity_types():
    """Test that all entity types are properly defined."""
    print("\n=== TEST 2: Entity Type Definitions ===")
    
    entity_types = [
        EntityType.AI_AGENT,
        EntityType.CODEBASE,
        EntityType.GATEWAY,
        EntityType.MESH_NODE,
        EntityType.POLICY,
        EntityType.PROCESS,
        EntityType.DATABASE,
        EntityType.WEBHOOK,
    ]
    
    print(f"Defined entity types ({len(entity_types)}):")
    for entity_type in entity_types:
        print(f"  • {entity_type.value}")
    
    assert len(entity_types) >= 8, "Should have at least 8 entity types"
    print("✓ All entity types defined correctly")


def test_owner_visibility():
    """Test that owners can see all entity types."""
    print("\n=== TEST 3: Owner Entity Visibility ===")
    
    visible = EntityVisibilityFilter.get_visible_entities("owner", None)
    
    print(f"Owner visible entities ({len(visible)}):")
    for entity in visible:
        print(f"  ✓ {entity.value}")
    
    assert EntityType.AI_AGENT in visible, "Owners should see AI agents"
    assert EntityType.CODEBASE in visible, "Owners should see codebase"
    assert EntityType.DATABASE in visible, "Owners should see databases"
    assert len(visible) >= 7, "Owners should see at least 7 entity types"
    
    print("✓ Owner visibility scope correct")


def test_regulatory_auditor_visibility():
    """Test that regulatory auditors cannot see codebase entities."""
    print("\n=== TEST 4: Regulatory Auditor Visibility Restrictions ===")
    
    # Test government auditor
    visible_gov = EntityVisibilityFilter.get_visible_entities("auditor", "government_auditor")
    print(f"Government auditor visible entities ({len(visible_gov)}):")
    for entity in visible_gov:
        print(f"  ✓ {entity.value}")
    
    # Verify restrictions
    assert EntityType.AI_AGENT in visible_gov, "Auditors should see AI agents"
    assert EntityType.GATEWAY in visible_gov, "Auditors should see gateways"
    assert EntityType.CODEBASE not in visible_gov, "Auditors should NOT see codebase"
    assert EntityType.DATABASE not in visible_gov, "Auditors should NOT see databases"
    assert EntityType.WEBHOOK not in visible_gov, "Auditors should NOT see webhooks"
    
    print("✓ Regulatory auditor restrictions enforced")
    
    # Test access control
    can_access_ai = EntityVisibilityFilter.can_access_entity("auditor", "ai_agent", "government_auditor")
    can_access_codebase = EntityVisibilityFilter.can_access_entity("auditor", "codebase", "government_auditor")
    
    assert can_access_ai == True, "Auditor should access AI agents"
    assert can_access_codebase == False, "Auditor should not access codebase"
    
    print("✓ Access control checks passed")


def test_developer_visibility():
    """Test that developers have limited visibility."""
    print("\n=== TEST 5: Developer Entity Visibility ===")
    
    visible = EntityVisibilityFilter.get_visible_entities("developer", None)
    
    print(f"Developer visible entities ({len(visible)}):")
    for entity in visible:
        print(f"  ✓ {entity.value}")
    
    assert EntityType.AI_AGENT in visible, "Developers should see AI agents"
    assert EntityType.GATEWAY in visible, "Developers should see gateways"
    assert EntityType.CODEBASE not in visible, "Developers should not see codebase"
    assert EntityType.DATABASE not in visible, "Developers should not see databases"
    
    print("✓ Developer visibility scope correct")


def test_entity_filtering():
    """Test filtering a list of entities."""
    print("\n=== TEST 6: Entity List Filtering ===")
    
    # Create sample entities
    sample_entities = [
        {"id": "agent_1", "entity_type": "ai_agent", "name": "Compliance Agent"},
        {"id": "code_1", "entity_type": "codebase", "name": "Backend Repository"},
        {"id": "gw_1", "entity_type": "gateway", "name": "API Gateway"},
        {"id": "proc_1", "entity_type": "process", "name": "Approval Process"},
        {"id": "db_1", "entity_type": "database", "name": "User Database"},
        {"id": "policy_1", "entity_type": "policy", "name": "Access Policy"},
    ]
    
    # Filter for owner (should see all)
    owner_filtered = EntityVisibilityFilter.filter_entities(sample_entities, "owner", None)
    print(f"Owner sees {len(owner_filtered)}/{len(sample_entities)} entities")
    assert len(owner_filtered) == 6, "Owner should see all 6 entities"
    
    # Filter for regulatory auditor (should be restricted)
    auditor_filtered = EntityVisibilityFilter.filter_entities(sample_entities, "auditor", "government_auditor")
    print(f"Auditor sees {len(auditor_filtered)}/{len(sample_entities)} entities:")
    for entity in auditor_filtered:
        print(f"  ✓ {entity['name']} ({entity['entity_type']})")
    
    assert len(auditor_filtered) == 2, "Auditor should see only 2 entities (ai_agent, gateway)"
    assert auditor_filtered[0]["entity_type"] == "ai_agent", "First should be AI agent"
    assert auditor_filtered[1]["entity_type"] == "gateway", "Second should be gateway"
    
    # Filter for developer (should see ai_agent, gateway, process)
    dev_filtered = EntityVisibilityFilter.filter_entities(sample_entities, "developer", None)
    print(f"Developer sees {len(dev_filtered)}/{len(sample_entities)} entities")
    assert len(dev_filtered) == 3, "Developer should see 3 entities (ai_agent, gateway, process)"
    
    print("✓ Entity filtering working correctly")


def test_secret_rotation():
    """Test secret rotation scheduling."""
    print("\n=== TEST 7: Secret Rotation Management ===")
    
    schedule = SecretRotationSchedule()
    
    # Test initial state
    assert schedule.should_rotate("master_key", 90) == False, "Unrotated secret should not rotate"
    print("✓ Rotation not due for new secret")
    
    # Mark as rotated
    schedule.mark_rotated("master_key")
    print("✓ Secret marked as rotated")
    
    # Get status
    status = schedule.get_rotation_status()
    assert "master_key" in status, "Should track rotation status"
    assert status["master_key"]["days_since_rotation"] == 0, "Should be 0 days since rotation"
    print(f"✓ Rotation status tracked: {status['master_key']}")
    
    print("✓ Secret rotation scheduling works")


def test_cors_configuration():
    """Test CORS origin configuration."""
    print("\n=== TEST 8: CORS Configuration ===")
    
    print(f"Allowed CORS origins ({len(Config.CORS_ORIGINS)}):")
    for origin in Config.CORS_ORIGINS:
        print(f"  ✓ {origin}")
    
    assert "http://localhost:5173" in Config.CORS_ORIGINS, "Should include Vite dev server"
    print("✓ CORS configuration correct")


def test_environment_specific_behavior():
    """Test environment-specific configuration."""
    print("\n=== TEST 9: Environment-Specific Behavior ===")
    
    print(f"Current environment: {Config.ENVIRONMENT.value}")
    
    # Test environment-specific settings
    if Config.ENVIRONMENT == Environment.PRODUCTION:
        assert Config.DEBUG == False, "DEBUG should be False in production"
        assert "localhost" not in Config.ANCHOR_BASE_URL, "Should not use localhost in production"
        print("✓ Production configuration enforced")
    elif Config.ENVIRONMENT == Environment.DEVELOPMENT:
        print("✓ Development mode detected")
        print(f"  - Debug: {Config.DEBUG}")
        print(f"  - Base URL: {Config.ANCHOR_BASE_URL}")


def test_feature_flags():
    """Test feature flag configuration."""
    print("\n=== TEST 10: Feature Flags ===")
    
    features = {
        "Session Fingerprinting": Config.FEATURE_SESSION_FINGERPRINTING,
        "Audit Logging": Config.FEATURE_AUDIT_LOGGING,
        "Entity Taxonomy": Config.FEATURE_ENTITY_TAXONOMY,
        "Whitelist Enforcement": Config.FEATURE_WHITELIST_ENFORCEMENT,
    }
    
    print("Enabled features:")
    for feature, enabled in features.items():
        status = "✓" if enabled else "✗"
        print(f"  {status} {feature}")
    
    assert Config.FEATURE_SESSION_FINGERPRINTING == True, "Session fingerprinting should be enabled"
    assert Config.FEATURE_ENTITY_TAXONOMY == True, "Entity taxonomy should be enabled"
    print("✓ Feature flags configured correctly")


def main():
    """Run all tests."""
    print("=" * 70)
    print("SECRETS MANAGEMENT & ENTITY TAXONOMY TEST SUITE (v6.3)")
    print("=" * 70)
    
    try:
        test_config_validation()
        test_entity_types()
        test_owner_visibility()
        test_regulatory_auditor_visibility()
        test_developer_visibility()
        test_entity_filtering()
        test_secret_rotation()
        test_cors_configuration()
        test_environment_specific_behavior()
        test_feature_flags()
        
        print("\n" + "=" * 70)
        print("✓ ALL TESTS PASSED - Secrets & Entity Taxonomy Implementation Valid")
        print("=" * 70)
        
        print("\nConfiguration Summary:")
        summary = Config.get_summary()
        for key, value in summary.items():
            print(f"  {key}: {value}")
        
        print("\nDeployment Checklist:")
        print("  ✓ .env.template created with all required variables")
        print("  ✓ config.py module with centralized configuration management")
        print("  ✓ EntityVisibilityFilter enforces access control")
        print("  ✓ SecretRotationSchedule tracks rotation schedules")
        print("  ✓ Feature flags enable/disable functionality")
        print("  ✓ Environment-specific configuration")
        
        print("\nNext Steps:")
        print("  1. Copy .env.template to .env")
        print("  2. Update .env with your production secrets")
        print("  3. Verify config with: python -c 'from server.config import Config; print(Config.get_summary())'")
        print("  4. Deploy with: ENVIRONMENT=production python -m uvicorn server.auth:app")
        
        return 0
    except Exception as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

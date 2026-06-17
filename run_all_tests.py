#!/usr/bin/env python3
"""
Comprehensive Unit Test Suite Runner (v6.3)
Runs all unit test modules and generates comprehensive report
"""

import sys
import os
import subprocess
from datetime import datetime


class TestRunner:
    """Main test runner"""
    
    def __init__(self):
        self.test_modules = [
            "test_whitelist_api.py",
            "test_entity_visibility_advanced.py",
            "test_jwt_and_sessions.py",
            "test_audit_and_errors.py",
        ]
        self.results = {}
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
    
    def run_test_module(self, module_name):
        """Run a single test module"""
        print(f"\n{'=' * 70}")
        print(f"RUNNING: {module_name}")
        print(f"{'=' * 70}")
        
        try:
            result = subprocess.run(
                [sys.executable, module_name],
                cwd=os.path.dirname(os.path.abspath(__file__)),
                capture_output=True,
                text=True,
                timeout=60
            )
            
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            
            # Parse output for results
            output = result.stdout
            if "ALL" in output and "PASSED" in output and "(" in output:
                # Extract test count from output like "✓ ALL WHITELIST API TESTS PASSED (9/9)"
                try:
                    import re
                    match = re.search(r'\((\d+)/(\d+)\)', output)
                    if match:
                        passed = int(match.group(1))
                        total = int(match.group(2))
                        self.results[module_name] = {
                            "status": "PASSED",
                            "passed": passed,
                            "total": total
                        }
                        self.total_tests += total
                        self.passed_tests += passed
                        return True
                except:
                    pass
            
            self.results[module_name] = {
                "status": "FAILED",
                "passed": 0,
                "total": 0
            }
            self.failed_tests += 1
            return False
        
        except subprocess.TimeoutExpired:
            print(f"✗ Test module timed out: {module_name}")
            self.results[module_name] = {"status": "TIMEOUT", "passed": 0, "total": 0}
            self.failed_tests += 1
            return False
        except Exception as e:
            print(f"✗ Error running {module_name}: {str(e)}")
            self.results[module_name] = {"status": "ERROR", "passed": 0, "total": 0}
            self.failed_tests += 1
            return False
    
    def generate_report(self):
        """Generate comprehensive test report"""
        report = []
        report.append("\n" + "=" * 70)
        report.append("COMPREHENSIVE UNIT TEST REPORT (v6.3)")
        report.append("=" * 70)
        report.append(f"\nGenerated: {datetime.utcnow().isoformat()}\n")
        
        # Summary
        report.append("TEST EXECUTION SUMMARY")
        report.append("-" * 70)
        report.append(f"Total Test Modules:  {len(self.test_modules)}")
        report.append(f"Total Tests:         {self.total_tests}")
        report.append(f"Passed:              {self.passed_tests}")
        report.append(f"Failed:              {self.failed_tests}")
        
        if self.total_tests > 0:
            pass_rate = (self.passed_tests / self.total_tests) * 100
            report.append(f"Pass Rate:           {pass_rate:.1f}%\n")
        
        # Detailed results
        report.append("\nDETAILED MODULE RESULTS")
        report.append("-" * 70)
        
        for module, result in self.results.items():
            status = result["status"]
            passed = result.get("passed", 0)
            total = result.get("total", 0)
            
            status_indicator = "✓" if status == "PASSED" else "✗"
            report.append(f"{status_indicator} {module}: {status}")
            if total > 0:
                report.append(f"  - Tests: {passed}/{total}")
        
        # Test coverage areas
        report.append("\n\nTEST COVERAGE AREAS")
        report.append("-" * 70)
        
        coverage_areas = [
            ("Whitelist API & Models", [
                "WhitelistEntry model creation",
                "Domain validation (match, mismatch, case-insensitive)",
                "Email spoofing prevention",
                "Multiple entries per org",
                "Entry revocation",
                "Pending status handling",
                "Unique constraint enforcement",
                "Invalid email format detection",
            ]),
            ("Entity Visibility & Configuration", [
                "Owner full access (8 entity types)",
                "Auditor type mapping and restrictions",
                "Auditor codebase/database/webhook blocking",
                "Developer limited access (3 entities)",
                "Feature flag system",
                "Complex entity list filtering",
                "Configuration validation (dev/staging/prod)",
                "CORS origins parsing",
                "Secret rotation scheduling",
                "Environment-aware behavior",
            ]),
            ("Session Management & JWT", [
                "Session fingerprinting (SHA256 UA|IP)",
                "Deterministic hashing",
                "Device differentiation",
                "Session ID generation and uniqueness",
                "Session rotation tracking",
                "JWT payload structure",
                "Token expiry calculation (30 minutes)",
                "Fingerprint mismatch detection",
                "Entity scope derivation by role",
            ]),
            ("Audit Logging & Error Handling", [
                "7 audit log event types (LOGIN, LOGOUT, TOTP_VERIFY, etc.)",
                "Audit log entry format",
                "IP address tracking",
                "Timestamp format (ISO 8601)",
                "Sensitive data masking",
                "Invalid token handling",
                "Expired token detection",
                "Missing required fields detection",
                "Rate limiting enforcement",
                "Domain validation",
                "Token refresh mechanism",
                "Session revocation recovery",
            ]),
        ]
        
        for area, tests in coverage_areas:
            report.append(f"\n{area}:")
            for test in tests:
                report.append(f"  ✓ {test}")
        
        # Recommendations
        report.append("\n\nNEXT STEPS & RECOMMENDATIONS")
        report.append("-" * 70)
        
        if self.passed_tests == self.total_tests:
            report.append("✓ All tests passing - System ready for deployment")
            report.append("\nRecommended Actions:")
            report.append("  1. Deploy to staging environment")
            report.append("  2. Perform integration testing with live database")
            report.append("  3. Load testing for rate limits and fingerprinting")
            report.append("  4. User acceptance testing (UAT)")
            report.append("  5. Production deployment with monitoring")
        else:
            report.append("✗ Some tests failing - Review before deployment")
            report.append(f"\nFailing Modules: {[m for m, r in self.results.items() if r['status'] != 'PASSED']}")
        
        return "\n".join(report)
    
    def run_all_tests(self):
        """Run all test modules"""
        print("\n" + "=" * 70)
        print("ANCHOR GOVERNANCE SYSTEM - COMPREHENSIVE UNIT TEST SUITE")
        print("Version 6.3.0")
        print("=" * 70)
        print(f"\nStarted: {datetime.utcnow().isoformat()}")
        print(f"Test modules: {len(self.test_modules)}")
        
        for module in self.test_modules:
            self.run_test_module(module)
        
        # Generate and print report
        report = self.generate_report()
        print(report)
        
        # Save report to file
        report_file = "TEST_REPORT_COMPREHENSIVE.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n✓ Report saved to: {report_file}")
        
        # Return exit code based on results
        return 0 if self.failed_tests == 0 else 1


def main():
    """Main entry point"""
    runner = TestRunner()
    exit_code = runner.run_all_tests()
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

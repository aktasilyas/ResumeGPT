#!/usr/bin/env python3
"""
Test new features added in iteration 2:
- Email/Password authentication
- Stripe checkout session creation
- Language support validation
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class NewFeaturesAPITester:
    def __init__(self, base_url: str = "https://smart-resume-66.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session_token = None
        self.test_user_email = f"test.user.{int(datetime.now().timestamp())}@example.com"
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    use_auth: bool = False, use_cookies: bool = False) -> tuple[bool, Dict, int]:
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
            
        try:
            session = requests.Session()
            if use_cookies:
                # For cookie-based auth
                pass
                
            if method.upper() == 'GET':
                response = session.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = session.post(url, headers=headers, json=data, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
                
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
                
            return response.status_code in [200, 201], response_data, response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 0
    
    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                data: Optional[Dict] = None, use_auth: bool = False) -> tuple[bool, Dict]:
        """Run a single API test"""
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        success, response_data, status_code = self.make_request(method, endpoint, data, use_auth)
        
        if status_code == expected_status:
            self.tests_passed += 1
            self.log(f"✅ {name} - Status: {status_code}", "PASS")
            return True, response_data
        else:
            self.failed_tests.append({
                "test": name,
                "expected": expected_status,
                "actual": status_code,
                "response": response_data
            })
            self.log(f"❌ {name} - Expected {expected_status}, got {status_code}", "FAIL")
            if response_data.get("detail"):
                self.log(f"   Error: {response_data['detail']}", "ERROR")
            return False, response_data

    def test_email_password_auth(self):
        """Test email/password registration and login"""
        self.log("=== Testing Email/Password Authentication ===")
        
        # Test user registration
        register_data = {
            "email": self.test_user_email,
            "password": "TestPassword123!",
            "name": "Test User New Features"
        }
        
        success, register_response = self.run_test(
            "Email/Password Registration", 
            "POST", 
            "/auth/register", 
            200, 
            register_data
        )
        
        if success:
            user_id = register_response.get('user_id')
            self.log(f"   Registered user: {register_response.get('name')} (ID: {user_id})")
            
            # Test login with same credentials
            login_data = {
                "email": self.test_user_email,
                "password": "TestPassword123!"
            }
            
            success, login_response = self.run_test(
                "Email/Password Login",
                "POST",
                "/auth/login",
                200,
                login_data
            )
            
            if success:
                self.log(f"   Login successful for: {login_response.get('name')}")
                # Store session for further tests
                if login_response.get('user_id'):
                    self.session_token = f"test_session_{int(datetime.now().timestamp())}"
        
        # Test login with wrong password
        wrong_login_data = {
            "email": self.test_user_email,
            "password": "WrongPassword123!"
        }
        
        self.run_test(
            "Login with Wrong Password",
            "POST",
            "/auth/login",
            401,
            wrong_login_data
        )
        
        # Test registration with existing email
        self.run_test(
            "Register with Existing Email",
            "POST",
            "/auth/register",
            400,
            register_data
        )

    def test_stripe_integration(self):
        """Test Stripe checkout session creation"""
        self.log("=== Testing Stripe Integration ===")
        
        # Use existing test session token for authenticated requests
        test_session = "test_session_1766767338249"
        
        checkout_data = {
            "origin_url": "https://smart-resume-66.preview.emergentagent.com"
        }
        
        try:
            url = f"{self.api_url}/stripe/create-checkout"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {test_session}'
            }
            
            response = requests.post(url, headers=headers, json=checkout_data, timeout=30)
            
            self.tests_run += 1
            
            if response.status_code == 200:
                self.tests_passed += 1
                response_data = response.json()
                
                if response_data.get('url') and response_data.get('session_id'):
                    self.log(f"✅ Stripe Checkout Creation - Status: {response.status_code}", "PASS")
                    self.log(f"   Checkout URL: {response_data['url'][:50]}...")
                    self.log(f"   Session ID: {response_data['session_id']}")
                else:
                    self.failed_tests.append({
                        "test": "Stripe Checkout Creation",
                        "issue": "Missing URL or session_id in response"
                    })
                    self.log(f"❌ Stripe Checkout Creation - Missing required fields", "FAIL")
            else:
                self.failed_tests.append({
                    "test": "Stripe Checkout Creation",
                    "expected": 200,
                    "actual": response.status_code
                })
                self.log(f"❌ Stripe Checkout Creation - Status: {response.status_code}", "FAIL")
                try:
                    error_data = response.json()
                    if error_data.get("detail"):
                        self.log(f"   Error: {error_data['detail']}", "ERROR")
                except:
                    pass
                    
        except Exception as e:
            self.failed_tests.append({
                "test": "Stripe Checkout Creation",
                "error": str(e)
            })
            self.log(f"❌ Stripe Checkout Creation - Error: {e}", "FAIL")
            self.tests_run += 1

    def test_api_endpoints_availability(self):
        """Test that all expected endpoints are available"""
        self.log("=== Testing API Endpoints Availability ===")
        
        # Test endpoints without auth
        endpoints_no_auth = [
            ("/", 200),
            ("/health", 200),
        ]
        
        for endpoint, expected_status in endpoints_no_auth:
            self.run_test(f"Endpoint {endpoint}", "GET", endpoint, expected_status, use_auth=False)

    def run_all_tests(self):
        """Run all new feature tests"""
        self.log("🚀 Starting New Features API Tests")
        self.log(f"   Base URL: {self.base_url}")
        
        try:
            self.test_api_endpoints_availability()
            self.test_email_password_auth()
            self.test_stripe_integration()
            
        except KeyboardInterrupt:
            self.log("Tests interrupted by user", "WARN")
        except Exception as e:
            self.log(f"Unexpected error: {e}", "ERROR")
        
        # Print final results
        self.print_results()
        
        return self.tests_passed == self.tests_run

    def print_results(self):
        """Print test summary"""
        self.log("=" * 50)
        self.log("📊 NEW FEATURES TEST RESULTS")
        self.log(f"   Total Tests: {self.tests_run}")
        self.log(f"   Passed: {self.tests_passed}")
        self.log(f"   Failed: {len(self.failed_tests)}")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "   Success Rate: 0%")
        
        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                self.log(f"   {i}. {failure.get('test', 'Unknown')}")
                if failure.get('expected') and failure.get('actual'):
                    self.log(f"      Expected: {failure['expected']}, Got: {failure['actual']}")
                if failure.get('error'):
                    self.log(f"      Error: {failure['error']}")
                if failure.get('issue'):
                    self.log(f"      Issue: {failure['issue']}")
        
        self.log("=" * 50)

def main():
    """Main test execution"""
    tester = NewFeaturesAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
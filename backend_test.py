#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Smart Resume Builder
Tests all endpoints including auth, CRUD operations, AI features, and PDF generation
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class SmartResumeAPITester:
    def __init__(self, base_url: str = "https://smart-resume-66.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = "test_session_1766767338249"  # From MongoDB setup
        self.user_id = "test-user-1766767338249"
        self.test_cv_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    use_auth: bool = True) -> tuple[bool, Dict, int]:
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth:
            headers['Authorization'] = f'Bearer {self.session_token}'
            
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
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
                data: Optional[Dict] = None, use_auth: bool = True) -> tuple[bool, Dict]:
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

    def test_health_endpoints(self):
        """Test basic health and root endpoints"""
        self.log("=== Testing Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "/", 200, use_auth=False)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "/health", 200, use_auth=False)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("=== Testing Authentication ===")
        
        # Test /auth/me with valid session
        success, user_data = self.run_test("Get Current User", "GET", "/auth/me", 200)
        
        if success:
            self.log(f"   User: {user_data.get('name')} ({user_data.get('email')})")
            if user_data.get('user_id') != self.user_id:
                self.log(f"   WARNING: User ID mismatch. Expected {self.user_id}, got {user_data.get('user_id')}", "WARN")
        
        # Test /auth/me without session (should fail)
        self.run_test("Unauthorized Access", "GET", "/auth/me", 401, use_auth=False)

    def test_cv_crud_operations(self):
        """Test CV CRUD operations"""
        self.log("=== Testing CV CRUD Operations ===")
        
        # Test GET CVs (empty list initially)
        success, cvs_data = self.run_test("Get CVs List", "GET", "/cvs", 200)
        if success:
            self.log(f"   Found {len(cvs_data)} existing CVs")
        
        # Test CREATE CV
        cv_data = {"title": "Test Resume - Backend Testing"}
        success, created_cv = self.run_test("Create CV", "POST", "/cvs", 201, cv_data)
        
        if success and created_cv.get('cv_id'):
            self.test_cv_id = created_cv['cv_id']
            self.log(f"   Created CV with ID: {self.test_cv_id}")
            
            # Test GET specific CV
            success, cv_details = self.run_test("Get CV by ID", "GET", f"/cvs/{self.test_cv_id}", 200)
            
            if success:
                self.log(f"   CV Title: {cv_details.get('title')}")
                
                # Test UPDATE CV
                update_data = {
                    "title": "Updated Test Resume",
                    "data": {
                        "summary": "Test summary for backend testing",
                        "personal_info": {
                            "full_name": "Test User",
                            "email": "test@example.com",
                            "phone": "+1234567890"
                        }
                    }
                }
                
                success, updated_cv = self.run_test("Update CV", "PUT", f"/cvs/{self.test_cv_id}", 200, update_data)
                
                if success:
                    self.log(f"   Updated CV title: {updated_cv.get('title')}")
        
        # Test GET non-existent CV
        self.run_test("Get Non-existent CV", "GET", "/cvs/invalid-cv-id", 404)

    def test_ai_endpoints(self):
        """Test AI-powered features"""
        self.log("=== Testing AI Features ===")
        
        # Test CV Analysis
        analysis_data = {
            "cv_data": {
                "personal_info": {
                    "full_name": "John Doe",
                    "email": "john@example.com"
                },
                "summary": "Experienced software engineer with 5 years of experience",
                "experiences": [
                    {
                        "position": "Software Engineer",
                        "company": "Tech Corp",
                        "description": "Developed web applications"
                    }
                ],
                "education": [
                    {
                        "degree": "Bachelor's",
                        "field": "Computer Science",
                        "institution": "University"
                    }
                ],
                "skills": [
                    {"name": "Python"},
                    {"name": "JavaScript"}
                ]
            }
        }
        
        success, analysis_result = self.run_test("AI CV Analysis", "POST", "/ai/analyze", 200, analysis_data)
        
        if success:
            score = analysis_result.get('overall_score', 0)
            self.log(f"   AI Score: {score}/100")
            if analysis_result.get('strengths'):
                self.log(f"   Strengths: {len(analysis_result['strengths'])} found")
            if analysis_result.get('weaknesses'):
                self.log(f"   Weaknesses: {len(analysis_result['weaknesses'])} found")
        
        # Test AI Improve
        improve_data = {
            "section": "summary",
            "content": "I am a software engineer with experience"
        }
        
        success, improved_result = self.run_test("AI Improve Section", "POST", "/ai/improve", 200, improve_data)
        
        if success and improved_result.get('improved'):
            self.log(f"   Improved text length: {len(improved_result['improved'])} chars")
        
        # Test Job Optimization
        job_optimize_data = {
            "cv_data": analysis_data["cv_data"],
            "job_description": "Looking for a Python developer with React experience for web development"
        }
        
        success, optimize_result = self.run_test("AI Job Optimization", "POST", "/ai/optimize-for-job", 200, job_optimize_data)
        
        if success:
            match_percentage = optimize_result.get('match_percentage', 0)
            self.log(f"   Job Match: {match_percentage}%")
            if optimize_result.get('missing_keywords'):
                self.log(f"   Missing Keywords: {len(optimize_result['missing_keywords'])} found")
        
        # Test Skill Suggestions
        skill_data = {"job_title": "Full Stack Developer"}
        success, skills_result = self.run_test("AI Skill Suggestions", "POST", "/ai/suggest-skills", 200, skill_data)
        
        if success:
            tech_skills = skills_result.get('technical_skills', [])
            soft_skills = skills_result.get('soft_skills', [])
            self.log(f"   Suggested: {len(tech_skills)} technical, {len(soft_skills)} soft skills")

    def test_pdf_generation(self):
        """Test PDF generation"""
        self.log("=== Testing PDF Generation ===")
        
        if not self.test_cv_id:
            self.log("   Skipping PDF test - no CV created", "WARN")
            return
            
        try:
            url = f"{self.api_url}/generate-pdf/{self.test_cv_id}"
            headers = {'Authorization': f'Bearer {self.session_token}'}
            
            response = requests.post(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_length = len(response.content)
                
                if 'application/pdf' in content_type and content_length > 1000:
                    self.tests_passed += 1
                    self.log(f"✅ PDF Generation - Size: {content_length} bytes", "PASS")
                else:
                    self.failed_tests.append({
                        "test": "PDF Generation",
                        "issue": f"Invalid PDF response. Content-Type: {content_type}, Size: {content_length}"
                    })
                    self.log(f"❌ PDF Generation - Invalid response", "FAIL")
            else:
                self.failed_tests.append({
                    "test": "PDF Generation",
                    "expected": 200,
                    "actual": response.status_code
                })
                self.log(f"❌ PDF Generation - Status: {response.status_code}", "FAIL")
                
            self.tests_run += 1
            
        except Exception as e:
            self.failed_tests.append({
                "test": "PDF Generation",
                "error": str(e)
            })
            self.log(f"❌ PDF Generation - Error: {e}", "FAIL")
            self.tests_run += 1

    def cleanup_test_data(self):
        """Clean up test CV"""
        if self.test_cv_id:
            self.log("=== Cleaning Up Test Data ===")
            success, _ = self.run_test("Delete Test CV", "DELETE", f"/cvs/{self.test_cv_id}", 200)
            if success:
                self.log("   Test CV deleted successfully")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        self.log("🚀 Starting Smart Resume Builder API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log(f"   Session Token: {self.session_token[:20]}...")
        
        try:
            # Run all test suites
            self.test_health_endpoints()
            self.test_auth_endpoints()
            self.test_cv_crud_operations()
            self.test_ai_endpoints()
            self.test_pdf_generation()
            
            # Cleanup
            self.cleanup_test_data()
            
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
        self.log("📊 TEST RESULTS SUMMARY")
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
    tester = SmartResumeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
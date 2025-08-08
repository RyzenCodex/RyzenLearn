#!/usr/bin/env python3
"""
Backend API Test Suite for Psychology Learning App
Tests all FastAPI endpoints via Kubernetes ingress routing
"""

import requests
import json
import uuid
import sys
from typing import Dict, Any, List

# Backend URL from environment
BACKEND_URL = "https://84ebafe7-965b-4964-8171-1d4f58f7c4d0.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.client_id = str(uuid.uuid4())
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
        if not success:
            self.failed_tests.append(test_name)
    
    def make_request(self, method: str, endpoint: str, data: Dict = None) -> tuple:
        """Make HTTP request and return (success, response, error)"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=10)
            else:
                return False, None, f"Unsupported method: {method}"
            
            return True, response, None
        except Exception as e:
            return False, None, str(e)
    
    def test_health_endpoint(self):
        """Test 1: Health root endpoint"""
        success, response, error = self.make_request("GET", "/")
        
        if not success:
            self.log_test("Health Endpoint", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Health Endpoint", False, f"Status {response.status_code}: {response.text}")
            return
        
        try:
            data = response.json()
            if data.get("message") == "Hello World":
                self.log_test("Health Endpoint", True, "Correct response received")
            else:
                self.log_test("Health Endpoint", False, f"Unexpected response: {data}")
        except Exception as e:
            self.log_test("Health Endpoint", False, f"JSON parse error: {e}")
    
    def test_branches_list(self):
        """Test 2: List all branches"""
        success, response, error = self.make_request("GET", "/branches")
        
        if not success:
            self.log_test("Branches List", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Branches List", False, f"Status {response.status_code}: {response.text}")
            return
        
        try:
            branches = response.json()
            
            # Check if array with >= 6 items
            if not isinstance(branches, list) or len(branches) < 6:
                self.log_test("Branches List", False, f"Expected array with >=6 items, got {len(branches) if isinstance(branches, list) else 'non-array'}")
                return
            
            # Check required fields in first branch
            required_fields = ["slug", "name", "level", "heroImage", "keyIdeas", "psychologists", "mnemonics", "resources", "activities", "quiz", "schedule"]
            first_branch = branches[0]
            missing_fields = [field for field in required_fields if field not in first_branch]
            
            if missing_fields:
                self.log_test("Branches List", False, f"Missing fields: {missing_fields}")
                return
            
            # Check for expected slugs
            slugs = [b.get("slug") for b in branches]
            expected_slugs = ["cognitive", "developmental", "social", "clinical", "biological", "methods"]
            missing_slugs = [slug for slug in expected_slugs if slug not in slugs]
            
            if missing_slugs:
                self.log_test("Branches List", False, f"Missing expected slugs: {missing_slugs}")
                return
            
            self.log_test("Branches List", True, f"Found {len(branches)} branches with all required fields and slugs")
            
        except Exception as e:
            self.log_test("Branches List", False, f"JSON parse error: {e}")
    
    def test_single_branch(self):
        """Test 3: Get single branch"""
        success, response, error = self.make_request("GET", "/branches/cognitive")
        
        if not success:
            self.log_test("Single Branch", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Single Branch", False, f"Status {response.status_code}: {response.text}")
            return
        
        try:
            branch = response.json()
            
            # Check required fields
            required_fields = ["slug", "name", "level", "heroImage", "keyIdeas", "psychologists", "mnemonics", "resources", "activities", "quiz", "schedule"]
            missing_fields = [field for field in required_fields if field not in branch]
            
            if missing_fields:
                self.log_test("Single Branch", False, f"Missing fields: {missing_fields}")
                return
            
            if branch.get("slug") != "cognitive":
                self.log_test("Single Branch", False, f"Expected slug 'cognitive', got '{branch.get('slug')}'")
                return
            
            self.log_test("Single Branch", True, "Cognitive branch retrieved with all required fields")
            
        except Exception as e:
            self.log_test("Single Branch", False, f"JSON parse error: {e}")
    
    def test_client_state_bootstrap(self):
        """Test 4: Client state bootstrap"""
        success, response, error = self.make_request("GET", f"/state/{self.client_id}")
        
        if not success:
            self.log_test("Client State Bootstrap", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Client State Bootstrap", False, f"Status {response.status_code}: {response.text}")
            return
        
        try:
            state = response.json()
            
            # Check default structure
            expected_fields = ["client_id", "bookmarks", "tasks", "quiz", "notes"]
            missing_fields = [field for field in expected_fields if field not in state]
            
            if missing_fields:
                self.log_test("Client State Bootstrap", False, f"Missing fields: {missing_fields}")
                return
            
            if state.get("client_id") != self.client_id:
                self.log_test("Client State Bootstrap", False, f"Client ID mismatch")
                return
            
            # Check empty defaults
            if state.get("bookmarks") != {} or state.get("tasks") != {} or state.get("quiz") != {}:
                self.log_test("Client State Bootstrap", False, "Expected empty bookmarks/tasks/quiz")
                return
            
            if not isinstance(state.get("notes"), str):
                self.log_test("Client State Bootstrap", False, "Notes should be string")
                return
            
            self.log_test("Client State Bootstrap", True, "Default client state created correctly")
            
        except Exception as e:
            self.log_test("Client State Bootstrap", False, f"JSON parse error: {e}")
    
    def test_tasks_flow(self):
        """Test 5: Tasks flow - get default and set custom"""
        # First get default tasks (should fall back to branch schedule)
        success, response, error = self.make_request("GET", f"/state/{self.client_id}/tasks/cognitive")
        
        if not success:
            self.log_test("Tasks Flow - Get Default", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Tasks Flow - Get Default", False, f"Status {response.status_code}: {response.text}")
            return
        
        try:
            tasks = response.json()
            
            if not isinstance(tasks, list) or len(tasks) == 0:
                self.log_test("Tasks Flow - Get Default", False, "Expected non-empty task list")
                return
            
            # Check task structure
            first_task = tasks[0]
            if "text" not in first_task or "done" not in first_task:
                self.log_test("Tasks Flow - Get Default", False, "Task missing required fields")
                return
            
            self.log_test("Tasks Flow - Get Default", True, f"Retrieved {len(tasks)} default tasks")
            
        except Exception as e:
            self.log_test("Tasks Flow - Get Default", False, f"JSON parse error: {e}")
            return
        
        # Now set custom tasks
        custom_tasks = [
            {"text": "Study memory models", "done": False},
            {"text": "Practice cognitive exercises", "done": True}
        ]
        
        success, response, error = self.make_request("PUT", f"/state/{self.client_id}/tasks/cognitive", 
                                                   {"tasks": custom_tasks})
        
        if not success:
            self.log_test("Tasks Flow - Set Custom", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Tasks Flow - Set Custom", False, f"Status {response.status_code}: {response.text}")
            return
        
        # Verify persistence by reading back
        success, response, error = self.make_request("GET", f"/state/{self.client_id}/tasks/cognitive")
        
        if not success:
            self.log_test("Tasks Flow - Verify Persistence", False, f"Request failed: {error}")
            return
        
        try:
            retrieved_tasks = response.json()
            
            if len(retrieved_tasks) != 2:
                self.log_test("Tasks Flow - Verify Persistence", False, f"Expected 2 tasks, got {len(retrieved_tasks)}")
                return
            
            if retrieved_tasks[0]["text"] != "Study memory models" or retrieved_tasks[1]["done"] != True:
                self.log_test("Tasks Flow - Verify Persistence", False, "Task data not persisted correctly")
                return
            
            self.log_test("Tasks Flow - Set Custom", True, "Custom tasks set and persisted correctly")
            
        except Exception as e:
            self.log_test("Tasks Flow - Verify Persistence", False, f"JSON parse error: {e}")
    
    def test_bookmarks_flow(self):
        """Test 6: Bookmarks flow"""
        # Set bookmark
        success, response, error = self.make_request("PUT", f"/state/{self.client_id}/bookmarks/cognitive", 
                                                   {"bookmarked": True})
        
        if not success:
            self.log_test("Bookmarks Flow - Set", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Bookmarks Flow - Set", False, f"Status {response.status_code}: {response.text}")
            return
        
        # Verify by getting full state
        success, response, error = self.make_request("GET", f"/state/{self.client_id}")
        
        if not success:
            self.log_test("Bookmarks Flow - Verify", False, f"Request failed: {error}")
            return
        
        try:
            state = response.json()
            
            if state.get("bookmarks", {}).get("cognitive") != True:
                self.log_test("Bookmarks Flow", False, "Bookmark not set correctly")
                return
            
            self.log_test("Bookmarks Flow", True, "Bookmark set and verified in state")
            
        except Exception as e:
            self.log_test("Bookmarks Flow", False, f"JSON parse error: {e}")
    
    def test_quiz_progress(self):
        """Test 7: Quiz progress"""
        # Set quiz best score
        success, response, error = self.make_request("PUT", f"/state/{self.client_id}/quiz/cognitive", 
                                                   {"best": 80})
        
        if not success:
            self.log_test("Quiz Progress - Set", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Quiz Progress - Set", False, f"Status {response.status_code}: {response.text}")
            return
        
        # Get quiz progress
        success, response, error = self.make_request("GET", f"/state/{self.client_id}/quiz")
        
        if not success:
            self.log_test("Quiz Progress - Get", False, f"Request failed: {error}")
            return
        
        try:
            quiz_data = response.json()
            
            if quiz_data.get("cognitive", {}).get("best") != 80:
                self.log_test("Quiz Progress", False, f"Expected best score 80, got {quiz_data}")
                return
            
            self.log_test("Quiz Progress", True, "Quiz best score set and retrieved correctly")
            
        except Exception as e:
            self.log_test("Quiz Progress", False, f"JSON parse error: {e}")
    
    def test_notes_flow(self):
        """Test 8: Notes flow"""
        # Set notes
        success, response, error = self.make_request("PUT", f"/state/{self.client_id}/notes", 
                                                   {"notes": "hello"})
        
        if not success:
            self.log_test("Notes Flow - Set", False, f"Request failed: {error}")
            return
        
        if response.status_code != 200:
            self.log_test("Notes Flow - Set", False, f"Status {response.status_code}: {response.text}")
            return
        
        # Get notes
        success, response, error = self.make_request("GET", f"/state/{self.client_id}/notes")
        
        if not success:
            self.log_test("Notes Flow - Get", False, f"Request failed: {error}")
            return
        
        try:
            notes_data = response.json()
            
            if notes_data.get("notes") != "hello":
                self.log_test("Notes Flow", False, f"Expected notes 'hello', got {notes_data}")
                return
            
            self.log_test("Notes Flow", True, "Notes set and retrieved correctly")
            
        except Exception as e:
            self.log_test("Notes Flow", False, f"JSON parse error: {e}")
    
    def test_error_handling(self):
        """Test 9: Error handling"""
        # Test unknown branch
        success, response, error = self.make_request("GET", "/branches/unknown")
        
        if not success:
            self.log_test("Error Handling - Unknown Branch", False, f"Request failed: {error}")
            return
        
        if response.status_code != 404:
            self.log_test("Error Handling - Unknown Branch", False, f"Expected 404, got {response.status_code}")
            return
        
        # Test unknown branch in tasks
        success, response, error = self.make_request("GET", f"/state/{self.client_id}/tasks/unknown")
        
        if not success:
            self.log_test("Error Handling - Unknown Tasks Branch", False, f"Request failed: {error}")
            return
        
        if response.status_code != 404:
            self.log_test("Error Handling - Unknown Tasks Branch", False, f"Expected 404, got {response.status_code}")
            return
        
        # Test unknown branch in bookmarks
        success, response, error = self.make_request("PUT", f"/state/{self.client_id}/bookmarks/unknown", 
                                                   {"bookmarked": True})
        
        if not success:
            self.log_test("Error Handling - Unknown Bookmarks Branch", False, f"Request failed: {error}")
            return
        
        if response.status_code != 404:
            self.log_test("Error Handling - Unknown Bookmarks Branch", False, f"Expected 404, got {response.status_code}")
            return
        
        self.log_test("Error Handling", True, "All error cases return proper 404 responses")
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"🧪 Starting Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Test Client ID: {self.client_id}")
        print("=" * 60)
        
        # Run all tests
        self.test_health_endpoint()
        self.test_branches_list()
        self.test_single_branch()
        self.test_client_state_bootstrap()
        self.test_tasks_flow()
        self.test_bookmarks_flow()
        self.test_quiz_progress()
        self.test_notes_flow()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test}")
        else:
            print(f"\n🎉 All tests passed!")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
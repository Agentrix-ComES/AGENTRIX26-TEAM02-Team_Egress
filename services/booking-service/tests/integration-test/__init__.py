"""
Booking Service Integration Tests

Comprehensive integration test suite for the Booking Service API.
Tests cover CRUD operations, validation, user isolation, and multi-booking scenarios.

Test Files:
-----------
1. conftest.py
   - Database setup with SQLite + type compatibility layer
   - Test client fixtures
   - Mock data generators

2. test_hotel_bookings_crud.py (17 tests)
   - Hotel booking CRUD operations
   - Status transitions
   - User isolation

3. test_transport_bookings_crud.py (16 tests)
   - Transport booking CRUD operations
   - Multiple transport modes
   - User isolation

4. test_dining_reservations_crud.py (16 tests)
   - Dining reservation CRUD operations
   - Party size validation
   - User isolation

5. test_hotel_search.py (11 tests)
   - Hotel search functionality
   - Deterministic seeding by region
   - Date range validation
   - Search result consistency

6. test_validation_and_errors.py (26 tests)
   - Input validation across all booking types
   - Error handling edge cases
   - Concurrency scenarios
   - Unicode and boundary conditions

7. test_cross_service_integration.py (16 tests)
   - Multi-booking workflows
   - Status progression
   - Listing and filtering
   - Booking reference generation

Total: 98 comprehensive integration tests
"""

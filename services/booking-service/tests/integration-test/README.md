# Booking Service Integration Tests

Comprehensive integration test suite for the Booking Service API. Tests all CRUD operations, validation, user isolation, and complex booking scenarios.

## Test Coverage

### Test Files (98 total tests)

1. **conftest.py** — Fixtures and setup
   - SQLite in-memory database with PostgreSQL type compatibility
   - Async HTTP client for API testing
   - Mock data generators for all booking types

2. **test_hotel_bookings_crud.py** (17 tests)
   - Create/Read/Update/Delete hotel bookings
   - Status transitions and filtering
   - User isolation enforcement

3. **test_transport_bookings_crud.py** (16 tests)
   - Transport booking operations
   - Multiple transport modes (flight, train, bus, car, tuk-tuk, ferry)
   - Status management and user isolation

4. **test_dining_reservations_crud.py** (16 tests)
   - Dining reservation operations
   - Party size validation
   - Status transitions and cancellation

5. **test_hotel_search.py** (11 tests)
   - Hotel search by region and dates
   - Deterministic results (region-based seeding)
   - Pricing and rating validation

6. **test_validation_and_errors.py** (26 tests)
   - Input validation across all booking types
   - Invalid formats, negative values, edge cases
   - Concurrency and unicode support
   - Malformed requests

7. **test_cross_service_integration.py** (16 tests)
   - Multi-booking workflows
   - Status progression chains
   - Listing with filters
   - Booking reference uniqueness

## Running the Tests

### Prerequisites

```bash
# Install dependencies
pip install -r requirements.txt

# Or for development
pip install pytest pytest-asyncio httpx sqlalchemy aiosqlite
```

### Run All Tests

```bash
# From booking-service directory
pytest tests/integration-test -v

# With detailed output
pytest tests/integration-test -vv

# With coverage report
pytest tests/integration-test --cov=app --cov-report=html
```

### Run Specific Test File

```bash
# Hotel booking tests only
pytest tests/integration-test/test_hotel_bookings_crud.py -v

# Transport booking tests only
pytest tests/integration-test/test_transport_bookings_crud.py -v

# Validation tests only
pytest tests/integration-test/test_validation_and_errors.py -v
```

### Run Specific Test Case

```bash
# Single test
pytest tests/integration-test/test_hotel_bookings_crud.py::test_create_hotel_booking_success -v

# All tests matching pattern
pytest tests/integration-test -k "hotel" -v

# All user isolation tests
pytest tests/integration-test -k "isolation" -v
```

### Run with Options

```bash
# Stop on first failure
pytest tests/integration-test -x

# Show print statements
pytest tests/integration-test -s

# Run last failed tests
pytest tests/integration-test --lf

# Run only failed tests
pytest tests/integration-test --ff

# Run N tests at a time (parallel)
pytest tests/integration-test -n 4
```

## Database Setup

The tests use **SQLite in-memory database** for fast, isolated testing:

- Fresh database created per test
- PostgreSQL types (UUID, JSONB) converted to SQLite-compatible types
- Automatic cleanup after each test
- No external database required

### Key Features

- **Type Compatibility Layer**: `SQLiteUUID` TypeDecorator for UUID serialization
- **JSONB Conversion**: PostgreSQL JSONB → SQLite JSON
- **Async Session**: AsyncSession with auto-cleanup
- **Test Isolation**: Each test gets fresh database

## API Endpoints Tested

### Hotels
- `POST /api/v1/hotels/search` — Search hotels
- `POST /api/v1/hotel-bookings` — Create booking
- `GET /api/v1/hotel-bookings` — List bookings
- `GET /api/v1/hotel-bookings/{id}` — Get booking
- `PATCH /api/v1/hotel-bookings/{id}` — Update booking
- `DELETE /api/v1/hotel-bookings/{id}` — Cancel booking

### Transport
- `POST /api/v1/transport-bookings` — Create booking
- `GET /api/v1/transport-bookings` — List bookings
- `GET /api/v1/transport-bookings/{id}` — Get booking
- `PATCH /api/v1/transport-bookings/{id}` — Update booking
- `DELETE /api/v1/transport-bookings/{id}` — Delete booking

### Dining
- `POST /api/v1/dining-reservations` — Create reservation
- `GET /api/v1/dining-reservations` — List reservations
- `GET /api/v1/dining-reservations/{id}` — Get reservation
- `PATCH /api/v1/dining-reservations/{id}` — Update reservation
- `DELETE /api/v1/dining-reservations/{id}` — Cancel reservation

## Test Data

### Mock Fixtures (in conftest.py)

```python
mock_user_id              # UUID for authenticated user
mock_trip_id              # Trip ID from Trip Service
mock_region_node_id       # Timeline region node ID
mock_transport_payload    # Complete transport booking data
mock_hotel_payload        # Complete hotel booking data
mock_dining_payload       # Complete dining reservation data
mock_hotel_search_payload # Hotel search query data
```

## Expected Test Results

On successful run:

```
collected 98 items

test_hotel_bookings_crud.py::test_create_hotel_booking_success PASSED       [1%]
test_hotel_bookings_crud.py::test_get_hotel_booking_success PASSED          [2%]
...
================================ 98 passed in 12.34s ================================
```

## Troubleshooting

### SQLAlchemy Import Errors

```bash
# Ensure async imports are correct
python -c "from sqlalchemy.ext.asyncio import create_async_engine"
```

### AsyncClient Issues

```bash
# If ASGITransport not found, update httpx
pip install --upgrade httpx
```

### Type Errors

If seeing UUID or JSONB type errors:
- Verify conftest.py is loaded (pytest finds it)
- Check `_convert_uuid_and_jsonb_for_sqlite()` function
- Ensure SQLiteUUID TypeDecorator is applied

### Port/Connection Issues

Tests use in-memory SQLite, so no port binding. If seeing connection errors:
- Clear pytest cache: `pytest --cache-clear`
- Verify database override is applied in fixture

## Performance Notes

- **Single test**: ~0.1-0.2 seconds
- **Full suite**: ~12-15 seconds
- **In-memory database**: Much faster than file-based
- **Async operations**: Tested with pytest-asyncio

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Run Integration Tests
  run: |
    cd services/booking-service
    pytest tests/integration-test -v --cov=app
```

## Future Enhancements

- [ ] Load testing with concurrent bookings
- [ ] Performance benchmarks
- [ ] Integration with real PostgreSQL for staging tests
- [ ] GraphQL query tests (if implemented)
- [ ] Webhook/notification tests

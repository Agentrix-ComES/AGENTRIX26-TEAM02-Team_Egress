"""Pytest configuration: ensure the service package is importable."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault("AUTH_DISABLED", "true")

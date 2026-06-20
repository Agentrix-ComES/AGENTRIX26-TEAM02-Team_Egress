"""Providers package: thin clients for external data sources.

Only domain services may import these modules. Each provider wraps one external
API (Open-Meteo, OSM Overpass, OpenRouteService, ...) behind a small,
cache-aware function surface.
"""

"""End-to-end pipeline entry points.

Each module here is a runnable script that wires the per-layer modules
(intake -> ttm -> physics -> guardian -> instruct) into a single demo
flow. Unit tests cover the per-layer modules; integration tests in
app/backend/tests/test_*_integration.py cover the wiring.
"""

"""Ovarian disease diagnosis backend package."""

try:
    from .api import create_app
except BaseException:  # pragma: no cover - allow training scripts to import modules without FastAPI startup issues
    create_app = None

__all__ = ["create_app"]

from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = APP_DIR.parent
WORKSPACE_ROOT = BACKEND_ROOT.parent
DATA_ROOT = WORKSPACE_ROOT / "data"
MODELS_DIR = WORKSPACE_ROOT / "artifacts"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

KERAS_MODELS_DIR = BACKEND_ROOT / "models"
KERAS_MODELS_DIR.mkdir(parents=True, exist_ok=True)

KERAS_MODEL_FILES = {
    "cysts": "trained_ovarian_cyst_model.keras",
    "pcos": "trained_pcos_model.keras",
}

TASK_CONFIG = {
    "cysts": {
        "name": "Ovarian Cysts",
        "root": DATA_ROOT / "Ovarian_cysts",
        "classes": ["complex_cyst", "dominant_follicle", "healthy", "poly_cyst", "simple_cyst"],
    },
    "pcos": {
        "name": "PCOS",
        "root": DATA_ROOT / "PCOS",
        "classes": ["normal", "pcos"],
    },
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}

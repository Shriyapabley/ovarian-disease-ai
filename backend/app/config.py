from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = BASE_DIR.parent
DATA_ROOT = WORKSPACE_ROOT / "data"
MODELS_DIR = BASE_DIR / "artifacts"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

KERAS_MODELS_DIR = BASE_DIR / "models"
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

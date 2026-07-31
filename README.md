# AURA Ovarian Disease Diagnosis Decision Support System

This workspace contains a full-stack proof-of-concept for ovarian disease classification using PyTorch deep learning models and a React frontend.

## Project Structure

- `backend/`: FastAPI backend for model training, inference, and dataset metadata.
  - `main.py`: FastAPI app entry point.
  - `app/api.py`: API routes for status, datasets, model info, training, and diagnosis.
  - `app/config.py`: dataset and artifact path configuration.
  - `app/data_pipeline.py`: dataset loading, transforms, and sample counting.
  - `app/models.py`: PyTorch model definitions and hybrid wrapper.
  - `app/trainer.py`: training loops, evaluation, and status tracking.
- `frontend/`: Vite + React UI using Tailwind CSS.
  - `src/App.jsx`: app shell and navigation.
  - `src/components/`: landing page, data/training hub, diagnostic workstation.

## Setup

### Backend

1. Create a Python environment and activate it.
2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Run the backend API:
   ```bash
   python main.py
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the frontend server:
   ```bash
   npm run dev
   ```

## Notes

- The frontend proxies `/api` requests to `http://127.0.0.1:8000`.
- The backend stores model checkpoints under `artifacts/` and expects the dataset under `data/`.
- Training status is persisted in `artifacts/training_status.json`.

## Usage

- Navigate to the frontend URL shown by Vite.
- Use the Dataset tab to train a model and view dataset counts.
- Use the Diagnostic tab to upload an ultrasound scan and get predictions.

## Disclaimer

This is a research/demo tool only. It is not approved for clinical use. Always validate results with qualified medical professionals.

import json
import time
import pickle
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from pathlib import Path
from typing import Dict, Any
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.svm import SVC
from xgboost import XGBClassifier

from .config import MODELS_DIR
from .data_pipeline import build_splits, get_task_metadata
from .models import get_model, EfficientNetFeatureExtractor

STATUS_FILE = MODELS_DIR / "training_status.json"

def update_status(status_dict: Dict[str, Any]):
    try:
        with open(STATUS_FILE, "w") as f:
            json.dump(status_dict, f, indent=4)
    except Exception as e:
        print(f"Error writing training status: {e}")

def get_status() -> Dict[str, Any]:
    if not STATUS_FILE.exists():
        return {"status": "idle"}
    try:
        with open(STATUS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {"status": "idle"}


def train_epoch(model: nn.Module, dataloader: torch.utils.data.DataLoader, 
                criterion: nn.Module, optimizer: optim.Optimizer, 
                device: torch.device, limit_batches: int = -1) -> float:
    model.train()
    running_loss = 0.0
    processed_batches = 0
    
    for inputs, labels in dataloader:
        inputs = inputs.to(device)
        labels = labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * inputs.size(0)
        processed_batches += 1
        if limit_batches > 0 and processed_batches >= limit_batches:
            break
            
    epoch_loss = running_loss / (processed_batches * dataloader.batch_size if limit_batches > 0 else len(dataloader.dataset))
    return epoch_loss


def evaluate_model(model: nn.Module, dataloader: torch.utils.data.DataLoader, 
                   criterion: nn.Module, device: torch.device, 
                   limit_batches: int = -1) -> tuple:
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    processed_batches = 0
    
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
            processed_batches += 1
            if limit_batches > 0 and processed_batches >= limit_batches:
                break
                
    epoch_loss = running_loss / (processed_batches * dataloader.batch_size if limit_batches > 0 else len(dataloader.dataset))
    
    # Calculate metrics
    y_true = np.array(all_labels)
    y_pred = np.array(all_preds)
    
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
    
    metrics = {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1)
    }
    
    return epoch_loss, metrics


def run_pytorch_training(task: str, model_name: str, epochs: int = 5, fast_mode: bool = False):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting PyTorch training for {task} using {model_name} on {device}")
    
    status = {
        "status": "running",
        "task": task,
        "model_name": model_name,
        "current_epoch": 0,
        "total_epochs": epochs,
        "train_loss": 0.0,
        "val_loss": 0.0,
        "metrics": {"accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1": 0.0},
        "error": None
    }
    update_status(status)
    
    try:
        # Build datasets
        loaders = build_splits(task=task, batch_size=8 if fast_mode else 32)
        train_loader = loaders["train"]
        val_loader = loaders["val"]
        test_loader = loaders["test"]
        
        metadata = get_task_metadata(task)
        num_classes = len(metadata["classes"])
        
        # Load model
        model = get_model(model_name, num_classes)
        model = model.to(device)
        
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=1e-4)
        
        best_val_loss = float('inf')
        limit_batches = 2 if fast_mode else -1
        
        for epoch in range(1, epochs + 1):
            train_loss = train_epoch(model, train_loader, criterion, optimizer, device, limit_batches=limit_batches)
            val_loss, val_metrics = evaluate_model(model, val_loader, criterion, device, limit_batches=limit_batches)
            
            status["current_epoch"] = epoch
            status["train_loss"] = float(train_loss)
            status["val_loss"] = float(val_loss)
            status["metrics"] = val_metrics
            update_status(status)
            
            print(f"Epoch {epoch}/{epochs} - Train Loss: {train_loss:.4f} - Val Loss: {val_loss:.4f} - Val Acc: {val_metrics['accuracy']:.4f}")
            
            # Save best model
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                model_path = MODELS_DIR / f"{task}_{model_name}.pth"
                torch.save(model.state_dict(), model_path)
                
        # Evaluate on test set
        test_loss, test_metrics = evaluate_model(model, test_loader, criterion, device, limit_batches=limit_batches)
        print(f"Test Evaluation - Loss: {test_loss:.4f} - Accuracy: {test_metrics['accuracy']:.4f}")
        
        status["status"] = "completed"
        status["metrics"] = test_metrics
        update_status(status)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Training failed: {e}\n{error_trace}")
        status["status"] = "failed"
        status["error"] = str(e)
        update_status(status)


def extract_features_dataset(feature_extractor: nn.Module, dataloader: torch.utils.data.DataLoader, 
                             device: torch.device, limit_samples: int = -1) -> tuple:
    feature_extractor.eval()
    all_features = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            features = feature_extractor(inputs)
            all_features.append(features.cpu().numpy())
            all_labels.append(labels.numpy())
            
            if limit_samples > 0 and len(all_features) * dataloader.batch_size >= limit_samples:
                break
                
    X = np.concatenate(all_features, axis=0)
    y = np.concatenate(all_labels, axis=0)
    
    if limit_samples > 0:
        X = X[:limit_samples]
        y = y[:limit_samples]
        
    return X, y


def run_hybrid_training(task: str, model_name: str, fast_mode: bool = False):
    """
    Trains a hybrid model: extracts features with frozen EfficientNetV2-B0
    and fits an SVM or XGBoost classifier.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting hybrid training for {task} using {model_name} on {device}")
    
    status = {
        "status": "running",
        "task": task,
        "model_name": model_name,
        "current_epoch": 1,
        "total_epochs": 1,
        "train_loss": 0.0,
        "val_loss": 0.0,
        "metrics": {"accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1": 0.0},
        "error": None
    }
    update_status(status)
    
    try:
        loaders = build_splits(task=task, batch_size=8 if fast_mode else 32)
        
        feature_extractor = EfficientNetFeatureExtractor().to(device)
        
        limit_samples = 16 if fast_mode else -1
        
        # Extract features
        print("Extracting features for training set...")
        X_train, y_train = extract_features_dataset(feature_extractor, loaders["train"], device, limit_samples)
        
        print("Extracting features for validation set...")
        X_val, y_val = extract_features_dataset(feature_extractor, loaders["val"], device, limit_samples)
        
        print("Extracting features for test set...")
        X_test, y_test = extract_features_dataset(feature_extractor, loaders["test"], device, limit_samples)
        
        # Define downstream classifier
        if "svm" in model_name:
            classifier = SVC(probability=True, kernel='rbf', C=1.0)
        elif "xgboost" in model_name:
            classifier = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        else:
            raise ValueError(f"Unknown hybrid model suffix: {model_name}")
            
        print(f"Fitting downstream {model_name} classifier on extracted features...")
        classifier.fit(X_train, y_train)
        
        # Evaluate on validation
        val_preds = classifier.predict(X_val)
        val_acc = accuracy_score(y_val, val_preds)
        val_prec, val_rec, val_f1, _ = precision_recall_fscore_support(y_val, val_preds, average='weighted', zero_division=0)
        
        print(f"Validation Accuracy: {val_acc:.4f}")
        
        # Evaluate on test set
        test_preds = classifier.predict(X_test)
        test_acc = accuracy_score(y_test, test_preds)
        test_prec, test_rec, test_f1, _ = precision_recall_fscore_support(y_test, test_preds, average='weighted', zero_division=0)
        
        test_metrics = {
            "accuracy": float(test_acc),
            "precision": float(test_prec),
            "recall": float(test_rec),
            "f1": float(test_f1)
        }
        
        # Save model using pickle
        model_path = MODELS_DIR / f"{task}_{model_name}.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(classifier, f)
            
        status["status"] = "completed"
        status["metrics"] = test_metrics
        status["train_loss"] = 0.0
        status["val_loss"] = 0.0
        status["current_epoch"] = 1
        update_status(status)
        print(f"Hybrid training completed. Saved model to {model_path}")
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Hybrid training failed: {e}\n{error_trace}")
        status["status"] = "failed"
        status["error"] = str(e)
        update_status(status)

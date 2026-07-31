import torch
import torch.nn as nn
import torchvision.models as models
import numpy as np

class BaseCNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 112x112
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 56x56
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 28x28
            
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((7, 7))  # 7x7
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 7 * 7, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.classifier(x)
        return x


class EfficientNetFeatureExtractor(nn.Module):
    def __init__(self):
        super().__init__()
        try:
            from torchvision.models import EfficientNet_B0_Weights
            model = models.efficientnet_b0(weights=None)
        except (ImportError, AttributeError):
            model = models.efficientnet_b0(pretrained=False)
        
        self.features = model.features
        self.avgpool = model.avgpool
        
        # Freeze parameters
        for param in self.parameters():
            param.requires_grad = False
            
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return x


def get_model(model_name: str, num_classes: int) -> nn.Module:
    """
    Factory function to retrieve PyTorch model architectures.
    """
    if model_name == "base_cnn":
        return BaseCNN(num_classes)
        
    elif model_name == "resnet50":
        try:
            model = models.resnet50(weights=None)
        except (ImportError, AttributeError):
            model = models.resnet50(pretrained=False)
        model.fc = nn.Linear(model.fc.in_features, num_classes)
        return model
        
    elif model_name == "densenet121":
        try:
            model = models.densenet121(weights=None)
        except (ImportError, AttributeError):
            model = models.densenet121(pretrained=False)
        model.classifier = nn.Linear(model.classifier.in_features, num_classes)
        return model
        
    elif model_name == "efficientnet_b0":
        try:
            model = models.efficientnet_b0(weights=None)
        except (ImportError, AttributeError):
            model = models.efficientnet_b0(pretrained=False)
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
        return model
        
    else:
        raise ValueError(f"Unknown model name: {model_name}")


class HybridModelWrapper:
    """
    Combines PyTorch FeatureExtractor with a scikit-learn or XGBoost classifier
    to offer a uniform predict/predict_proba interface.
    """
    def __init__(self, feature_extractor: nn.Module, sklearn_model, device: torch.device):
        self.feature_extractor = feature_extractor.to(device)
        self.sklearn_model = sklearn_model
        self.device = device
        
    def predict_proba(self, x: torch.Tensor) -> np.ndarray:
        self.feature_extractor.eval()
        x = x.to(self.device)
        with torch.no_grad():
            features = self.feature_extractor(x)
            features_np = features.cpu().numpy()
        return self.sklearn_model.predict_proba(features_np)

    def predict(self, x: torch.Tensor) -> np.ndarray:
        self.feature_extractor.eval()
        x = x.to(self.device)
        with torch.no_grad():
            features = self.feature_extractor(x)
            features_np = features.cpu().numpy()
        return self.sklearn_model.predict(features_np)

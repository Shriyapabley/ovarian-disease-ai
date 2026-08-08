import numpy as np
import torch
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from xgboost import XGBClassifier

from backend.app.data_pipeline import build_splits
from backend.app.models import EfficientNetFeatureExtractor


def extract_features(loader):
    device = torch.device('cpu')
    extractor = EfficientNetFeatureExtractor().to(device)
    extractor.eval()
    Xs = []
    ys = []
    with torch.no_grad():
        for inputs, labels in loader:
            inputs = inputs.to(device)
            feats = extractor(inputs)
            Xs.append(feats.cpu().numpy())
            ys.append(labels.numpy())
    return np.concatenate(Xs, axis=0), np.concatenate(ys, axis=0)

loaders = build_splits('cysts', batch_size=32)
X_train, y_train = extract_features(loaders['train'])
X_val, y_val = extract_features(loaders['val'])
X_test, y_test = extract_features(loaders['test'])
print('feature shapes', X_train.shape, X_val.shape, X_test.shape)

models = [
    ('svc_rbf', make_pipeline(StandardScaler(), SVC(kernel='rbf', C=8.0, gamma='scale', probability=True))),
    ('svc_linear', make_pipeline(StandardScaler(), SVC(kernel='linear', C=1.5, probability=True))),
    ('lr', make_pipeline(StandardScaler(), LogisticRegression(max_iter=4000, multi_class='auto'))),
    ('rf', RandomForestClassifier(n_estimators=600, random_state=42, n_jobs=-1)),
    ('et', ExtraTreesClassifier(n_estimators=800, random_state=42, n_jobs=-1)),
    ('xgb', XGBClassifier(n_estimators=400, max_depth=6, learning_rate=0.05, subsample=0.9, colsample_bytree=0.9, objective='multi:softprob', eval_metric='mlogloss', random_state=42)),
]

for name, model in models:
    model.fit(X_train, y_train)
    val_acc = accuracy_score(y_val, model.predict(X_val))
    test_acc = accuracy_score(y_test, model.predict(X_test))
    print(name, 'val', round(val_acc, 4), 'test', round(test_acc, 4))

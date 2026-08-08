from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
from PIL import Image, ImageOps
from torch.utils.data import DataLoader, Dataset, Subset
from torchvision import transforms

from .config import IMAGE_EXTENSIONS, TASK_CONFIG


class ImageClassificationDataset(Dataset):
    def __init__(self, root: Path, class_names: List[str], transform: Optional[transforms.Compose] = None):
        self.root = root
        self.class_names = class_names
        self.transform = transform or self._default_transform()
        self.samples = self._build_samples()

    def _default_transform(self) -> transforms.Compose:
        return transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )

    def _build_samples(self) -> List[Tuple[Path, int]]:
        samples: List[Tuple[Path, int]] = []
        for class_idx, class_name in enumerate(self.class_names):
            class_dir = self.root / class_name
            if not class_dir.exists():
                continue
            for image_path in class_dir.iterdir():
                if image_path.is_file() and image_path.suffix.lower() in IMAGE_EXTENSIONS:
                    samples.append((image_path, class_idx))
        return samples

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, int]:
        image_path, label = self.samples[index]
        image = Image.open(image_path).convert("RGB")
        image = ImageOps.exif_transpose(image)
        image = self.transform(image)
        return image, label


def get_task_metadata(task: str) -> Dict[str, object]:
    config = TASK_CONFIG[task]
    return {"name": config["name"], "classes": config["classes"], "root": config["root"]}


def get_train_transforms() -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((256, 256)),
            transforms.RandomResizedCrop((224, 224), scale=(0.85, 1.0), ratio=(0.9, 1.1)),
            transforms.RandomRotation(15),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(p=0.1),
            transforms.ColorJitter(brightness=0.12, contrast=0.12, saturation=0.08, hue=0.02),
            transforms.RandomAffine(degrees=0, translate=(0.06, 0.06), scale=(0.95, 1.05)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )


def get_eval_transforms() -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )


def _build_stratified_indices(labels: np.ndarray, train_ratio: float = 0.8, val_ratio: float = 0.1, seed: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    train_idx: List[int] = []
    val_idx: List[int] = []
    test_idx: List[int] = []

    for class_id in np.unique(labels):
        class_indices = np.where(labels == class_id)[0]
        rng.shuffle(class_indices)
        n = len(class_indices)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        n_test = n - n_train - n_val
        train_idx.extend(class_indices[:n_train].tolist())
        val_idx.extend(class_indices[n_train:n_train + n_val].tolist())
        test_idx.extend(class_indices[n_train + n_val:n_train + n_val + n_test].tolist())

    return np.array(train_idx, dtype=int), np.array(val_idx, dtype=int), np.array(test_idx, dtype=int)


def build_splits(task: str, batch_size: int = 16, seed: int = 42) -> Dict[str, DataLoader]:
    metadata = get_task_metadata(task)
    class_names = metadata["classes"]
    root = metadata["root"]
    full_dataset = ImageClassificationDataset(root=root, class_names=class_names, transform=get_train_transforms())

    labels = np.array([label for _, label in full_dataset.samples], dtype=np.int64)
    train_idx, val_idx, test_idx = _build_stratified_indices(labels, seed=seed)

    train_dataset = Subset(full_dataset, train_idx)
    val_dataset = Subset(full_dataset, val_idx)
    test_dataset = Subset(full_dataset, test_idx)

    train_dataset.dataset.transform = get_train_transforms()
    val_dataset.dataset.transform = get_eval_transforms()
    test_dataset.dataset.transform = get_eval_transforms()

    return {
        "train": DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0),
        "val": DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0),
        "test": DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0),
    }


def count_samples(task: str) -> Dict[str, int]:
    metadata = get_task_metadata(task)
    counts: Dict[str, int] = {}
    for class_name in metadata["classes"]:
        class_dir = metadata["root"] / class_name
        if class_dir.exists():
            counts[class_name] = sum(1 for item in class_dir.iterdir() if item.is_file() and item.suffix.lower() in IMAGE_EXTENSIONS)
        else:
            counts[class_name] = 0
    return counts

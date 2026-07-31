from pathlib import Path
from typing import Dict, List, Tuple, Optional

import numpy as np
import torch
from PIL import Image, ImageOps
from torch.utils.data import DataLoader, Dataset, random_split
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
                transforms.Resize((224, 224)),
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
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.Resize((224, 224)),
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


def build_splits(task: str, batch_size: int = 16, seed: int = 42) -> Dict[str, DataLoader]:
    metadata = get_task_metadata(task)
    class_names = metadata["classes"]
    root = metadata["root"]
    full_dataset = ImageClassificationDataset(root=root, class_names=class_names, transform=get_train_transforms())

    generator = torch.Generator().manual_seed(seed)
    dataset_size = len(full_dataset)
    train_size = int(dataset_size * 0.8)
    val_size = int(dataset_size * 0.1)
    test_size = dataset_size - train_size - val_size

    train_dataset, val_dataset, test_dataset = random_split(full_dataset, [train_size, val_size, test_size], generator=generator)
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

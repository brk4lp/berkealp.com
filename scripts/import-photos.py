"""Make web assets from an explicitly selected folder of processed photos.

Usage: python scripts/import-photos.py PATH_TO_PROCESSED_FOLDER
Requires Pillow. Originals and processing reports stay outside public/.
Use --person-labels with the Gallery Privacy Python environment to add labels
from the verified detection reports without running detection or mosaics again.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--person-labels', action='store_true')
parser.add_argument('--append', action='store_true', help='Keep the current collection and skip photos already imported')
args = parser.parse_args()
if args.person_labels:
    import numpy as np
    from gallery_privacy.config import Config
    from gallery_privacy.geometry import Detection
    from gallery_privacy.render import draw_person_labels
root = Path(__file__).resolve().parents[1]
destination = root / 'public' / 'photos'
destination.mkdir(parents=True, exist_ok=True)
manifest = root / 'src' / 'data' / 'photos.json'
previous = {item['id']: item for item in json.loads(manifest.read_text('utf-8'))} if manifest.exists() else {}
photos = list(previous.values()) if args.append else []
seen = set(previous) if args.append else set()
sources = sorted(args.source.glob('*.png'))
if not sources:
    raise SystemExit('No PNG files found; existing collection was not changed.')
imported = 0
for number, source in enumerate(sources, 1):
    identity = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    if identity in seen:
        continue
    seen.add(identity)
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        width, height = image.size
        asset_name = identity
        if args.person_labels:
            report = json.loads(source.with_suffix('.json').read_text('utf-8'))
            if report['output_sha256'] != hashlib.sha256(source.read_bytes()).hexdigest():
                raise ValueError(f'Photo/report checksum mismatch: {source.name}')
            if report['output_size'] != [width, height]:
                raise ValueError(f'Photo/report dimensions mismatch: {source.name}')
            if report['settings'].get('person_labels'):
                raise ValueError(f'Photo already contains labels: {source.name}')
            original_pixels = np.asarray(image)
            labeled_pixels = original_pixels.copy()
            label_mask = np.zeros((height, width), dtype=bool)
            config = Config(**{**report['settings'], 'person_labels': True})
            detections = [Detection(**d) for d in report['detections']]
            labels = draw_person_labels(labeled_pixels, label_mask, detections, config)
            if not np.array_equal(original_pixels[~label_mask], labeled_pixels[~label_mask]):
                raise ValueError(f'Pixels outside labels changed: {source.name}')
            image = Image.fromarray(labeled_pixels)
            # Stable photo IDs retain favorites; content-specific URLs refresh caches.
            revision = hashlib.sha256(image.tobytes()).hexdigest()[:12]
            asset_name = f'{identity}-labels-{revision}'
            print(f'{source.name}: {len(labels)} labels; existing mosaics preserved.', flush=True)
        # Encoding only: do not introduce any filters or generated image content.
        display = image.copy()
        display.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        display.save(destination / f'{asset_name}.webp', quality=90, method=6)
        thumbnail = image.copy()
        thumbnail.thumbnail((560, 560), Image.Resampling.LANCZOS)
        thumbnail.save(destination / f'{asset_name}-thumb.webp', quality=85, method=6)
    photo_number = len(photos) + 1 if args.append else number
    item = previous.get(identity, {'id': identity, 'title': f'Photo {photo_number:02d}', 'album': 'Camera Roll'})
    item.update(src=f'/photos/{asset_name}.webp', thumbnail=f'/photos/{asset_name}-thumb.webp', width=width, height=height)
    if args.person_labels and 'alt' in item:
        item['alt'] = item['alt'].replace('with green person outlines', 'with numbered green person outlines')
    photos.append(item)
    imported += 1
manifest.write_text(json.dumps(photos, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Imported {imported} photos; collection contains {len(photos)} photos; source files untouched.')

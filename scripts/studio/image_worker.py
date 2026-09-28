"""Private studio worker. Commands and paths are supplied by the local server."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image, ImageOps

request = json.loads(Path(sys.argv[1]).read_text('utf-8'))
directory = Path(request['directory'])
assets = Path(request['assets'])
mode = request['mode']
media_id = request['id']
directory.mkdir(parents=True, exist_ok=True)

if mode == 'review':
    from gallery_privacy.config import Config
    from gallery_privacy.geometry import Detection, box, area, clip
    from gallery_privacy.render import render
    source = Image.open(directory / 'original.png').convert('RGB')
    detections = []
    for index, item in enumerate(request['detections']):
        if item['kind'] not in {'person', 'face', 'plate'}:
            raise ValueError('Unknown detection kind')
        coords = box(item['box'])
        if area(clip(coords, *source.size)) <= 0:
            raise ValueError('Detection outside image')
        detections.append(Detection(item['kind'], coords, 1.0, f'manual-{index}'))
    image, _, regions = render(source, detections, Config(person_labels=request['labels']))
    report = {'detections': [d.to_dict() for d in detections], 'warnings': [], 'edit_regions': regions}
else:
    source_path = Path(request['source'])
    with Image.open(source_path) as opened:
        if opened.format not in {'JPEG', 'PNG', 'WEBP'} or getattr(opened, 'n_frames', 1) != 1:
            raise ValueError('Only static JPEG, PNG and WebP images are supported')
        source = ImageOps.exif_transpose(opened).convert('RGB')
    source.save(directory / 'original.png')
    preview = source.copy()
    preview.thumbnail((1600, 1600))
    preview.save(directory / 'original-preview.webp', quality=90)
    report = {'detections': [], 'warnings': []}
    image = source
    if mode == 'raw':
        from gallery_privacy.config import Config
        from gallery_privacy.detectors import LocalDetector
        from gallery_privacy.image_io import load_image
        from gallery_privacy.pipeline import Pipeline
        config = Config(person_labels=True)
        pipeline = Pipeline(LocalDetector(Path(request['models']), config), config)
        image, report = pipeline.process(load_image(directory / 'original.png'), 'original.png')

image.save(directory / 'processed.png')
(directory / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
digest = hashlib.sha256(image.tobytes()).hexdigest()[:16]
name = f'{media_id}-{digest}'
image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
image.save(assets / f'{name}.webp', quality=90, method=6)
image.thumbnail((560, 560), Image.Resampling.LANCZOS)
image.save(assets / f'{name}-thumb.webp', quality=85, method=6)
print(json.dumps({'src': f'/studio-media/{name}.webp', 'thumbnail': f'/studio-media/{name}-thumb.webp',
                  'width': source.width, 'height': source.height,
                  'detections': report['detections'], 'warnings': report['warnings']}))

"""Regenerate the six shipping spacecraft modules from the reviewed geometry source."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = (root / 'tools/dystopia-craft.template.js').read_text()
for index, name in enumerate(['kestrel', 'albatross', 'manta', 'brimstone', 'spectre', 'ironclad']):
    (root / f'game/assets/{name}.js').write_text(source.replace('const kind=KIND;', f'const kind={index};'))

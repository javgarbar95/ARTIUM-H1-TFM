"""Package source, assets, documentation and real evidence without dependencies/secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys
root=Path(__file__).resolve().parents[1]
output=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root.parent/'artium-hito-1.zip'
excluded={'node_modules','.expo','.git','dist','test-results','playwright-report','__pycache__'}
files=[p for p in root.rglob('*') if p.is_file() and not any(part in excluded for part in p.relative_to(root).parts) and not p.name.startswith('.env') and p.suffix!='.log']
output.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(output,'w',ZIP_DEFLATED) as archive:
 for p in sorted(files):archive.write(p,Path('artium')/p.relative_to(root))
with ZipFile(output) as archive:
 assert archive.testzip() is None
 for required in ['package-lock.json','README.md','docs/alcance-hito-1.md','docs/avance-hito-1.md','docs/pruebas-hito-1.md','guion-demo.md','assets/fonts/OFL.txt']:
  assert 'artium/'+required in archive.namelist(),required
print(f'{len(files)} files; {output.stat().st_size} bytes; ZIP verified: {output}')

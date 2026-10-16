"""Convierte un reporte emitido de la bitácora (colección `publicadas`) en datos públicos.
Uso: python3 tools/publicar.py <proyecto> <reporte.json> <carpeta_jpg>
<carpeta_jpg> contiene las fotos del reporte nombradas <assetId>.jpg.
Publica solo: número, fecha, etapa, % avance, fotos (sin Problema) y una descripción corta filtrada."""
import json, re, sys, os, io, datetime
from PIL import Image
BAD = re.compile(r'presupuest|contemplad|adicional|cotiz|alcance|interdonas|a cargo de|se solicita|renglón|renglon|Q\s?\d|\bmonto|costo|precio|pago|factur', re.I)
def corto(t):
    t = re.sub(r'\s*\((?:[\d.,\s–-]|y)+\)', '', t or '')
    ss = [s.strip() for s in re.split(r'(?<=[.;])\s+', t) if s.strip() and not BAD.search(s)]
    if not ss: return ''
    s = re.sub(r'^Se visibiliza(n)?\s+', '', ss[0]).rstrip(' .;') + '.'
    s = s[0].upper() + s[1:]
    return s if len(s) <= 140 else s[:137].rsplit(' ', 1)[0].rstrip(',;') + '…'
def main(proy, rep_path, jpgdir):
    r = json.load(open(rep_path)); base = os.path.join(os.path.dirname(__file__), '..', proy)
    os.makedirs(base + '/fotos', exist_ok=True)
    dpath = base + '/datos.json'
    d = json.load(open(dpath)) if os.path.exists(dpath) else {'proyecto': {}, 'reportes': []}
    P = r.get('proyecto', {})
    d['proyecto'] = {'nombre': P.get('nombre') or d['proyecto'].get('nombre'), 'ubicacion': P.get('ubicacion') or d['proyecto'].get('ubicacion'), 'etapa': r.get('etapa', '')}
    fotos = []
    for i, f in enumerate([f for f in r.get('fotos', []) if f.get('tipo') != 'Problema']):
        name = f"{r['numero']:02d}-{i+1:03d}.jpg"
        im = Image.open(os.path.join(jpgdir, f['assetId'] + '.jpg')); im.thumbnail((1400, 1400))
        im.convert('RGB').save(base + '/fotos/' + name, 'JPEG', quality=72, optimize=True)  # sin EXIF/GPS
        fotos.append({'src': 'fotos/' + name, 'txt': (f.get('textoWeb') or '').strip() or corto(f.get('caption'))})
    av = r.get('metrics', {}).get('real', r.get('avance', 0)) or 0
    rep = {'numero': r['numero'], 'fecha': r['fecha'], 'etapa': r.get('etapa', ''), 'avance': round(float(av), 1), 'fotos': fotos}
    d['reportes'] = [x for x in d['reportes'] if x['numero'] != r['numero']] + [rep]
    d['reportes'].sort(key=lambda x: x['fecha'])
    d['actualizado'] = datetime.datetime.now().isoformat(timespec='seconds')
    json.dump(d, open(dpath, 'w'), ensure_ascii=False, indent=1)
    print('ok', proy, '#%s' % r['numero'], len(fotos), 'fotos')
if __name__ == '__main__': main(*sys.argv[1:4])

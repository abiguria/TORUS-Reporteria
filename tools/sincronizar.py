"""Sincroniza los reportes emitidos de la bitácora con la página pública de un proyecto.

Uso:
  python3 tools/sincronizar.py faltantes <carpeta_proyecto> <dir_publicadas>
      Imprime, uno por línea, los assetId de fotos públicas que aún no están en <carpeta_proyecto>/fotos.
  python3 tools/sincronizar.py construir <carpeta_proyecto> <dir_publicadas> <dir_assets>
      Reescribe <carpeta_proyecto>/datos.json con todos los reportes emitidos, agrega las fotos nuevas
      (desde <dir_assets>/<assetId>.*) y borra las fotos que ya no se publican.

<dir_publicadas> contiene un JSON por reporte emitido (colección `publicadas` de la bitácora).

Qué se publica: número, fecha, etapa, % de avance, fotos y una frase corta por foto.
Qué NO se publica nunca: montos, partidas o renglones, pendientes, acuerdos, responsables,
receptores, notas, ni fotos marcadas como Problema. Las fotos se guardan sin metadatos (EXIF/GPS).
"""
import glob, hashlib, json, os, re, sys, datetime
from PIL import Image, ImageOps

BAD = re.compile(r'presupuest|contemplad|adicional|cotiz|alcance|interdonas|a cargo de|se solicita|'
                 r'renglón|renglon|Q\s?\d|\bmonto|costo|precio|pago|factur|penaliz|\batras|\bretras|responsab', re.I)


def corto(t):
    t = re.sub(r'\s*\((?:[\d.,\s–-]|y)+\)', '', t or '')
    t = re.sub(r'(,\s*|\s+)(a ser\s+\w+\s+)?(por|a cargo de)\s+(parte de\s+)?interdonas[^.;]*', '', t, flags=re.I)
    ss = [s.strip() for s in re.split(r'(?<=[.;])\s+', t) if s.strip() and not BAD.search(s)]
    if not ss:
        return ''
    s = re.sub(r'^Se visibiliza(n)?\s+', '', ss[0]).rstrip(' .;') + '.'
    s = s[0].upper() + s[1:]
    return s if len(s) <= 140 else s[:137].rsplit(' ', 1)[0].rstrip(',;') + '…'


def nombre(aid):
    return hashlib.sha1(aid.encode()).hexdigest()[:16] + '.jpg'


def reportes(dpub):
    out = []
    for f in sorted(glob.glob(os.path.join(dpub, '*.json'))):
        r = json.load(open(f))
        r = r.get('data', r) if isinstance(r, dict) and 'fotos' not in r else r
        if 'numero' in r and 'fecha' in r:
            out.append(r)
    return sorted(out, key=lambda r: (r['fecha'], r['numero']))


def publicas(r):
    return [f for f in r.get('fotos', []) if f.get('assetId') and f.get('tipo') != 'Problema' and f.get('web', True) is not False]


def faltantes(proy, dpub):
    for r in reportes(dpub):
        for f in publicas(r):
            if not os.path.exists(os.path.join(proy, 'fotos', nombre(f['assetId']))):
                print(f['assetId'])


def construir(proy, dpub, dassets):
    os.makedirs(os.path.join(proy, 'fotos'), exist_ok=True)
    dpath = os.path.join(proy, 'datos.json')
    prev = json.load(open(dpath)) if os.path.exists(dpath) else {}
    rs = reportes(dpub)
    usadas, salida, nuevas = set(), [], 0
    proyecto = dict(prev.get('proyecto') or {})
    for r in rs:
        P = r.get('proyecto') or {}
        if P.get('nombre'): proyecto['nombre'] = P['nombre']
        if P.get('ubicacion'): proyecto['ubicacion'] = P['ubicacion']
        fotos = []
        for f in publicas(r):
            n = nombre(f['assetId']); destino = os.path.join(proy, 'fotos', n)
            if not os.path.exists(destino):
                src = glob.glob(os.path.join(dassets, f['assetId'] + '.*'))
                if not src:
                    sys.exit('Falta la foto ' + f['assetId'] + ' en ' + dassets)
                im = ImageOps.exif_transpose(Image.open(src[0])); im.thumbnail((1400, 1400))
                im.convert('RGB').save(destino, 'JPEG', quality=72, optimize=True)  # sin EXIF/GPS
                nuevas += 1
            usadas.add(n)
            fotos.append({'src': 'fotos/' + n, 'txt': (f.get('textoWeb') or '').strip() or corto(f.get('caption'))})
        av = (r.get('metrics') or {}).get('real', r.get('avance', 0)) or 0
        salida.append({'numero': r['numero'], 'fecha': r['fecha'], 'etapa': r.get('etapa', ''),
                       'avance': round(float(av), 1), 'fotos': fotos})
    if rs:
        proyecto['etapa'] = rs[-1].get('etapa', '')
    borradas = 0
    for p in glob.glob(os.path.join(proy, 'fotos', '*')):
        if os.path.basename(p) not in usadas:
            os.remove(p); borradas += 1
    d = {'proyecto': proyecto, 'actualizado': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'reportes': salida}
    s = json.dumps(d, ensure_ascii=False, indent=1)
    fuga = re.search(r'Q\s?\d|presupuest|INTERDONAS|Interdonas de Guatemala|pendiente', s)
    if fuga:
        sys.exit('Revisión de seguridad: el texto público contiene "' + fuga.group(0) + '". No se publicó nada.')
    open(dpath, 'w').write(s + '\n')
    print(json.dumps({'reportes': [r['numero'] for r in salida], 'fotos': len(usadas), 'nuevas': nuevas, 'borradas': borradas}))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'faltantes' and len(sys.argv) == 4: faltantes(*sys.argv[2:4])
    elif cmd == 'construir' and len(sys.argv) == 5: construir(*sys.argv[2:5])
    else: sys.exit(__doc__)

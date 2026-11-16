// Garante as imagens em public/assets. Se um arquivo existe, fica como está;
// se falta, é buscado no site atual (orlando360.com.br), onde as fotos estão embutidas no JavaScript.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.orlando360.com.br';
const DIR = 'public/assets';
const UA = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };
const photos = { aura: 'aura.jpg', innovarsi: 'innovarsi.jpg', celiana: 'celiana-costa.jpg', roma: 'roma.jpg', livia: 'dra-livia-venancio.jpg', avatar: 'orlando.jpg' };

mkdirSync(DIR, { recursive: true });
const missing = Object.entries(photos).filter(([, f]) => !existsSync(DIR + '/' + f));

if (!existsSync(DIR + '/logo.png')) {
  const r = await fetch(SITE + '/LOGO1_ORIG.png', { headers: UA });
  if (!r.ok) throw new Error('logo: HTTP ' + r.status);
  writeFileSync(DIR + '/logo.png', Buffer.from(await r.arrayBuffer()));
  console.log('logo.png baixado');
}

if (missing.length) {
  const html = await (await fetch(SITE, { headers: UA })).text();
  const i = html.indexOf('/static/js/main.');
  if (i < 0) throw new Error('bundle do site atual nao encontrado');
  const src = html.slice(i, html.indexOf('.js', i) + 3);
  const js = await (await fetch(SITE + src, { headers: UA })).text();
  for (const [key, file] of missing) {
    const tag = key + ':"data:image/jpeg;base64,';
    const a = js.indexOf(tag);
    if (a < 0) throw new Error('imagem ' + key + ' nao encontrada no site atual');
    const start = a + tag.length;
    writeFileSync(DIR + '/' + file, Buffer.from(js.slice(start, js.indexOf('"', start)), 'base64'));
    console.log(file + ' extraido');
  }
}
console.log('assets prontos');

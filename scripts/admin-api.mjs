import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const imagesDir = path.join(root, 'public', 'assets', 'images', 'products');
const overridesPath = path.join(root, 'public', 'catalog-overrides.json');
const productsTsPath = path.join(root, 'src', 'app', 'data', 'products.ts');
const envPath = path.join(root, '.env');
const PORT = 4301;

function loadDotEnv() {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(overridesPath)) {
  fs.writeFileSync(overridesPath, '{}\n', 'utf8');
}

function readAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD missing. Copy .env.example to .env and set ADMIN_PASSWORD.'
    );
  }
  return password;
}

function readOverrides() {
  try {
    return JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  } catch {
    return {};
  }
}

function writeOverrides(data) {
  fs.writeFileSync(overridesPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function patchProductsTs(id, fields) {
  let src = fs.readFileSync(productsTsPath, 'utf8');
  const blockRe = new RegExp(
    `(id:\\s*'${id}'[\\s\\S]*?)(?=\\r?\\n\\s*\\},\\r?\\n\\s*\\{|\\r?\\n\\s*\\},\\r?\\n\\];)`,
    'm'
  );
  const match = src.match(blockRe);
  if (!match) {
    throw new Error(`Product "${id}" not found in products.ts`);
  }

  let block = match[1];
  if (fields.pricePerUnit != null) {
    if (!/pricePerUnit:\s*\d+/.test(block)) {
      throw new Error(`pricePerUnit not found for "${id}"`);
    }
    block = block.replace(/pricePerUnit:\s*\d+/, `pricePerUnit: ${fields.pricePerUnit}`);
  }
  if (fields.image != null) {
    if (!/image:\s*(?:\r?\n\s*)?'[^']*'/.test(block)) {
      throw new Error(`image field not found for "${id}"`);
    }
    block = block.replace(
      /image:\s*(?:\r?\n\s*)?'[^']*'/,
      `image:\r\n      '${fields.image}'`
    );
  }

  src = src.slice(0, match.index) + block + src.slice(match.index + match[1].length);
  fs.writeFileSync(productsTsPath, src, 'utf8');
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function assertPassword(body) {
  const expected = readAdminPassword();
  if (!body?.password || body.password !== expected) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/overrides') {
      return sendJson(res, 200, readOverrides());
    }

    const productMatch = url.pathname.match(
      /^\/api\/products\/([a-z0-9-]+)(?:\/(image))?$/i
    );

    if (req.method === 'POST' && productMatch) {
      const id = productMatch[1];
      const isImage = productMatch[2] === 'image';
      const body = await readBody(req);
      assertPassword(body);

      const overrides = readOverrides();
      overrides[id] = overrides[id] || {};

      if (isImage) {
        const dataUrl = String(body.dataUrl || '');
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
          return sendJson(res, 400, { error: 'Invalid image data.' });
        }
        const ext = match[1].includes('png')
          ? 'png'
          : match[1].includes('webp')
            ? 'webp'
            : 'jpg';
        const filename = `${id}.${ext}`;
        const diskPath = path.join(imagesDir, filename);
        fs.writeFileSync(diskPath, Buffer.from(match[2], 'base64'));

        const publicPath = `assets/images/products/${filename}`;
        overrides[id].image = publicPath;
        writeOverrides(overrides);
        patchProductsTs(id, { image: publicPath });

        return sendJson(res, 200, {
          ok: true,
          id,
          image: publicPath,
          overrides: overrides[id],
        });
      }

      const pricePerUnit = Number(body.pricePerUnit);
      if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
        return sendJson(res, 400, { error: 'Invalid price.' });
      }
      const rounded = Math.round(pricePerUnit);
      overrides[id].pricePerUnit = rounded;
      writeOverrides(overrides);
      patchProductsTs(id, { pricePerUnit: rounded });

      return sendJson(res, 200, {
        ok: true,
        id,
        pricePerUnit: rounded,
        overrides: overrides[id],
      });
    }

    if (req.method === 'DELETE' && productMatch && !productMatch[2]) {
      const id = productMatch[1];
      const body = await readBody(req);
      assertPassword(body);

      const overrides = readOverrides();
      const previous = overrides[id];
      delete overrides[id];
      writeOverrides(overrides);

      if (
        previous?.image?.startsWith('assets/images/products/') ||
        previous?.image?.startsWith('images/products/')
      ) {
        const diskPath = path.join(root, 'public', previous.image);
        if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
      }

      if (body.restore) {
        patchProductsTs(id, {
          pricePerUnit: body.restore.pricePerUnit,
          image: body.restore.image,
        });
      }

      return sendJson(res, 200, { ok: true, id });
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || 'Server error',
    });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Admin API listening on http://127.0.0.1:${PORT}`);
  console.log(`Saving images to ${imagesDir}`);
});

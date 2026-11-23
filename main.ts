import { readdirSync, readFileSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const d of readdirSync(I).sort()) {
  const p = readFileSync(join(I, d, 'program.bin')), q = readFileSync(join(I, d, 'input.bin')), n = p.length;
  const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), o = new Uint8Array(65536);
  let sp = 0, cp = 0, ol = 0, ip = 0, pc = 0, st = 0, ex = 0;
  for (;;) {
    if (st === 1e6) { ex = 10; break; }
    if (pc < 0 || pc >= n) { ex = 9; break; }
    const op = p[pc];
    const ok = op <= 7 || (op >= 16 && op <= 34) || (op >= 48 && op <= 52) || op === 64 || op === 65 || (op >= 80 && op <= 83);
    if (!ok) { ex = 5; break; }
    const im = op === 1 ? 1 : op === 2 ? 4 : op >= 48 && op <= 51 ? 2 : 0;
    if (pc + im >= n) { ex = 9; break; }
    const po = op === 7 ? 3 : op === 5 || op === 6 || op === 65 || (op >= 16 && op <= 34 && op !== 23 && op !== 27) ? 2 : op === 3 || op === 4 || op === 23 || op === 27 || op === 49 || op === 50 || op === 64 || op === 80 || op === 81 || op === 83 ? 1 : 0;
    const pu = op === 6 || op === 7 ? 3 : op === 5 ? 2 : op === 1 || op === 2 || op === 4 || op === 82 || op === 64 || (op >= 16 && op <= 34) ? 1 : 0;
    st++;
    if (sp < po) { ex = 2; break; }
    if (sp - po + pu > 256) { ex = 3; break; }
    const nx = pc + 1 + im; pc = nx;
    if (op === 0) { ex = 0; break; }
    else if (op === 1) D[sp++] = (p[nx - 1] << 24) >> 24;
    else if (op === 2) D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24);
    else if (op === 3) sp--;
    else if (op === 4) { D[sp] = D[sp - 1]; sp++; }
    else if (op === 5) { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; }
    else if (op === 6) { D[sp] = D[sp - 2]; sp++; }
    else if (op === 7) { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; }
    else if (op >= 16 && op <= 34) {
      if (op === 23) D[sp - 1] = -D[sp - 1] | 0;
      else if (op === 27) D[sp - 1] = ~D[sp - 1];
      else {
        const b = D[sp - 1], a = D[sp - 2]; let r = 0;
        if (op === 16) r = (a + b) | 0;
        else if (op === 17) r = (a - b) | 0;
        else if (op === 18) r = Math.imul(a, b);
        else if (op === 19 || op === 20) { if (b === 0) { ex = 4; break; } r = op === 19 ? (a === -2147483648 && b === -1 ? a : (a / b) | 0) : b === -1 ? 0 : (a % b) | 0; }
        else if (op === 21 || op === 22) { if (b === 0) { ex = 4; break; } r = op === 21 ? Math.floor((a >>> 0) / (b >>> 0)) | 0 : (a >>> 0) % (b >>> 0) | 0; }
        else if (op === 24) r = a & b;
        else if (op === 25) r = a | b;
        else if (op === 26) r = a ^ b;
        else if (op === 28) r = a << (b & 31);
        else if (op === 29) r = a >> (b & 31);
        else if (op === 30) r = (a >>> (b & 31)) | 0;
        else if (op === 32) r = a === b ? 1 : 0;
        else if (op === 33) r = a < b ? 1 : 0;
        else if (op === 34) r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp -= 2; D[sp++] = r;
      }
    }
    else if (op >= 48 && op <= 52) {
      const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
      if (op === 48) pc = nx + rel;
      else if (op === 49) { if (D[--sp] === 0) pc = nx + rel; }
      else if (op === 50) { if (D[--sp] !== 0) pc = nx + rel; }
      else if (op === 51) { if (cp === 64) { ex = 7; break; } C[cp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); }
      else if (op === 52) { if (cp === 0) { ex = 8; break; } pc = C[--cp]; }
    }
    else if (op === 64) { const a = D[sp - 1]; if (a < 0 || a > 255) { ex = 6; break; } D[sp - 1] = M[a]; }
    else if (op === 65) { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a > 255) { ex = 6; break; } sp -= 2; M[a] = v; }
    else if (op === 80) { const s = String(D[sp - 1]); if (ol + s.length > 65536) { ex = 11; break; } sp--; for (let i = 0; i < s.length; i++) o[ol++] = s.charCodeAt(i); }
    else if (op === 81) { if (ol + 1 > 65536) { ex = 11; break; } o[ol++] = D[--sp] & 255; }
    else if (op === 82) D[sp++] = ip < q.length ? q[ip++] : -1;
    else if (op === 83) { ex = D[--sp] & 255; break; }
  }
  mkdirSync(join(O, d), { recursive: true, mode: 0o755 });
  writeFileSync(join(O, d, 'stdout.bin'), o.subarray(0, ol));
  writeFileSync(join(O, d, 'exit.txt'), ex + '\n');
  chmodSync(join(O, d), 0o755);
  chmodSync(join(O, d, 'stdout.bin'), 0o644);
  chmodSync(join(O, d, 'exit.txt'), 0o644);
}

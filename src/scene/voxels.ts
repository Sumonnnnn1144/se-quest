// Voxel building blocks: everything in the scene is generated in code from these helpers, with no 3D asset files.
import * as THREE from 'three';
import type { Sprite } from '@/game/sprites';

export type Palette = { grass: string; grass2: string; dirt: string; rock: string; leaf: string; leaf2: string };
type Voxel = [number, number, number, string];

// World 6 is the Exam island.
export const PALETTES: Record<number, Palette> = {
  1: { grass: '#8fd15c', grass2: '#7ec24e', dirt: '#b07a43', rock: '#8c7a68', leaf: '#ef9a35', leaf2: '#f7bc4a' },
  2: { grass: '#5fcf58', grass2: '#4fbe4c', dirt: '#8f6a3e', rock: '#6f7a78', leaf: '#2fa24a', leaf2: '#49bd57' },
  3: { grass: '#e2bd63', grass2: '#d4ab52', dirt: '#a8673e', rock: '#7d5a54', leaf: '#c8503f', leaf2: '#dd6f45' },
  4: { grass: '#e6ebff', grass2: '#d4dcfb', dirt: '#979ddf', rock: '#6c71bb', leaf: '#f6f8ff', leaf2: '#c7d0fa' },
  5: { grass: '#b478ea', grass2: '#a165dc', dirt: '#6f42ad', rock: '#4c3080', leaf: '#ff7fbf', leaf2: '#ffa6d4' },
  6: { grass: '#8fe0c8', grass2: '#7dd3ba', dirt: '#3f8f80', rock: '#2e6b62', leaf: '#22b0a2', leaf2: '#4fd1c1' },
  7: { grass: '#a9d8ff', grass2: '#95caf7', dirt: '#4f7fb8', rock: '#36598a', leaf: '#3a96e0', leaf2: '#6fb4f0' },
  8: { grass: '#57506a', grass2: '#4a4459', dirt: '#37334a', rock: '#25222f', leaf: '#37334a', leaf2: '#4a4459' },
};

export const seeded = (start: number) => {
  let a = start;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let v = Math.imul(a ^ a >>> 15, 1 | a);
    v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v;
    return ((v ^ v >>> 14) >>> 0) / 4294967296;
  };
};

export class VoxelSet {
  private cells = new Map<string, Voxel>();
  private tops = new Map<string, number>();
  set(x: number, y: number, z: number, c: string) { this.cells.set(`${x},${y},${z}`, [x, y, z, c]); }
  box(x: number, y: number, z: number, w: number, h: number, d: number, c: string) {
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) for (let k = 0; k < d; k++) this.set(x + i, y + j, z + k, c);
  }
  del(x: number, y: number, z: number) { this.cells.delete(`${x},${y},${z}`); }
  has(x: number, y: number, z: number) { return this.cells.has(`${x},${y},${z}`); }
  values() { return this.cells.values(); }
  setTop(x: number, z: number, top: number) { this.tops.set(`${x},${z}`, top); }
  topAt(x: number, z: number) { return this.tops.get(`${x},${z}`) ?? 0; }
  onLand(x: number, z: number) { return this.tops.has(`${x},${z}`); }
}

export const unitBox = new THREE.BoxGeometry(1, 1, 1);
export const voxelMaterial = () => new THREE.MeshStandardMaterial({ roughness: .86, metalness: 0 });

// One instanced mesh per set. Buried voxels are skipped, and voxels under an overhang get cheap ambient occlusion.
export function meshOf(set: VoxelSet, opts: { jitter?: number; seed?: number; cast?: boolean; receive?: boolean; mat?: THREE.MeshStandardMaterial } = {}) {
  const { jitter = .035, seed = 7, cast = true, receive = true, mat } = opts;
  const list: Voxel[] = [];
  for (const v of set.values()) {
    const [x, y, z] = v;
    const buried = set.has(x + 1, y, z) && set.has(x - 1, y, z) && set.has(x, y + 1, z) && set.has(x, y - 1, z) && set.has(x, y, z + 1) && set.has(x, y, z - 1);
    if (!buried) list.push(v);
  }
  const mesh = new THREE.InstancedMesh(unitBox, mat ?? voxelMaterial(), list.length);
  const rnd = seeded(seed), m = new THREE.Matrix4(), col = new THREE.Color();
  list.forEach(([x, y, z, c], i) => {
    mesh.setMatrixAt(i, m.makeTranslation(x, y, z));
    let occ = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if ((dx || dz) && set.has(x + dx, y + 1, z + dz)) occ++;
    mesh.setColorAt(i, col.set(c).multiplyScalar(1 - occ * .035 + (rnd() - .5) * 2 * jitter));
  });
  mesh.castShadow = cast; mesh.receiveShadow = receive;
  mesh.userData.list = list;
  return mesh;
}

export function makeIsland(seed: number, R: number, pal: Palette, deep = .9) {
  const set = new VoxelSet(), rnd = seeded(seed), p1 = rnd() * 6, p2 = rnd() * 6;
  for (let x = -R - 2; x <= R + 2; x++) for (let z = -R - 2; z <= R + 2; z++) {
    const a = Math.atan2(z, x), r = R * (.84 + .1 * Math.sin(a * 3 + p1) + .06 * Math.sin(a * 5 + p2)), d = Math.hypot(x, z);
    if (d > r) continue;
    const e = d / r;
    const top = e < .72 ? Math.round(.9 * Math.sin(x * .33 + p1) * Math.cos(z * .37 + p2) + .3) : 0;
    const depth = 2 + Math.floor(Math.pow(1 - e, .62) * R * deep + rnd() * 1.6);
    set.setTop(x, z, top);
    for (let k = 0; k < depth; k++) {
      const c = k === 0 ? (rnd() < .28 ? pal.grass2 : pal.grass) : k < 3 ? pal.dirt : (rnd() < .2 ? pal.dirt : pal.rock);
      set.set(x, top - k, z, c);
    }
  }
  return set;
}

export function tree(set: VoxelSet, x: number, z: number, pal: Palette, h = 4) {
  if (!set.onLand(x, z)) return;
  const y = set.topAt(x, z) + 1;
  set.box(x, y, z, 1, h, 1, '#6e4a2c');
  const top = y + h;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -1; k <= 1; k++) {
    if (Math.abs(i) + Math.abs(j) + Math.abs(k) * 1.4 > 3.2) continue;
    set.set(x + i, top + k, z + j, (i + j + k) % 2 === 0 ? pal.leaf : pal.leaf2);
  }
}

/* Each island's landmark comes from its lecture. */

export function computer(set: VoxelSet, x: number, y: number, z: number) {
  const beige = '#e6dcc4', beige2 = '#c9bd9f';
  set.box(x + 2, y, z, 3, 1, 3, beige2);
  set.box(x + 3, y + 1, z + 1, 1, 1, 1, beige2);
  set.box(x - 1, y + 2, z, 9, 7, 2, beige);
  set.box(x, y + 3, z + 1, 7, 5, 1, '#10223a');
  [[0, 5], [2, 3], [1, 4], [3, 2]].forEach(([o, l], row) => {
    for (let i = 0; i < l; i++) set.set(x + 1 + o + i - (o > 1 ? 1 : 0), y + 7 - row, z + 1, row % 2 ? '#62f08e' : '#ffd451');
  });
  set.box(x - 1, y, z + 4, 9, 1, 3, beige2);
  for (let i = 0; i < 4; i++) set.box(x + i * 2, y + 1, z + 4 + (i % 2), 1, 1, 1, beige);
}

// Five steps, like the five Waterfall stages. Returns where the water leaves the last step.
export function waterfall(set: VoxelSet, x0: number, y0: number, pal: Palette, zHalf = 4, z0 = 0) {
  const water = '#49c6f2', foam = '#c6f2ff';
  for (let i = 0; i < 5; i++) {
    const h = (5 - i) * 2 - 1, nextH = i < 4 ? (4 - i) * 2 - 1 : 0;
    for (let x = x0 + i * 3; x < x0 + (i + 1) * 3; x++) for (let z = z0 - zHalf; z <= z0 + zHalf; z++) {
      const channel = Math.abs(z - z0) <= 1;
      if (!set.onLand(x, z) && !channel) continue;
      for (let k = 0; k < h; k++) set.set(x, y0 + k, z, k === h - 1 ? pal.grass : k % 3 === 2 ? pal.rock : pal.dirt);
      if (channel) {
        set.set(x, y0 + h - 1, z, (x + z) % 3 === 0 ? foam : water);
        if (x === x0 + (i + 1) * 3 - 1) for (let k = nextH; k < h; k++) set.set(x, y0 + k, z, (k + z) % 2 ? foam : water);
      }
    }
  }
  return { x: x0 + 15, y: y0 + 1, z: z0 };
}

export function clockTower(set: VoxelSet, x: number, y: number, z: number) {
  const stone = '#d8d3cd', stone2 = '#b9b2ab', roof = '#c6324a', face = '#fff4dc', hand = '#2a0b12';
  set.box(x - 3, y, z - 3, 7, 3, 7, stone2);
  set.box(x - 2, y + 3, z - 2, 5, 9, 5, stone);
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { set.set(x + i, y + 9 + j, z + 3, face); set.set(x + 3, y + 9 + j, z + i, face); }
  for (let k = 0; k < 3; k++) { set.set(x, y + 9 + k, z + 3, hand); set.set(x + 3, y + 9 + k, z, hand); }
  for (let k = 0; k < 2; k++) { set.set(x + k, y + 9, z + 3, hand); set.set(x + 3, y + 9, z + k, hand); }
  for (let k = 0; k < 4; k++) set.box(x - 3 + k, y + 12 + k, z - 3 + k, 7 - 2 * k, 1, 7 - 2 * k, roof);
  set.box(x, y + 16, z, 1, 3, 1, '#ffd451');
}

export function questionMark(set: VoxelSet, x: number, y: number, z: number) {
  const rows = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'];
  set.box(x - 1, y, z - 1, 7, 2, 3, '#6c71bb');
  set.box(x, y + 2, z, 5, 1, 1, '#979ddf');
  rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') set.box(x + i, y + 10 - j, z, 1, 1, 2, (i + j) % 2 ? '#5b4bc4' : '#7265e0'); }));
}

// A browser window, with a UML actor standing beside it.
export function browser(set: VoxelSet, x: number, y: number, z: number) {
  const frame = '#1e1740', bar = '#3e2678', page = '#f4eefc';
  set.box(x - 6, y, z, 13, 11, 1, frame);
  set.box(x - 5, y + 1, z + 1, 11, 7, 1, page);
  set.box(x - 5, y + 9, z + 1, 11, 1, 1, bar);
  set.set(x - 4, y + 9, z + 1, '#ff5f6d'); set.set(x - 3, y + 9, z + 1, '#ffd451'); set.set(x - 2, y + 9, z + 1, '#43e0a6');
  set.box(x - 4, y + 6, z + 1, 6, 1, 1, '#b08fe6');
  set.box(x - 4, y + 4, z + 1, 9, 1, 1, '#d7c6f2');
  set.box(x - 1, y + 2, z + 1, 5, 1, 2, '#ff5fa8');
  set.box(x - 6, y - 1, z - 1, 3, 1, 3, frame); set.box(x + 4, y - 1, z - 1, 3, 1, 3, frame);
  const ax = x + 9;
  set.box(ax, y + 7, z + 1, 3, 3, 3, '#ffffff'); set.box(ax + 1, y + 2, z + 2, 1, 5, 1, frame);
  set.box(ax - 1, y + 5, z + 2, 5, 1, 1, frame);
  set.box(ax, y, z + 2, 1, 2, 1, frame); set.box(ax + 2, y, z + 2, 1, 2, 1, frame);
}

// World 6: a tower of four stacked layers, like a layered architecture.
export function layerTower(set: VoxelSet, x: number, y: number, z: number) {
  const floors = ['#2e6b62', '#22b0a2', '#5fd6c8', '#e3fbf7'], pillar = '#1d3f3a';
  set.box(x - 3, y, z - 3, 7, 1, 7, pillar);
  floors.forEach((c, i) => {
    const fy = y + 1 + i * 3;
    set.box(x - 3, fy, z - 3, 7, 2, 7, c);
    if (i < 3) for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) set.set(x + dx, fy + 2, z + dz, pillar);
  });
  set.box(x, y + 13, z, 1, 3, 1, pillar);
  set.set(x, y + 16, z, '#ff6b6b');
}
// World 7: a standing UML class box with its three compartments.
export function classBoard(set: VoxelSet, x: number, y: number, z: number) {
  const frame = '#0f2238', head = '#3a96e0', page = '#f2f8ff', line = '#9cc4ec';
  set.box(x - 6, y + 2, z, 13, 12, 1, frame);
  set.box(x - 5, y + 11, z + 1, 11, 2, 1, head);
  set.box(x - 5, y + 3, z + 1, 11, 7, 1, page);
  set.box(x - 5, y + 7, z + 1, 11, 1, 1, frame);
  set.box(x - 4, y + 9, z + 1, 6, 1, 1, line); set.box(x - 4, y + 5, z + 1, 8, 1, 1, line); set.box(x - 4, y + 4, z + 1, 5, 1, 1, line);
  set.box(x - 5, y, z, 1, 2, 1, frame); set.box(x + 5, y, z, 1, 2, 1, frame);
}
export function castle(set: VoxelSet, x: number, y: number, z: number) {
  const a = '#6d6880', b = '#4f4a62', lava = '#ff6a2a', flag = '#ff4d5e';
  set.box(x - 5, y, z - 4, 11, 7, 9, a);
  for (let i = -5; i <= 5; i += 2) { set.set(x + i, y + 7, z + 4, b); set.set(x + i, y + 7, z - 4, b); }
  for (let i = -4; i <= 4; i += 2) { set.set(x + 5, y + 7, z + i, b); set.set(x - 5, y + 7, z + i, b); }
  [[-5, -4], [5, -4], [-5, 4], [5, 4]].forEach(([i, j]) => {
    set.box(x + i - 1, y, z + j - 1, 3, 10, 3, b);
    set.box(x + i - 1, y + 10, z + j - 1, 1, 1, 1, a);
    set.box(x + i + 1, y + 10, z + j + 1, 1, 1, 1, a);
  });
  set.box(x - 1, y, z + 5, 3, 4, 1, '#1a1726');
  set.box(x - 1, y, z + 5, 3, 1, 1, lava);
  set.box(x, y + 7, z, 1, 9, 1, '#2a2736');
  set.box(x + 1, y + 13, z, 5, 3, 1, flag);
  for (let i = -9; i < 10; i += 3) if (set.onLand(x + i, z + 8)) set.set(x + i, set.topAt(x + i, z + 8), z + 8, lava);
}

// Pixel rows become a chunky toy: a flat front face with a one-step bevel, so the sprite's face stays readable.
export function spriteVoxels(sprite: Sprite, maxD = 2) {
  const rows = sprite.rows, h = rows.length, w = rows[0].length, set = new VoxelSet();
  const solid = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w && !!sprite.palette[rows[y][x]];
  const edgeDist = (x: number, y: number) => {
    for (let d = 1; d <= maxD; d++) for (let i = -d; i <= d; i++) for (let j = -d; j <= d; j++) {
      if ((Math.abs(i) === d || Math.abs(j) === d) && !solid(x + i, y + j)) return d;
    }
    return maxD + 1;
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!solid(x, y)) continue;
    const half = Math.min(edgeDist(x, y), maxD);
    for (let z = -half; z <= half; z++) set.set(x - (w - 1) / 2, h - 1 - y, z, sprite.palette[rows[y][x]]);
  }
  return set;
}

export function cloud(seed: number) {
  const set = new VoxelSet(), rnd = seeded(seed), n = 4 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const w = 3 + Math.floor(rnd() * 5), h = 1 + Math.floor(rnd() * 2), d = 3 + Math.floor(rnd() * 3);
    set.box(i * 2 - n, Math.floor(rnd() * 2) - (i === 0 ? 1 : 0), Math.floor(rnd() * 3) - 2, w, h, d, '#ffffff');
  }
  const mat = voxelMaterial();
  mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = .2;
  return meshOf(set, { jitter: .01, cast: false, receive: false, mat });
}

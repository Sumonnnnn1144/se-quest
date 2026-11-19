// The voxel world behind the interface: the island map and the battle stage. React drives it through this small API.
import * as THREE from 'three';
import type { Sprite } from '@/game/sprites';
import { PALETTES, browser, castle, classBoard, clockTower, cloud, computer, layerTower, makeIsland, meshOf, questionMark, seeded, spriteVoxels, tree, unitBox, voxelMaterial, waterfall, type VoxelSet } from './voxels';

export type Rect = { x: number; y: number; w: number; h: number };
// The part of the canvas not covered by panels. The camera frames its subject inside this box.
export type RectSource = (w: number, h: number) => Rect;
export type SceneOptions = {
  monsters: Record<number, Sprite>; robot: Sprite; colors: Record<number, string>;
  reduce: boolean; onPick: (world: number) => void;
};
export type GameScene = ReturnType<typeof createScene>;

// Seven World islands, then the exam castle.
const EXAM = 8;
const ISLAND_IDS = [1, 2, 3, 4, 5, 6, 7, EXAM];
const WIDE: Record<number, [number, number, number]> = { 1: [-66, 6, 0], 2: [-47, -9, 2], 3: [-28, 8, -1], 4: [-9, -9, 2], 5: [10, 7, 0], 6: [29, -9, 1], 7: [48, 7, 0], 8: [66, -13, 4] };
const TALL: Record<number, [number, number, number]> = { 1: [-9, 52, 0], 2: [9, 37, 1], 3: [-9, 22, 0], 4: [9, 7, 1], 5: [-9, -8, 0], 6: [9, -23, 1], 7: [-9, -38, 0], 8: [8, -54, 2] };
const SEEDS: Record<number, number> = { 1: 11, 2: 22, 3: 37, 4: 41, 5: 59, 6: 67, 7: 83, 8: 73 };
const RADII: Record<number, number> = { 1: 10, 2: 11, 3: 10, 4: 10, 5: 11, 6: 10, 7: 10, 8: 9 };

type Fighter = THREE.Group & { userData: { inner: THREE.Group; mesh: THREE.InstancedMesh; mat: THREE.MeshStandardMaterial; scale: number } };
type Particle = { life: number; max: number; p: THREE.Vector3; v: THREE.Vector3; size: number; g: number; floor: number; rot: number };
type Shard = { p: THREE.Vector3; v: THREE.Vector3; r: number; w: number };
type Battle = {
  w: number; mon: Fighter; rob: Fighter; shotM: THREE.Mesh; shotG: THREE.Sprite; h: number;
  shot: { from: THREE.Vector3; to: THREE.Vector3; t: number; tier: number; done: () => void } | null;
  flash: number; squash: number; robHit: number; lunge: number; happy: boolean;
  shatter: { mesh: THREE.InstancedMesh; items: Shard[]; s: number; t: number } | null;
};

export function createScene(canvas: HTMLCanvasElement, stage: HTMLElement, opts: SceneOptions) {
  const { reduce, monsters, robot, colors } = opts;
  const phone = Math.min(innerWidth, innerHeight) < 600;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.75 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0xffffff, 60, 300);
  scene.fog = fog;
  const cam = new THREE.PerspectiveCamera(24, 1, 1, 1200);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x445544, 1.5);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06;
  scene.add(hemi, sun, sun.target);

  const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color(), tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  const glowTexture = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  function fighter(sprite: Sprite, scale: number, seed: number) {
    const g = new THREE.Group() as Fighter, inner = new THREE.Group(), mat = voxelMaterial();
    const mesh = meshOf(spriteVoxels(sprite), { jitter: .02, seed, mat });
    inner.add(mesh); g.add(inner); inner.scale.setScalar(scale);
    g.userData = { inner, mesh, mat, scale };
    return g;
  }
  const disposeTree = (o: THREE.Object3D) => o.traverse(c => {
    if (c instanceof THREE.InstancedMesh) { (c.material as THREE.Material).dispose(); c.dispose(); }
  });

  /* ---------- map ---------- */
  const mapRoot = new THREE.Group(); mapRoot.visible = false; scene.add(mapRoot);
  const isles: Record<number, THREE.Group> = {};
  const clouds: THREE.InstancedMesh[] = [];
  let drops: { mesh: THREE.InstancedMesh; seeds: { z: number; o: number }[]; x: number; y: number; z: number } | null = null;
  let stones: THREE.InstancedMesh | null = null;
  let tall = false, mapBuilt = false, cloudSpan = 90;

  function buildMap() {
    mapBuilt = true;
    for (const id of ISLAND_IDS) {
      const pal = PALETTES[id], set = makeIsland(SEEDS[id], RADII[id], pal), g = new THREE.Group();
      let labelY = 13, dropAt: { x: number; y: number; z: number } | null = null;
      if (id === 1) { computer(set, -6, 1, -5); tree(set, -7, 4, pal, 3); tree(set, 6, -6, pal, 4); }
      if (id === 2) { dropAt = waterfall(set, -6, 1, pal); tree(set, -7, -6, pal, 4); tree(set, -7, 6, pal, 3); labelY = 15; }
      if (id === 3) { clockTower(set, -4, 1, -3); tree(set, 5, -6, pal, 3); labelY = 22; }
      if (id === 4) { questionMark(set, -6, 1, -3); tree(set, -6, 5, pal, 3); tree(set, 6, -5, pal, 4); labelY = 15; }
      if (id === 5) { browser(set, -3, 2, -5); tree(set, -7, 4, pal, 3); labelY = 15; }
      if (id === 6) { layerTower(set, -4, 1, -3); tree(set, 6, -5, pal, 3); labelY = 22; }
      if (id === 7) { classBoard(set, -2, 1, -6); tree(set, -7, 4, pal, 3); tree(set, 7, -4, pal, 4); labelY = 17; }
      if (id === EXAM) { castle(set, 0, 1, -2); labelY = 20; }
      g.add(meshOf(set, { seed: SEEDS[id] }));
      if (id !== EXAM) {
        const m = fighter(monsters[id], .36, id);
        m.position.set(id === 3 ? 4 : id === 2 ? -4 : 3, id === 2 ? 1.5 : set.topAt(3, 3) + .5, id === 2 ? 6 : 4);
        m.rotation.y = .28; g.add(m); g.userData.mon = m;
      }
      if (dropAt) {
        const n = phone ? 24 : 42;
        const mesh = new THREE.InstancedMesh(unitBox, new THREE.MeshBasicMaterial({ color: '#b8eeff' }), n);
        mesh.frustumCulled = false;
        g.add(mesh);
        drops = { mesh, seeds: Array.from({ length: n }, (_, i) => ({ z: (i % 3) - 1, o: i / n })), ...dropAt };
      }
      g.userData.labelY = labelY; g.userData.phase = id * 1.3;
      mapRoot.add(g); isles[id] = g;
    }
    for (let i = 0; i < 12; i++) {
      const c = cloud(100 + i);
      c.scale.setScalar(1.2 + (i % 3) * .5);
      c.userData.speed = .6 + (i % 4) * .25;
      mapRoot.add(c); clouds.push(c);
    }
    layoutIslands();
  }

  function layoutIslands() {
    const pos = tall ? TALL : WIDE;
    for (const id of ISLAND_IDS) {
      const [x, z, y] = pos[id];
      isles[id].position.set(x, y, z); isles[id].userData.y0 = y;
    }
    if (stones) { mapRoot.remove(stones); disposeTree(stones); }
    const set = makeIsland(0, 0, PALETTES[1]);
    for (let k = 0; k < ISLAND_IDS.length - 1; k++) {
      const a = pos[ISLAND_IDS[k]], b = pos[ISLAND_IDS[k + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 3.4);
      for (let i = 0; i <= n; i++) {
        const f = i / n, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f;
        if (Math.hypot(x - a[0], z - a[1]) < 10.5 || Math.hypot(x - b[0], z - b[1]) < 9.5) continue;
        const y = Math.round(a[2] + (b[2] - a[2]) * f + 1 - Math.sin(f * Math.PI) * 1.5);
        set.box(Math.round(x), y, Math.round(z), 2, 1, 2, i % 2 ? '#f2d38a' : '#e8c26f');
      }
    }
    set.del(0, 0, 0); set.del(0, -1, 0);
    stones = meshOf(set, { seed: 5 }); mapRoot.add(stones);
    cloudSpan = tall ? 45 : 110;
    clouds.forEach((c, i) => c.position.set((i / 12 * 2 - 1) * cloudSpan, -20 - (i % 3) * 8, tall ? (i / 12 * 2 - 1) * 78 : -34 + (i % 4) * 24));
  }

  /* ---------- camera ---------- */
  const camNow = { c: new THREE.Vector3(), d: 200 };
  const camGoal = { c: new THREE.Vector3(), d: 200, k: 3.6 };
  const DIR_MAP = new THREE.Vector3(.3, .64, 1).normalize(), DIR_BATTLE = new THREE.Vector3(0, .3, 1).normalize();
  let camDir = DIR_MAP, W = 1, H = 1, shake = 0, dragYaw = 0, dragGoal = 0, parX = 0, parY = 0, parXGoal = 0, parYGoal = 0;
  let mode: 'idle' | 'map' | 'battle' = 'idle', rectSource: RectSource | null = null, selected = 1, over = false, baseD = 200;

  const rectNow = (): Rect => rectSource ? rectSource(W, H) : { x: 0, y: 0, w: W, h: H };
  function applyView(r: Rect) {
    cam.aspect = W / H;
    cam.setViewOffset(W, H, W / 2 - (r.x + r.w / 2), H / 2 - (r.y + r.h / 2), W, H);
    cam.updateProjectionMatrix();
  }
  const fitDist = (ex: number, ey: number, r: Rect) => {
    const tn = Math.tan(cam.fov * Math.PI / 360);
    return Math.max(ey / (tn * r.h / H), ex / (tn * (W / H) * r.w / W));
  };
  function frameMap() {
    const pos = tall ? TALL : WIDE;
    const right = new THREE.Vector3().crossVectors(UP, DIR_MAP).normalize(), up = new THREE.Vector3().crossVectors(DIR_MAP, right);
    let xa = Infinity, xb = -Infinity, ya = Infinity, yb = -Infinity;
    for (const id of ISLAND_IDS) {
      const [x, z, y] = pos[id], v = new THREE.Vector3(x, y, z), rd = id === EXAM ? 9 : 11, px = v.dot(right), py = v.dot(up);
      xa = Math.min(xa, px - rd); xb = Math.max(xb, px + rd); ya = Math.min(ya, py - 9); yb = Math.max(yb, py + 18);
    }
    const overview = right.clone().multiplyScalar((xa + xb) / 2).add(up.clone().multiplyScalar((ya + yb) / 2));
    const r = rectNow();
    applyView(r);
    baseD = fitDist((xb - xa) / 2 * (tall ? 1.02 : 1.12), (yb - ya) / 2 * 1.02, r);
    camGoal.c.copy(overview).lerp(isles[selected].position, .04);
    camGoal.d = baseD;
  }
  function frameBattle() {
    const r = rectNow();
    applyView(r);
    camGoal.c.set(0, 3.6, 1);
    camGoal.d = over ? fitDist(30, 14, r) : fitDist(16.5, r.w / r.h < 1 ? 7.5 : 7.3, r);
  }
  function setShadowArea(radius: number) {
    const c = sun.shadow.camera;
    c.left = -radius; c.right = radius; c.top = radius; c.bottom = -radius; c.near = 1; c.far = 340;
    c.updateProjectionMatrix();
  }
  function reframe() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    const nextTall = W / H < .92;
    if (nextTall !== tall) { tall = nextTall; if (mapBuilt) layoutIslands(); }
    if (mode === 'map') { setShadowArea(tall ? 80 : 100); frameMap(); }
    if (mode === 'battle') frameBattle();
    dirty = true;
  }

  /* ---------- battle ---------- */
  const battleRoot = new THREE.Group(); scene.add(battleRoot);
  let B: Battle | null = null;
  const POOL = phone ? 180 : 320;
  const pool = new THREE.InstancedMesh(unitBox, new THREE.MeshBasicMaterial(), POOL);
  pool.frustumCulled = false; pool.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const parts: Particle[] = Array.from({ length: POOL }, (_, i) => {
    pool.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
    pool.setColorAt(i, tmpC.set('#ffffff'));
    return { life: 0, max: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), size: 0, g: 0, floor: 0, rot: 0 };
  });
  scene.add(pool);
  let head = 0;
  function spawn(p: THREE.Vector3, v: THREE.Vector3, color: string, size: number, life: number, g = 26, floor = -99) {
    const it = parts[head];
    pool.setColorAt(head, tmpC.set(color)); pool.instanceColor!.needsUpdate = true;
    it.p.copy(p); it.v.copy(v); it.size = size; it.life = life; it.max = life; it.g = g; it.floor = floor; it.rot = Math.random() * 6;
    head = (head + 1) % POOL;
  }
  function clearBattle() {
    B?.shot?.done();
    while (battleRoot.children.length) { const c = battleRoot.children[0]; battleRoot.remove(c); disposeTree(c); }
    B = null;
    parts.forEach(p => { p.life = 0; });
  }
  function buildBattle(w: number) {
    clearBattle();
    const pal = PALETTES[w], set: VoxelSet = makeIsland(200 + w, 23, pal, .42);
    if (w === 1) computer(set, -5, 1, -11);
    if (w === 2) waterfall(set, -8, 1, pal, 3, -12);
    if (w === 3) clockTower(set, 0, 1, -11);
    if (w === 4) questionMark(set, -2, 1, -10);
    if (w === 5) browser(set, -2, 2, -12);
    if (w === 6) layerTower(set, -1, 1, -12);
    if (w === 7) classBoard(set, -1, 1, -12);
    tree(set, -16, -9, pal, 5); tree(set, 15, -11, pal, 4); tree(set, 18, 2, pal, 3); tree(set, -19, 3, pal, 3);
    // Level grass where the two fighters stand.
    for (let x = -15; x <= 15; x++) for (let z = -3; z <= 6; z++) {
      if (!set.onLand(x, z)) continue;
      for (let y = 1; y <= 3; y++) set.del(x, y, z);
      set.set(x, 0, z, (x + z * 3) % 5 === 0 ? pal.grass2 : pal.grass);
    }
    battleRoot.add(meshOf(set, { seed: 200 + w }));
    // Far islands add depth behind the fight.
    [[-46, -70, -8, 7, 1], [40, -90, 2, 9, 2], [0, -130, -14, 11, 3]].forEach(([x, z, y, r, s]) => {
      const m = meshOf(makeIsland(400 + s + w, r, pal, .8), { seed: s, cast: false, receive: false });
      m.position.set(x, y, z); battleRoot.add(m);
    });
    for (let i = 0; i < 5; i++) {
      const c = cloud(300 + i);
      c.position.set(-44 + i * 22, i % 2 ? 7 : -14, -58 - i * 8);
      c.scale.setScalar(1.3); c.userData.speed = .5;
      battleRoot.add(c);
    }
    const scale = .62, mon = fighter(monsters[w], scale, w), rob = fighter(robot, .52, 9);
    mon.position.set(9.5, .5, 2); mon.rotation.y = -.3;
    rob.position.set(-9.5, .5, 2); rob.rotation.y = .3;
    const shotM = new THREE.Mesh(unitBox, new THREE.MeshBasicMaterial({ color: '#ffd451' }));
    const shotG = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: '#ffc531', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    shotM.visible = shotG.visible = false;
    battleRoot.add(mon, rob, shotM, shotG);
    B = { w, mon, rob, shotM, shotG, shot: null, flash: 0, squash: 0, robHit: 0, lunge: 0, shatter: null, happy: false, h: monsters[w].rows.length * scale };
  }
  function hitEffects(tier: number) {
    if (!B || reduce) return;
    const m = B.mon, c = new THREE.Vector3(m.position.x - 1, B.h * .55, 2.4), col = colors[B.w];
    B.flash = 1; B.squash = 1; shake = [0, .14, .3, .62][tier];
    const n = [0, 10, 18, 34][tier];
    for (let i = 0; i < n; i++) spawn(c, tmpV.set(Math.random() * 10 - 8, 4 + Math.random() * 9, (Math.random() - .5) * 9), i % 3 ? col : '#ffd451', .28 + Math.random() * .3, .9, 26, .3);
  }
  function shatterMonster() {
    if (!B) return;
    const m = B.mon;
    m.visible = false;
    if (reduce) return;
    const list = m.userData.mesh.userData.list as [number, number, number, string][], s = m.userData.scale;
    const mesh = new THREE.InstancedMesh(unitBox, voxelMaterial(), list.length);
    mesh.castShadow = true; mesh.frustumCulled = false;
    const cy = B.h / 2, cos = Math.cos(m.rotation.y), sin = Math.sin(m.rotation.y);
    const items = list.map(([x, y, z, c], i): Shard => {
      const lx = x * s, ly = y * s, lz = z * s;
      mesh.setColorAt(i, tmpC.set(c));
      return {
        p: new THREE.Vector3(m.position.x + lx * cos + lz * sin, m.position.y + ly, m.position.z - lx * sin + lz * cos),
        v: new THREE.Vector3(lx * 2.3 + (Math.random() - .5) * 5, 7 + (ly - cy) * 1.4 + Math.random() * 8, lz * 2.5 + (Math.random() - .5) * 7),
        r: Math.random() * 6, w: (Math.random() - .5) * 9,
      };
    });
    battleRoot.add(mesh);
    B.shatter = { mesh, items, s, t: 0 };
    shake = .95;
    const o = new THREE.Vector3(m.position.x, cy, m.position.z);
    for (let i = 0; i < 30; i++) spawn(o, tmpV.set((Math.random() - .5) * 18, 6 + Math.random() * 14, (Math.random() - .5) * 16), '#ffd451', .3, 1.2, 28, .3);
  }

  /* ---------- frame loop ---------- */
  let raf = 0, last = performance.now(), time = 0, dirty = true;
  const ease = (rate: number, dt: number) => (reduce ? 1 : 1 - Math.exp(-dt * rate));

  function placeCamera(yaw: number, pit: number) {
    const d = tmpV.copy(camDir).applyAxisAngle(UP, yaw);
    d.y += pit;
    cam.position.copy(camNow.c).addScaledVector(d.normalize(), camNow.d);
  }
  function tickMap(dt: number) {
    placeCamera(dragYaw + (reduce ? 0 : Math.sin(time * .16) * .05) + parX * .05, parY * .03);
    for (const id of ISLAND_IDS) {
      const g = isles[id], m = g.userData.mon as Fighter | undefined;
      g.position.y = g.userData.y0 + (reduce ? 0 : Math.sin(time * .8 + g.userData.phase) * .35);
      if (m && !reduce) { const q = Math.sin(time * 2.4 + id * 1.7), s = m.userData.scale; m.userData.inner.scale.set(s * (1 + q * .02), s * (1 - q * .03), s); }
    }
    if (!reduce) clouds.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > cloudSpan + 20) c.position.x = -cloudSpan - 20; });
    if (drops) {
      const d = drops;
      d.seeds.forEach((s, i) => {
        const f = reduce ? s.o : (time * .5 + s.o) % 1;
        d.mesh.setMatrixAt(i, tmpM.compose(tmpV.set(d.x + f * 2.8, d.y - f * f * 26, d.z + s.z + Math.sin(i) * .5), tmpQ.identity(), tmpS.setScalar(.72 - f * .3)));
      });
      d.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  function tickBattle(dt: number) {
    const b = B!;
    placeCamera(parX * .09 + (reduce ? 0 : Math.sin(time * .3) * .025), parY * .03);
    if (shake > .002) { cam.position.x += (Math.random() - .5) * shake * 1.6; cam.position.y += (Math.random() - .5) * shake * 1.6; shake *= Math.exp(-dt * 8); }
    if (!reduce) {
      const mi = b.mon.userData.inner, ms = b.mon.userData.scale, ri = b.rob.userData.inner, q = Math.sin(time * 2.6), sq = b.squash;
      mi.scale.set(ms * (1 + q * .02 + sq * .16), ms * (1 - q * .03 - sq * .2), ms * (1 + sq * .1));
      mi.position.x = Math.sin(sq * 14) * sq * .7 - b.lunge * 6 * Math.sin((1 - b.lunge) * Math.PI);
      b.mon.userData.mat.emissive.setRGB(b.flash, b.flash, b.flash); b.mon.userData.mat.emissiveIntensity = b.flash * .55;
      b.flash = Math.max(0, b.flash - dt * 4.5); b.squash = Math.max(0, b.squash - dt * 3.6); b.lunge = Math.max(0, b.lunge - dt * 2.2);
      ri.position.y = b.happy ? Math.abs(Math.sin(time * 5)) * 1.4 : Math.abs(Math.sin(time * 1.8)) * .12;
      ri.position.x *= Math.exp(-dt * 10);
      b.rob.userData.mat.emissive.setRGB(b.robHit, b.robHit * .2, b.robHit * .25); b.rob.userData.mat.emissiveIntensity = b.robHit;
      ri.rotation.z = Math.sin(b.robHit * 12) * b.robHit * .22;
      b.robHit = Math.max(0, b.robHit - dt * 3);
    }
    if (b.shot) {
      const s = b.shot;
      s.t += dt / .3;
      const f = Math.min(1, s.t);
      tmpV.lerpVectors(s.from, s.to, f * f); tmpV.y += Math.sin(f * Math.PI) * .8;
      b.shotM.position.copy(tmpV); b.shotG.position.copy(tmpV);
      b.shotM.rotation.x += dt * 14; b.shotM.rotation.y += dt * 11;
      if (s.tier > 1) spawn(tmpV, tmpS.set(-2, Math.random() * 2, (Math.random() - .5) * 2), '#ffd451', .22 * s.tier, .3, 2);
      if (f >= 1) { b.shotM.visible = b.shotG.visible = false; b.shot = null; s.done(); }
    }
    if (b.shatter) {
      const sh = b.shatter;
      sh.t += dt;
      const shrink = Math.max(0, 1 - Math.max(0, sh.t - 1.3) / .7);
      sh.items.forEach((it, i) => {
        it.v.y -= 30 * dt; it.p.addScaledVector(it.v, dt); it.r += it.w * dt;
        if (it.p.y < .8 && Math.abs(it.p.x) < 21) { it.p.y = .8; it.v.y *= -.42; it.v.x *= .7; it.v.z *= .7; it.w *= .6; }
        sh.mesh.setMatrixAt(i, tmpM.compose(it.p, tmpQ.setFromAxisAngle(tmpS.set(1, .4, .2).normalize(), it.r), tmpS.setScalar(sh.s * 1.02 * shrink)));
      });
      sh.mesh.instanceMatrix.needsUpdate = true;
      if (shrink <= 0) { battleRoot.remove(sh.mesh); disposeTree(sh.mesh); b.shatter = null; }
    }
    if (!reduce) battleRoot.children.forEach(c => {
      if (c.userData.speed) { c.position.x += c.userData.speed * dt; if (c.position.x > 60) c.position.x = -60; }
    });
  }
  function tickParticles(dt: number) {
    let changed = false;
    parts.forEach((p, i) => {
      if (p.life <= 0) {
        if (p.max) { pool.setMatrixAt(i, tmpM.makeScale(0, 0, 0)); p.max = 0; changed = true; }
        return;
      }
      changed = true;
      p.life -= dt; p.v.y -= p.g * dt; p.p.addScaledVector(p.v, dt); p.rot += dt * 5;
      if (p.p.y < p.floor) { p.p.y = p.floor; p.v.y *= -.45; p.v.x *= .7; p.v.z *= .7; }
      const size = Math.max(0, p.size * Math.min(1, p.life / p.max * 2.4));
      pool.setMatrixAt(i, tmpM.compose(p.p, tmpQ.setFromAxisAngle(tmpS.set(.5, 1, .3).normalize(), p.rot), tmpS.setScalar(size)));
    });
    if (changed) pool.instanceMatrix.needsUpdate = true;
  }
  const labels: Record<number, HTMLElement | null> = {};
  function placeLabels() {
    for (const id of ISLAND_IDS) {
      const el = labels[id];
      if (!el) continue;
      tmpV.copy(isles[id].position); tmpV.y += isles[id].userData.labelY; tmpV.project(cam);
      el.style.transform = `translate(${((tmpV.x + 1) / 2 * W).toFixed(1)}px, ${((1 - tmpV.y) / 2 * H).toFixed(1)}px) translate(-50%, -100%)`;
    }
  }
  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, .08);
    last = now;
    if ((reduce && !dirty) || mode === 'idle') return;
    if (!reduce) time += dt;
    const k = ease(camGoal.k, dt);
    camNow.c.lerp(camGoal.c, k); camNow.d += (camGoal.d - camNow.d) * k;
    dragYaw += (dragGoal - dragYaw) * ease(7, dt);
    parX += (parXGoal - parX) * ease(3, dt); parY += (parYGoal - parY) * ease(3, dt);
    if (mode === 'map') tickMap(dt);
    else if (B) tickBattle(dt);
    tickParticles(dt);
    fog.near = camNow.d + 25; fog.far = camNow.d + 260;
    sun.position.set(camNow.c.x + 42, 80, camNow.c.z + 34); sun.target.position.copy(camNow.c);
    cam.lookAt(camNow.c);
    renderer.render(scene, cam);
    if (mode === 'map') placeLabels();
    dirty = false;
  }

  /* ---------- pointer ---------- */
  let drag: { x: number; sx: number; sy: number } | null = null;
  const onDown = (e: PointerEvent) => { drag = { x: e.clientX, sx: e.clientX, sy: e.clientY }; canvas.setPointerCapture?.(e.pointerId); };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    parXGoal = ((e.clientX - r.left) / r.width - .5) * 2; parYGoal = ((e.clientY - r.top) / r.height - .5) * 2;
    if (drag && mode === 'map') { dragGoal = Math.max(-.7, Math.min(.7, dragGoal + (e.clientX - drag.x) * -.004)); drag.x = e.clientX; dirty = true; }
  };
  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy);
    drag = null;
    if (mode !== 'map') return;
    dragGoal = 0;
    if (moved >= 8) return;
    const r = canvas.getBoundingClientRect();
    let best = 0, bestD = 90;
    for (const id of ISLAND_IDS) {
      tmpV.copy(isles[id].position); tmpV.y += 3; tmpV.project(cam);
      const dist = Math.hypot((tmpV.x + 1) / 2 * W - (e.clientX - r.left), (1 - tmpV.y) / 2 * H - (e.clientY - r.top));
      if (dist < bestD) { bestD = dist; best = id; }
    }
    if (best) opts.onPick(best);
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  const resizer = new ResizeObserver(reframe);
  resizer.observe(stage);
  raf = requestAnimationFrame(tick);

  return {
    setTheme(isDark: boolean) {
      if (isDark) {
        hemi.color.set('#6d6fd6'); hemi.groundColor.set('#2c2158'); hemi.intensity = 1.8;
        sun.color.set('#c6ceff'); sun.intensity = 1.5;
        fog.color.set('#3a2c75');
      } else {
        hemi.color.set('#d9f2ff'); hemi.groundColor.set('#8c9a6a'); hemi.intensity = 1.55;
        sun.color.set('#fff0d0'); sun.intensity = 2.3;
        fog.color.set('#d9f0ea');
      }
      dirty = true;
    },
    showMap(world: number, source: RectSource) {
      const first = !mapBuilt, from = mode;
      clearBattle();
      selected = world; rectSource = source; over = false; mode = 'map'; camDir = DIR_MAP; mapRoot.visible = true;
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      tall = W / H < .92;
      if (first) buildMap(); else layoutIslands();
      camGoal.k = from === 'idle' ? 3.6 : 2.8;
      reframe();
      camNow.c.copy(camGoal.c); camNow.d = camGoal.d * (from === 'idle' ? 1.08 : .86);
    },
    select(world: number) {
      selected = world; camGoal.k = 3.6;
      if (mode === 'map') frameMap();
      dirty = true;
    },
    // Flies into an island, then the caller swaps to the battle.
    dive(world: number) {
      if (reduce || mode !== 'map') return Promise.resolve();
      camGoal.c.copy(isles[world].position); camGoal.d = baseD * .28; camGoal.k = 5.5;
      return new Promise<void>(res => setTimeout(res, 560));
    },
    showBattle(world: number, source: RectSource) {
      rectSource = source; over = false; mode = 'battle'; camDir = DIR_BATTLE; mapRoot.visible = false;
      buildBattle(world);
      setShadowArea(36); camGoal.k = 3.2;
      reframe();
      camNow.c.copy(camGoal.c); camNow.d = camGoal.d * 1.2;
    },
    reframe,
    setOver() { over = true; reframe(); },
    // Resolves when the shot lands.
    fire(tier: number) {
      return new Promise<void>(res => {
        const land = () => { hitEffects(tier); dirty = true; res(); };
        if (!B || reduce) { land(); return; }
        const size = [0, .7, 1.2, 1.9][tier];
        B.shotM.visible = B.shotG.visible = true;
        B.shotM.scale.setScalar(size); B.shotG.scale.setScalar(size * 5);
        (B.shotM.material as THREE.MeshBasicMaterial).color.set(tier === 3 ? '#fff4c8' : '#ffd451');
        B.shot = { from: new THREE.Vector3(B.rob.position.x + 2.6, 3.4, 2.4), to: new THREE.Vector3(B.mon.position.x, B.h * .55, 2.4), t: 0, tier, done: land };
        B.rob.userData.inner.position.x = -.5;
      });
    },
    miss() {
      if (!B || reduce) return;
      B.lunge = 1;
      setTimeout(() => {
        if (!B) return;
        B.robHit = 1; shake = .22;
        const c = new THREE.Vector3(B.rob.position.x + 1, 3, 2.4);
        for (let i = 0; i < 10; i++) spawn(c, tmpV.set(-Math.random() * 6, 3 + Math.random() * 7, (Math.random() - .5) * 7), '#ff5d73', .26, .7, 26, .3);
      }, 200);
    },
    shatter() { shatterMonster(); dirty = true; },
    confetti() {
      if (!B || reduce) return;
      B.happy = true;
      const cols = ['#ffd451', colors[B.w], '#ffffff', '#43e0a6'], rnd = seeded(Date.now() % 9973);
      for (let i = 0; i < (phone ? 80 : 140); i++) setTimeout(() => {
        if (B) spawn(tmpV.set((rnd() - .5) * 34, 20 + rnd() * 6, (rnd() - .5) * 12), tmpS.set((rnd() - .5) * 3, -4 - rnd() * 3, (rnd() - .5) * 3), cols[i % 4], .34, 3.4, 3, -1);
      }, i * 14);
    },
    // Where damage numbers appear, in stage pixels.
    monsterPx() {
      if (!B) return null;
      const m = B.mon;
      tmpV.set(m.position.x, m.position.y + B.h * .72, m.position.z).project(cam);
      return { x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H };
    },
    setLabel(world: number, el: HTMLElement | null) { labels[world] = el; dirty = true; },
    dispose() {
      cancelAnimationFrame(raf);
      resizer.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      clearBattle();
      disposeTree(mapRoot);
      glowTexture.dispose();
      renderer.dispose();
    },
  };
}

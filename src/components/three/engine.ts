/**
 * ──────────────────────────────────────────────────────────────────────────
 *  The 3D engine: ONE WebGL renderer per page, shared by every set piece on it.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * The renderer draws into one fixed, full-viewport, transparent canvas (see Stage3D.tsx).
 * Each set piece registers a "view": a DOM element (its box on the page), a scene and a camera.
 * Every frame the engine finds where each view's element is on screen and draws that scene
 * into exactly that rectangle (viewport + scissor). The page ground shows through everywhere
 * else, so scenes sit on the page like any other element, and a page never needs a second
 * WebGL context.
 *
 * Rendering is on demand: a frame is drawn only when a view says it is still moving, a view
 * asked for one (`invalidate`), or a view's box moved. Nothing runs while no view is on screen
 * or the tab is hidden.
 *
 * Colour pipeline (addendum §5): sRGB output, AgX tone mapping, colour and emissive textures in
 * sRGB (GLTFLoader already tags them), everything else linear. HDRIs go through PMREM and are
 * used only as `scene.environment` (reflections), never as the background.
 *
 * This file imports three.js, so it is only ever loaded with a dynamic import, after first paint,
 * on pages that have a set piece.
 */
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import type { Quality } from "@/lib/three/quality";

/** Change here to try another tone curve for every scene (AgX keeps highlights natural on metal). */
export const TONE_MAPPING = THREE.AgXToneMapping;

export type ViewSize = { w: number; h: number };

export type ViewSpec = {
  /** The DOM box this view draws into. Its size is the camera's aspect. */
  element: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** Per frame while on screen. Return true while anything is still moving (keeps frames coming). */
  update?: (dt: number, time: number, size: ViewSize) => boolean;
  /** After each draw, e.g. to project hotspots onto the DOM. */
  afterRender?: (size: ViewSize) => void;
  /** The element changed size. */
  resize?: (size: ViewSize) => void;
  /** Tone mapping exposure for this view (default 1). */
  exposure?: () => number;
};

type ViewEntry = {
  spec: ViewSpec;
  visible: boolean;
  dirty: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Progress = { loaded: number; total: number };

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly quality: Quality;
  private pmrem: THREE.PMREMGenerator;
  private gltf: GLTFLoader;
  private hdr: HDRLoader;
  private models = new Map<string, Promise<GLTF>>();
  private envs = new Map<string, Promise<THREE.Texture>>();
  private progress = new Map<string, Progress>();
  private progressListeners = new Set<(fraction: number) => void>();
  private views = new Set<ViewEntry>();
  private drawn: ViewEntry[] = [];
  private io: IntersectionObserver;
  private raf = 0;
  private last = performance.now();
  private t0 = performance.now();
  private size = { w: 0, h: 0 };
  private disposed = false;
  private onVisibility = () => this.wake();
  private onResize = () => {
    for (const v of this.views) v.dirty = true;
    this.wake();
  };

  constructor(
    private canvas: HTMLCanvasElement,
    quality: Quality,
  ) {
    this.quality = quality;
    const r = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    r.setPixelRatio(quality.dpr);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = TONE_MAPPING;
    r.toneMappingExposure = 1;
    r.shadowMap.enabled = quality.shadows;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setClearColor(0x000000, 0);
    r.autoClear = false;
    this.renderer = r;

    this.pmrem = new THREE.PMREMGenerator(r);
    this.gltf = new GLTFLoader();
    this.gltf.setMeshoptDecoder(MeshoptDecoder);
    this.hdr = new HDRLoader();

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          for (const v of this.views) if (v.spec.element === e.target) v.visible = e.isIntersecting;
        }
        this.wake();
      },
      { rootMargin: "120px 0px" },
    );
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);
  }

  // ── Views ──

  /** Register a view; returns a function that removes it. */
  addView(spec: ViewSpec) {
    const entry: ViewEntry = { spec, visible: false, dirty: true, x: NaN, y: NaN, w: 0, h: 0 };
    this.views.add(entry);
    this.io.observe(spec.element);
    this.wake();
    return () => {
      this.io.unobserve(spec.element);
      this.views.delete(entry);
      this.wake();
    };
  }

  /** Ask for a fresh frame (after changing something outside `update`). */
  invalidate() {
    for (const v of this.views) v.dirty = true;
    this.wake();
  }

  private wake() {
    if (this.disposed || this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private syncSize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w !== this.size.w || h !== this.size.h) {
      this.size = { w, h };
      this.renderer.setSize(w, h, false);
      return true;
    }
    return false;
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (this.disposed || document.hidden) return;
    const onScreen = [...this.views].filter((v) => v.visible);
    if (!onScreen.length) {
      // Clear once so no stale frame lingers, then sleep until a view comes back.
      this.renderer.setScissorTest(false);
      this.renderer.clear();
      this.drawn = [];
      return;
    }
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const time = (now - this.t0) / 1000;
    let dirty = this.syncSize();
    const cr = this.canvas.getBoundingClientRect();
    const H = this.size.h;

    const draws: ViewEntry[] = [];
    for (const v of onScreen) {
      const r = v.spec.element.getBoundingClientRect();
      const x = Math.round(r.left - cr.left);
      const y = Math.round(r.top - cr.top);
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w < 2 || h < 2 || y + h <= 0 || y >= H) continue;
      if (w !== v.w || h !== v.h) {
        v.w = w;
        v.h = h;
        v.spec.resize?.({ w, h });
        v.dirty = true;
      }
      if (x !== v.x || y !== v.y) {
        v.x = x;
        v.y = y;
        v.dirty = true;
      }
      const moving = v.spec.update?.(dt, time, { w, h }) ?? false;
      if (moving || v.dirty) dirty = true;
      draws.push(v);
    }
    // A view that scrolled out of the canvas (but is still within the observer's margin) must be
    // cleared away, or its last frame lingers over the page.
    if (draws.length !== this.drawn.length || draws.some((v, i) => v !== this.drawn[i])) dirty = true;
    this.drawn = draws;

    if (dirty) {
      const r = this.renderer;
      r.setScissorTest(false);
      r.clear();
      r.setScissorTest(true);
      for (const v of draws) {
        const bottom = H - (v.y + v.h);
        r.setViewport(v.x, bottom, v.w, v.h);
        // Scissor to the part of the box that is on the canvas.
        const sy = Math.max(0, bottom);
        const sh = Math.min(H, bottom + v.h) - sy;
        r.setScissor(v.x, sy, v.w, Math.max(0, sh));
        r.toneMappingExposure = v.spec.exposure?.() ?? 1;
        r.render(v.spec.scene, v.spec.camera);
        v.dirty = false;
        v.spec.afterRender?.({ w: v.w, h: v.h });
      }
      r.setScissorTest(false);
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  // ── Loading ──

  /** 0..1 across everything requested so far (for the loading readout). */
  onProgress(fn: (fraction: number) => void) {
    this.progressListeners.add(fn);
    fn(this.fraction());
    return () => this.progressListeners.delete(fn);
  }

  private fraction() {
    let l = 0;
    let t = 0;
    for (const p of this.progress.values()) {
      l += p.loaded;
      t += p.total;
    }
    return t ? Math.min(1, l / t) : 0;
  }

  private track(url: string, estimateKb: number) {
    this.progress.set(url, { loaded: 0, total: estimateKb * 1024 });
    return (e: ProgressEvent) => {
      const p = this.progress.get(url)!;
      if (e.lengthComputable && e.total) p.total = e.total;
      p.loaded = e.loaded;
      const f = this.fraction();
      this.progressListeners.forEach((fn) => fn(f));
    };
  }

  private done(url: string) {
    const p = this.progress.get(url);
    if (p) p.loaded = p.total;
    const f = this.fraction();
    this.progressListeners.forEach((fn) => fn(f));
  }

  /**
   * Load a GLB (cached per page). Returns a fresh clone of its scene, prepared for lighting:
   * meshes cast and receive shadows, colour maps get full anisotropic filtering.
   */
  async loadModel(url: string, estimateKb = 300): Promise<THREE.Group> {
    let p = this.models.get(url);
    if (!p) {
      p = new Promise<GLTF>((resolve, reject) => {
        this.gltf.load(
          url,
          (g) => {
            this.done(url);
            resolve(g);
          },
          this.track(url, estimateKb),
          reject,
        );
      });
      this.models.set(url, p);
    }
    const g = await p;
    const root = g.scene.clone(true);
    const aniso = this.renderer.capabilities.getMaxAnisotropy();
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        const s = mat as THREE.MeshStandardMaterial;
        for (const t of [s.map, s.normalMap, s.roughnessMap, s.metalnessMap, s.aoMap]) if (t) t.anisotropy = aniso;
      }
    });
    return root;
  }

  /** Load an HDRI and pre-filter it for image-based lighting (cached per page). */
  loadEnvironment(url: string, estimateKb = 1600): Promise<THREE.Texture> {
    let p = this.envs.get(url);
    if (!p) {
      p = new Promise<THREE.Texture>((resolve, reject) => {
        this.hdr.load(
          url,
          (tex) => {
            this.done(url);
            tex.mapping = THREE.EquirectangularReflectionMapping;
            const env = this.pmrem.fromEquirectangular(tex).texture;
            tex.dispose();
            resolve(env);
          },
          this.track(url, estimateKb),
          reject,
        );
      });
      this.envs.set(url, p);
    }
    return p;
  }

  // ── Teardown ──

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    for (const v of this.views) disposeScene(v.spec.scene);
    this.views.clear();
    this.envs.forEach((p) => p.then((t) => t.dispose()).catch(() => {}));
    this.pmrem.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/** Free every geometry, material and texture under a scene. */
export function disposeScene(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

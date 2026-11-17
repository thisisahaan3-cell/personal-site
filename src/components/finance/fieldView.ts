/**
 * The field (10,000 points) drawn as THREE.Points in the page's shared renderer, so the Finance
 * page keeps one WebGL context. The simulation in field.ts is unchanged; this only draws it.
 * Coordinates are the stage's CSS pixels (an orthographic camera with y down).
 */
import * as THREE from "three";
import type { Engine } from "@/components/three/engine";
import type { FieldRenderer, FieldSim } from "./field";

const VS = /* glsl */ `
attribute float aSize;
attribute vec4 aColor;
uniform float uDpr;
varying vec4 vColor;
varying float vSize;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float s = aSize * uDpr;
  gl_PointSize = max(s, 1.0);
  vSize = s;
  vColor = vec4(aColor.rgb, aColor.a * min(1.0, s));
}`;

const FS = /* glsl */ `
varying vec4 vColor;
varying float vSize;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p) * max(vSize, 1.0);
  float m = clamp(vSize * 0.5 - d + 0.5, 0.0, 1.0);
  float A = m * vColor.a;
  if (A < 0.004) discard;
  gl_FragColor = vec4(vColor.rgb * A, A);
}`;

export class ThreeFieldRenderer implements FieldRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1);
  private geo = new THREE.BufferGeometry();
  private pos: THREE.BufferAttribute;
  private size: THREE.BufferAttribute;
  private color: THREE.BufferAttribute;
  private mat: THREE.ShaderMaterial;
  private remove: () => void;

  constructor(
    private engine: Engine,
    element: HTMLElement,
    n: number,
  ) {
    this.pos = new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.size = new THREE.BufferAttribute(new Float32Array(n), 1).setUsage(THREE.DynamicDrawUsage);
    this.color = new THREE.BufferAttribute(new Float32Array(n * 4), 4).setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute("position", this.pos);
    this.geo.setAttribute("aSize", this.size);
    this.geo.setAttribute("aColor", this.color);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VS,
      fragmentShader: FS,
      uniforms: { uDpr: { value: engine.renderer.getPixelRatio() } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const points = new THREE.Points(this.geo, this.mat);
    points.frustumCulled = false;
    this.scene.add(points);
    this.remove = engine.addView({ element, scene: this.scene, camera: this.camera, exposure: () => 1 });
  }

  resize(w: number, h: number) {
    this.camera.right = w;
    this.camera.bottom = h;
    this.camera.updateProjectionMatrix();
    this.engine.invalidate();
  }

  draw(sim: FieldSim) {
    const { x, y, ox, oy, s, r, gr, b, a, n } = sim;
    const P = this.pos.array as Float32Array;
    const S = this.size.array as Float32Array;
    const C = this.color.array as Float32Array;
    for (let i = 0; i < n; i++) {
      P[i * 3] = x[i] + ox[i];
      P[i * 3 + 1] = y[i] + oy[i];
      S[i] = s[i];
      C[i * 4] = r[i];
      C[i * 4 + 1] = gr[i];
      C[i * 4 + 2] = b[i];
      C[i * 4 + 3] = a[i];
    }
    this.pos.needsUpdate = true;
    this.size.needsUpdate = true;
    this.color.needsUpdate = true;
    this.engine.invalidate();
  }

  destroy() {
    this.remove();
    this.geo.dispose();
    this.mat.dispose();
  }
}

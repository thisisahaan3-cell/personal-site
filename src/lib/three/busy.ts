/**
 * How many 3D scenes are being built on the page right now. The background warm-up
 * (warmAssets in components/three/engine.ts) waits while this is above zero, so it never
 * slows the page in front of the visitor. Kept free of three.js so pages can import it.
 */
let building = 0;

export function isBuilding() {
  return building > 0;
}

/** Mark a scene build as started; call the returned function once it is done or abandoned. */
export function beginBuild() {
  building++;
  let ended = false;
  return () => {
    if (!ended) {
      ended = true;
      building--;
    }
  };
}

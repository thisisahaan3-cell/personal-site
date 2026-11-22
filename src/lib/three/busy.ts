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

/**
 * Scenes that are not on screen yet (loading, compiling, uploading). The page transition keeps its
 * cover up while this is above zero (up to a cap), so a page is revealed with its scene already drawn.
 */
let preparing = 0;

export function isPreparing() {
  return preparing > 0;
}

export function beginPrepare() {
  preparing++;
  let ended = false;
  return () => {
    if (!ended) {
      ended = true;
      preparing--;
    }
  };
}

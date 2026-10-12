import * as THREE from "../vendor/three.module.js";

export function createMarkers({
  stage,
  root,
  camera,
  interactions,
  onHover,
  isBlocked,
}) {
  const layer = document.createElement("div");
  layer.id = "interaction-markers";
  layer.setAttribute("aria-label", "Objets à découvrir");
  stage.append(layer);
  const records = new Map(),
    box = new THREE.Box3(),
    projected = new THREE.Vector3();
  const center = new THREE.Vector3(),
    anchor = new THREE.Vector3(),
    sample = new THREE.Vector3();
  const ray = new THREE.Raycaster(),
    direction = new THREE.Vector3(),
    ndc = new THREE.Vector2();
  let active = null;
  function clear(record) {
    if (active === record) {
      active = null;
      onHover(null);
    }
  }
  function add(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "interaction-marker";
    button.dataset.interaction = entry.config.id;
    const hint = entry.config.hint || `Découvrir : ${entry.config.name}`;
    button.setAttribute("aria-label", hint);
    button.setAttribute("aria-haspopup", "dialog");
    button.innerHTML = '<span aria-hidden="true">+</span>';
    const record = { entry, button };
    records.set(entry.config.id, record);
    layer.append(button);
    function enter() {
      active = record;
      onHover(entry, button.getBoundingClientRect());
    }
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointerleave", () => clear(record));
    button.addEventListener("focus", enter);
    button.addEventListener("blur", () => clear(record));
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!button.hidden && !isBlocked()) interactions.activate(entry);
    });
    return record;
  }
  function visibleObject(entry) {
    // Une surface de l'objet doit réellement être visible, même si son
    // indicateur dépasse un mur. Les groupes multi-mesh sont pris en charge.
    for (const fraction of [0.5, 0.8, 0.25]) {
      sample.copy(center);
      sample.y = THREE.MathUtils.lerp(box.min.y, box.max.y, fraction);
      direction.copy(sample).sub(camera.position);
      ray.set(camera.position, direction.normalize());
      ray.far = camera.position.distanceTo(sample) + 0.01;
      const hit = ray.intersectObject(root, true)[0];
      if (hit && interactions.resolve(hit.object) === entry) return true;
    }
    return false;
  }
  function visibleMarker(entry, w, h) {
    // Centre + bords du cercle : cache aussi un marqueur partiellement masqué.
    for (const [dx, dy] of [
      [0, 0],
      [-14, 0],
      [14, 0],
      [0, -14],
      [0, 14],
    ]) {
      ndc.set(projected.x + (dx * 2) / w, projected.y + (dy * 2) / h);
      ray.setFromCamera(ndc, camera);
      direction.copy(anchor).sub(camera.position);
      ray.far = direction.dot(ray.ray.direction);
      const hit = ray.intersectObject(root, true)[0];
      if (hit && interactions.resolve(hit.object) !== entry) return false;
    }
    return true;
  }
  function update() {
    const w = stage.clientWidth,
      h = stage.clientHeight;
    root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    for (const entry of interactions.entries.values()) {
      const record = records.get(entry.config.id) || add(entry),
        b = record.button;
      box.setFromObject(entry.object);
      box.getCenter(center);
      anchor.set(
        center.x,
        box.max.y + (entry.config.markerOffset ?? 0.35),
        center.z,
      );
      projected.copy(anchor).project(camera);
      const x = (projected.x * 0.5 + 0.5) * w,
        y = (-projected.y * 0.5 + 0.5) * h;
      let objectVisible = true;
      for (let node = entry.object; node; node = node.parent)
        if (!node.visible) objectVisible = false;
      const inFrame =
        objectVisible &&
        projected.z >= -1 &&
        projected.z <= 1 &&
        x > 16 &&
        x < w - 16 &&
        y > 16 &&
        y < h - 16;
      b.hidden =
        isBlocked() ||
        !inFrame ||
        !visibleObject(entry) ||
        !visibleMarker(entry, w, h);
      b.style.left = `${x}px`;
      b.style.top = `${y}px`;
      if (b.hidden) clear(record);
      else if (active === record) onHover(entry, b.getBoundingClientRect());
    }
  }
  return { update };
}

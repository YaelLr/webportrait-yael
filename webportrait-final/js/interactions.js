import * as THREE from "../vendor/three.module.js";

export function createInteractions({ canvas, onOpen, onHover, requestRender }) {
  const entries = new Map();
  let hovered = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function register(object, config) {
    if (!object || !config.id || entries.has(config.id))
      throw new Error(`Objet interactif invalide ou dupliqué : ${config.id}`);
    const materials = [];
    object.traverse((child) => {
      if (!child.isMesh) return;
      const clone = (material) => {
        const m = material.clone();
        materials.push(m);
        return m;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(clone)
        : clone(child.material);
    });
    object.userData.interactionId = config.id;
    const entry = {
      object,
      config,
      materials,
      scale: object.scale.clone(),
      position: object.position.clone(),
      amount: 0,
    };
    entries.set(config.id, entry);
    return entry;
  }
  function resolve(mesh) {
    for (let o = mesh; o; o = o.parent) {
      const entry = entries.get(o.userData.interactionId);
      if (entry) return entry;
    }
    return null;
  }
  function hover(entry) {
    if (hovered === entry) return;
    hovered = entry;
    canvas.classList.toggle("object-hover", !!entry);
    onHover(
      entry ? entry.config.hint || `Découvrir : ${entry.config.name}` : "",
    );
    requestRender();
  }
  function activate(entry) {
    if (entry) {
      hover(null);
      onOpen(entry);
      return true;
    }
    return false;
  }
  function update(dt) {
    let moving = false;
    for (const entry of entries.values()) {
      const goal = entry === hovered ? 1 : 0;
      entry.amount = THREE.MathUtils.lerp(
        entry.amount,
        goal,
        reduced.matches ? 1 : 1 - Math.exp(-14 * dt),
      );
      if (Math.abs(entry.amount - goal) < 0.001) entry.amount = goal;
      else moving = true;
      // Transformations relatives à la pose initiale, jamais cumulatives.
      entry.object.scale
        .copy(entry.scale)
        .multiplyScalar(1 + (reduced.matches ? 0 : 0.035 * entry.amount));
      entry.object.position.copy(entry.position);
      entry.object.position.y += reduced.matches ? 0 : 0.035 * entry.amount;
      for (const m of entry.materials)
        if (m.emissive) {
          m.emissive.set("#ffdca2");
          // Les actions peuvent définir leur propre éclat permanent.
          m.emissiveIntensity =
            (m.userData.baseGlow || 0) + entry.amount * 0.18;
        }
    }
    return moving;
  }
  return { register, resolve, hover, activate, update, entries };
}

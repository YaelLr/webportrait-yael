import * as THREE from "../vendor/three.module.js";
import { createHouse } from "./house.js";
import { createCameraRig } from "./camera.js";
import { createInteractions } from "./interactions.js";
import { createMarkers } from "./markers.js";
import { createPanel } from "./panel.js";
import { INTERACTIVE_OBJECTS } from "./interaction-content.js";

export function start() {
  const canvas = document.querySelector("#scene"),
    stage = document.querySelector("#stage");
  const labelLayer = document.querySelector("#labels"),
    reset = document.querySelector("#reset");
  const status = document.querySelector("#status"),
    message = document.querySelector("#message");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ede9e0");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);
  scene.add(new THREE.HemisphereLight("#fff3dc", "#849681", 1.9));
  const sun = new THREE.DirectionalLight("#ffe7bf", 3.3);
  sun.position.set(-6, 16, 8);
  sun.target.position.set(1, 0, 1);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -15,
    right: 15,
    top: 15,
    bottom: -15,
    near: 1,
    far: 55,
  });
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#dbe6ef", 0.75);
  fill.position.set(8, 8, -4); // Lumière d'appoint sans ombres supplémentaires.
  scene.add(fill);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: "#ede9e0", roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  scene.add(ground);
  const { root, rooms, objects, updateAmbient } = createHouse(scene);
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const rig = createCameraRig(camera);
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(),
    projected = new THREE.Vector3();
  let hovered = null,
    selected = null,
    drag = null,
    pointerInside = false;
  let raf = 0,
    previous = 0,
    lost = false;
  const labels = new Map();

  const tip = document.querySelector("#object-tip");
  const shortcuts = document.querySelector("#object-shortcuts");
  const panel = createPanel({
    requestRender,
    onClose: () => {
      pointerInside = false;
      interactions.hover(null);
      requestRender();
    },
  });
  const interactions = createInteractions({
    canvas,
    requestRender,
    onOpen: (entry) => {
      pointerInside = false;
      setHovered(null);
      panel.open(entry);
    },
    onHover: (name) => {
      tip.textContent = name;
      tip.hidden = !name;
    },
  });
  for (const config of INTERACTIVE_OBJECTS)
    interactions.register(objects.get(config.id), config);
  const markers = createMarkers({
    stage,
    root,
    camera,
    interactions,
    isBlocked: () => panel.isOpen() || !!drag,
    onHover: (entry, rect) => {
      pointerInside = false;
      setHovered(null);
      interactions.hover(entry);
      if (rect) {
        tip.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 240))}px`;
        tip.style.top = `${rect.bottom + 8}px`;
      }
    },
  });
  function updateShortcuts(id) {
    shortcuts.replaceChildren();
    const available = [...interactions.entries.values()].filter(
      (entry) => entry.config.roomId === id,
    );
    shortcuts.hidden = !available.length;
    if (available.length) shortcuts.append("Objets : ");
    for (const entry of available) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = entry.config.name;
      b.addEventListener("click", () => interactions.activate(entry));
      shortcuts.append(b);
    }
  }
  function applyHover(hit) {
    const entry = interactions.resolve(hit);
    interactions.hover(entry);
    setHovered(entry ? null : hit?.userData.roomId || null);
  }
  function requestRender() {
    if (!raf && !document.hidden && !lost) raf = requestAnimationFrame(frame);
  }
  function setHovered(id) {
    if (hovered !== id) {
      hovered = id;
      requestRender();
    }
    canvas.classList.toggle("hovering", !!id);
  }
  function select(id) {
    selected = id;
    interactions.hover(null);
    updateShortcuts(id);
    rig.focus(roomById.get(id) || null);
    reset.disabled = !id;
    status.textContent = id ? roomById.get(id).name : "Vue générale";
    for (const [key, button] of labels) {
      button.classList.toggle("active", key === id);
      button.setAttribute("aria-pressed", String(key === id));
    }
    requestRender();
  }
  for (const room of rooms) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-label";
    button.textContent = room.name;
    button.setAttribute("aria-label", `Explorer : ${room.name}`);
    button.setAttribute("aria-pressed", "false");
    button.dataset.room = room.id;
    button.addEventListener("click", () => select(room.id));
    button.addEventListener("pointerenter", () => {
      pointerInside = false;
      interactions.hover(null);
      setHovered(room.id);
    });
    button.addEventListener("pointerleave", () => setHovered(null));
    button.addEventListener("focus", () => setHovered(room.id));
    button.addEventListener("blur", () => setHovered(null));
    labelLayer.append(button);
    labels.set(room.id, button);
  }
  function updatePointer(event) {
    tip.style.left = `${Math.min(event.clientX + 14, window.innerWidth - 170)}px`;
    tip.style.top = `${Math.min(event.clientY + 14, window.innerHeight - 40)}px`;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }
  function pick() {
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(root, true)[0];
    return hit?.object || null;
  }
  function updateLabels() {
    for (const room of rooms) {
      projected.copy(room.labelAnchor).project(camera);
      const b = labels.get(room.id);
      const offscreen =
        projected.z < -1 ||
        projected.z > 1 ||
        Math.abs(projected.x) > 1 ||
        Math.abs(projected.y) > 1;
      b.hidden = offscreen;
      b.style.left = `${(projected.x * 0.5 + 0.5) * stage.clientWidth}px`;
      b.style.top = `${(-projected.y * 0.5 + 0.5) * stage.clientHeight}px`;
    }
  }
  function frame(now) {
    raf = 0;
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
    previous = now;
    let moving = rig.update(dt);
    camera.updateMatrixWorld();
    if (pointerInside && !drag && !panel.isOpen()) applyHover(pick());
    for (const room of rooms) {
      const wanted =
        room.id === hovered ? 0.09 : room.id === selected ? 0.05 : 0;
      for (const mat of room.materials) {
        mat.emissive.set("#ffd69c");
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          wanted,
          1 - Math.exp(-12 * dt),
        );
        if (Math.abs(mat.emissiveIntensity - wanted) > 0.001) moving = true;
      }
    }
    moving = interactions.update(dt) || moving;
    moving =
      updateAmbient(dt, selected === "jardin" && !panel.isOpen()) || moving;
    updateLabels();
    markers.update();
    renderer.render(scene, camera);
    if (moving) requestRender();
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || drag || panel.isOpen()) return;
    updatePointer(e);
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    pointerInside = true;
    updatePointer(e);
    if (drag && drag.id === e.pointerId) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5)
        drag.moved = true;
      if (drag.moved) {
        rig.rotate(e.clientX - drag.x, e.clientY - drag.y);
        applyHover(null);
      }
      drag.x = e.clientX;
      drag.y = e.clientY;
    } else applyHover(pick());
    requestRender();
  });
  function endDrag(e, cancel = false) {
    if (!drag || drag.id !== e.pointerId) return;
    const click = !drag.moved && !cancel;
    drag = null;
    canvas.classList.remove("dragging");
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
    updatePointer(e);
    if (click) {
      const hit = pick();
      if (
        !interactions.activate(interactions.resolve(hit)) &&
        hit?.userData.roomId
      )
        select(hit.userData.roomId);
    }
    requestRender();
  }
  canvas.addEventListener("pointerup", (e) => endDrag(e));
  canvas.addEventListener("pointercancel", (e) => endDrag(e, true));
  canvas.addEventListener("lostpointercapture", () => {
    drag = null;
    canvas.classList.remove("dragging");
  });
  canvas.addEventListener("pointerleave", () => {
    pointerInside = false;
    applyHover(null);
  });
  reset.addEventListener("click", () => {
    const old = selected;
    select(null);
    if (old) labels.get(old).focus();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.isOpen()) {
      select(null);
      setHovered(null);
    }
  });
  function resize() {
    const w = stage.clientWidth,
      h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    rig.update(0, true);
    requestRender();
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  document.addEventListener("visibilitychange", () => {
    previous = 0;
    if (!document.hidden) requestRender();
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
    message.hidden = false;
    message.textContent =
      "Le contexte graphique a été interrompu. Recharge la page pour relancer la maison.";
  });
  message.hidden = true;
  requestRender();
}

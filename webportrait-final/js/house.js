import * as THREE from "../vendor/three.module.js";
import { createDecorKit } from "./decor.js";
import { ROOMS } from "./rooms.js";

export function createHouse(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const potGeometry = new THREE.CylinderGeometry(0.23, 0.16, 0.4, 10);
  const materials = new Map();
  const rooms = [];
  const objects = new Map();
  const decor = createDecorKit();
  let foliage = null,
    ambientTime = 0;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  function mat(color, owner = "structure") {
    const key = `${owner}:${color}`;
    if (!materials.has(key))
      materials.set(
        key,
        decor.material(
          color,
          [
            "#708973",
            "#ead8b6",
            "#b77963",
            "#fff3df",
            "#6a847d",
            "#e1d8b9",
            "#ddd3b8",
          ].includes(color)
            ? "fabric"
            : ["#f1e5cf", "#e6deca", "#747568", "#e0d5c0"].includes(color)
              ? "plaster"
              : color === "#bd8161"
                ? "ceramic"
                : "wood",
        ),
      );
    return materials.get(key);
  }
  function box(parent, size, pos, color) {
    const mesh = new THREE.Mesh(unitBox, mat(color, parent.userData.roomId));
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function plant(parent, x, y, z, scale = 1) {
    const pot = new THREE.Mesh(
      potGeometry,
      mat("#bd8161", parent.userData.roomId),
    );
    pot.position.set(x, y + 0.2 * scale, z);
    pot.scale.setScalar(scale);
    pot.castShadow = true;
    pot.receiveShadow = true;
    parent.add(pot);
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.43 * scale, 0),
      mat("#668465", parent.userData.roomId),
    );
    leaf.position.set(x, y + 0.7 * scale, z);
    leaf.castShadow = true;
    parent.add(leaf);
  }
  function table(g, x, z, width = 1.8, depth = 0.8) {
    box(g, [width, 0.14, depth], [x, 1.05, z], "#b68b60");
    for (const dx of [-width / 2 + 0.12, width / 2 - 0.12])
      for (const dz of [-depth / 2 + 0.1, depth / 2 - 0.1])
        box(g, [0.09, 1, 0.09], [x + dx, 0.5, z + dz], "#505b51");
  }
  const footprint = new THREE.Shape();
  footprint.moveTo(-7.65, -5.35);
  footprint.lineTo(6.75, -5.35);
  footprint.lineTo(6.75, 2.95);
  footprint.lineTo(11, 2.95);
  footprint.lineTo(11, 8.1);
  footprint.lineTo(3.25, 8.1);
  footprint.lineTo(3.25, 5.25);
  footprint.lineTo(-2.9, 5.25);
  footprint.lineTo(-2.9, 4.55);
  footprint.lineTo(-7.65, 4.55);
  footprint.closePath();
  const slabGeometry = new THREE.ExtrudeGeometry(footprint, {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.06,
  });
  slabGeometry.rotateX(Math.PI / 2);
  const slab = new THREE.Mesh(slabGeometry, mat("#c4bba6"));
  slab.position.y = -0.12;
  slab.receiveShadow = true;
  slab.castShadow = true;
  root.add(slab);
  function round(parent, radius, height, pos, color) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, 24),
      mat(color, parent.userData.roomId),
    );
    mesh.position.set(...pos);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  for (const def of ROOMS) {
    const g = new THREE.Group();
    g.position.set(def.x, def.y, def.z);
    g.userData.roomId = def.id;
    root.add(g);
    const w = def.width,
      d = def.depth;
    box(g, [w - 0.1, 0.18, d], [0, 0, 0], def.color);
    if (!def.outdoor) {
      for (let x = -w / 2 + 0.4; x < w / 2; x += 0.55)
        box(g, [0.012, 0.008, d - 0.08], [x, 0.096, 0], "#baa889");
      // Les seuls murs hauts sont sur le périmètre arrière et le côté gauche.
      if (["chambre", "bureau", "archives"].includes(def.id)) {
        const wall = def.id === "archives" ? "#747568" : "#e6deca";
        if (def.id === "archives")
          box(g, [w, 2.35, 0.15], [0, 1.26, -d / 2], wall);
        else {
          box(g, [w, 0.9, 0.15], [0, 0.55, -d / 2], wall);
          box(g, [w, 0.35, 0.15], [0, 2.38, -d / 2], wall);
          for (const x of [-w / 2 + 0.18, w / 2 - 0.18])
            box(g, [0.36, 1.6, 0.15], [x, 1.55, -d / 2], wall);
          box(g, [w - 0.7, 0.09, 0.27], [0, 1, -d / 2], "#a58864");
          box(g, [0.065, 1.2, 0.08], [0, 1.65, -d / 2], "#a58864");
        }
      }
      if (["chambre", "atelier"].includes(def.id))
        box(g, [0.16, 1.9, d], [-w / 2, 1.05, 0], "#e0d5c0");
      // Cloisons courtes : passages larges, pas de rangées de boîtes fermées.
      if (def.id === "chambre")
        box(g, [0.12, 1.05, 2.3], [w / 2, 0.62, -1.2], "#c9baa0");
      if (def.id === "bureau")
        box(g, [1.9, 0.65, 0.18], [1.6, 0.42, d / 2], "#b4b19b");
      if (def.id === "atelier")
        box(g, [0.12, 0.7, 1.8], [w / 2, 0.45, -1.35], "#c9baa0");
    }
    if (def.id === "entree") {
      box(g, [1.2, 1.4, 0.1], [-0.6, 0.8, -1.72], "#9aab99");
      box(g, [0.08, 0.08, 0.12], [-0.17, 1.12, -1.62], "#cfad65");
      box(g, [1.5, 0.045, 0.8], [-0.5, 0.12, 0.8], "#c0966f");
      const mirror = new THREE.Group();
      mirror.position.set(-0.6, 1.02, -1.64);
      g.add(mirror);
      for (const [r, h, z, c] of [
        [0.36, 0.045, 0, "#9c845d"],
        [0.3, 0.015, 0.03, "#bed0c5"],
      ]) {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, h, 24),
          mat(c, def.id),
        );
        m.rotation.x = Math.PI / 2;
        m.position.z = z;
        mirror.add(m);
      }
      objects.set("entree-miroir", mirror);
      table(g, 0.8, -0.65, 0.85, 0.5);
      plant(g, 1.2, 0.1, 0.9, 0.8);
    }
    if (def.id === "salon") {
      box(g, [2.5, 0.5, 0.9], [0, 0.48, -0.65], "#708973");
      box(g, [2.5, 0.75, 0.24], [0, 0.9, -1.08], "#708973");
      for (const x of [-1.18, 1.18])
        box(g, [0.25, 0.5, 1], [x, 0.75, -0.65], "#708973");
      for (const x of [-0.65, 0.65])
        box(g, [0.55, 0.35, 0.16], [x, 0.98, -0.88], "#ead8b6");
      box(g, [2.65, 0.035, 1.65], [0, 0.12, 0.55], "#e1d8b9");
      round(g, 1.65, 0.025, [0, 0.13, 0.4], "#ddd3b8");
      round(g, 0.72, 0.12, [0.15, 0.61, 0.75], "#a9825b");
      round(g, 0.2, 0.4, [0.15, 0.35, 0.75], "#6b705e");
      const ottoman = round(g, 0.5, 0.48, [1.95, 0.36, 1.05], "#b8896e");
      const album = new THREE.Group();
      album.position.set(0.12, 0.71, 0.75);
      g.add(album);
      for (let i = 0; i < 3; i++)
        box(
          album,
          [0.32, 0.05, 0.44],
          [0, i * 0.055, 0],
          ["#6d8374", "#c99b75", "#e5d6b6"][i],
        );
      objects.set("salon-album", album);
      plant(g, 1.5, 0.1, -1.1, 0.7);
    }
    if (def.id === "atelier") {
      table(g, 0, -0.5, 2.8, 1);
      box(g, [2.5, 1, 0.08], [0, 1.65, -1.74], "#b78c60");
      for (let i = 0; i < 6; i++)
        box(
          g,
          [0.08, 0.3 + (i % 2) * 0.2, 0.1],
          [-1 + i * 0.4, 1.65, -1.65],
          "#596b61",
        );
      const dossier = new THREE.Group();
      dossier.position.set(0.6, 1.17, -0.5);
      g.add(dossier);
      box(dossier, [0.7, 0.065, 0.48], [0, 0, 0], "#c77552");
      box(dossier, [0.61, 0.015, 0.41], [0, 0.04, 0], "#eee3cb");
      box(dossier, [0.18, 0.03, 0.06], [0, 0.055, -0.17], "#6c776b");
      objects.set("atelier-dossier", dossier);
      box(g, [0.55, 0.5, 0.55], [-1, 0.35, 0.8], "#9e7855");
    }
    if (def.id === "chambre") {
      box(g, [2, 0.4, 2.6], [-0.5, 0.33, -0.15], "#ac805b");
      box(g, [1.92, 0.28, 2.4], [-0.5, 0.65, -0.1], "#f2ebdc");
      box(g, [1.95, 0.13, 1.55], [-0.5, 0.83, 0.3], "#b77963");
      box(g, [2.1, 1, 0.15], [-0.5, 0.7, -1.5], "#ac805b");
      box(g, [1.4, 0.18, 0.5], [-0.5, 0.86, -0.95], "#fff3df");
      box(g, [0.6, 0.65, 0.6], [1.15, 0.43, -1.05], "#bc9366");
      plant(g, 2, 0.1, 0.7, 1);
      const book = new THREE.Group();
      book.position.set(-0.6, 0.96, 0.55);
      g.add(book);
      box(book, [0.64, 0.12, 0.82], [0, 0, 0], "#5e827c");
      box(book, [0.59, 0.075, 0.76], [0, 0.015, 0], "#eee4d0");
      objects.set("chambre-livre", book);
      const lamp = new THREE.Group();
      lamp.position.set(1.15, 0.78, -1.05);
      g.add(lamp);
      box(lamp, [0.3, 0.06, 0.3], [0, 0.03, 0], "#856f51");
      box(lamp, [0.06, 0.4, 0.06], [0, 0.24, 0], "#856f51");
      const shade = box(lamp, [0.45, 0.35, 0.45], [0, 0.55, 0], "#dfbf81");
      shade.name = "abat-jour";
      objects.set("chambre-lampe", lamp);
    }
    if (def.id === "bureau") {
      table(g, 0, -0.75, 2.8, 1);
      const computer = new THREE.Group();
      computer.position.set(0, 1.4, -0.9);
      g.add(computer);
      box(computer, [1.05, 0.65, 0.09], [0, 0.17, 0], "#445652");
      box(computer, [0.9, 0.5, 0.02], [0, 0.18, 0.06], "#a8c6bd");
      box(computer, [0.1, 0.25, 0.1], [0, -0.24, 0], "#445652");
      objects.set("bureau-ordinateur", computer);
      box(g, [0.7, 0.06, 0.28], [0, 1.16, -0.4], "#e9dec7");
      box(g, [0.7, 0.13, 0.7], [0, 0.65, 0.5], "#6a847d");
      box(g, [0.7, 0.7, 0.12], [0, 1, 0.85], "#6a847d");
      box(g, [0.15, 0.6, 0.15], [0, 0.3, 0.5], "#535f55");
      for (let i = 0; i < 3; i++)
        box(g, [1, 0.1, 0.35], [2, 0.6 + i * 0.7, -1.3], "#b99062");
      plant(g, -2, 0.1, -0.8, 1.1);
    }
    if (def.id === "archives") {
      // Alcôve sombre au même niveau : bibliothèque et retour de claustra.
      box(g, [0.14, 1.8, 1.75], [-w / 2, 0.99, -0.6], "#747568");
      for (let i = 0; i < 4; i++)
        box(g, [0.075, 1.75, 0.08], [-w / 2 + i * 0.16, 0.97, 0.35], "#7b715d");
      for (let j = 0; j < 3; j++) {
        box(g, [2.35, 0.09, 0.5], [0.1, 0.45 + j * 0.65, -1.15], "#665e50");
        for (let i = 0; i < 3; i++) {
          box(
            g,
            [0.5, 0.43, 0.38],
            [-0.65 + i * 0.68, 0.71 + j * 0.65, -1.14],
            i % 2 ? "#9b8d71" : "#b0a184",
          );
          box(
            g,
            [0.16, 0.07, 0.012],
            [-0.65 + i * 0.68, 0.71 + j * 0.65, -0.943],
            "#d8ceb7",
          );
        }
      }
      const carton = new THREE.Group();
      carton.position.set(0.5, 0.33, 0.65);
      g.add(carton);
      box(carton, [0.8, 0.45, 0.6], [0, 0, 0], "#b69a70");
      box(carton, [0.86, 0.05, 0.66], [0, 0.24, 0], "#a08762");
      box(carton, [0.22, 0.15, 0.013], [0, 0, 0.307], "#e4d9bc");
      objects.set("archives-carton", carton);
    }
    if (def.id === "jardin") {
      for (let i = 0; i < 3; i++)
        box(
          g,
          [0.75, 0.08, 0.5],
          [-1 + i * 0.4, 0.14, 1 - i * 0.75],
          "#e2d9bc",
        );
      box(g, [0.22, 1.6, 0.22], [0.7, 0.85, -1], "#9c7953");
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15, 0),
        mat("#6b8a5e", def.id),
      );
      crown.position.set(0.7, 2, -1);
      crown.castShadow = true;
      foliage = crown;
      g.add(crown);
      table(g, 0.1, 0.8, 1.6, 0.65);
      const roadmap = new THREE.Group();
      roadmap.position.set(-0.55, 1.16, 0.8);
      g.add(roadmap);
      box(roadmap, [0.34, 0.055, 0.42], [0, 0, 0], "#7c9474");
      box(roadmap, [0.29, 0.014, 0.36], [0, 0.035, 0], "#eee0ba");
      objects.set("jardin-projets", roadmap);
      plant(g, -1.2, 0.1, -1.7, 0.9);
      for (let i = 0; i < 8; i++)
        box(g, [2.2, 0.025, 0.27], [-2.65, 0.105, -1.35 + i * 0.3], "#b59b72");
      plant(g, 2.8, 0.1, 1.7, 1.15);
      plant(g, 2.5, 0.1, -1.7, 0.8);
      round(g, 0.9, 0.07, [1.1, 0.14, 1.4], "#b1ba8a");
    }
    decor.enrich(g, def);
    const roomMaterials = new Set();
    g.traverse((o) => {
      if (o.isMesh) {
        o.userData.roomId = def.id;
        roomMaterials.add(o.material);
      }
    });
    rooms.push({
      ...def,
      group: g,
      materials: [...roomMaterials],
      target: new THREE.Vector3(def.x, def.y + 0.65, def.z),
      labelAnchor: new THREE.Vector3(def.x, def.y + 0.16, def.z + d / 2 - 0.28),
    });
  }
  function updateAmbient(dt, active) {
    if (!foliage) return false;
    if (active && !reducedMotion.matches) ambientTime += dt;
    const goal =
      active && !reducedMotion.matches
        ? Math.sin(ambientTime * 0.7) * 0.014
        : 0;
    foliage.rotation.z = THREE.MathUtils.lerp(
      foliage.rotation.z,
      goal,
      1 - Math.exp(-4 * dt),
    );
    return (
      (active && !reducedMotion.matches) ||
      Math.abs(foliage.rotation.z) > 0.0001
    );
  }
  return { root, rooms, objects, updateAmbient };
}

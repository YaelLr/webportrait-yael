import * as THREE from "../vendor/three.module.js";

export function createDecorKit() {
  const textures = new Map(),
    geometries = new Map();
  function grain(kind) {
    if (textures.has(kind)) return textures.get(kind);
    const n = 64,
      data = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const noise = ((x * 137 + y * 149 + x * y * 17) % 31) / 31;
        const value =
          kind === "wood"
            ? 128 + 20 * Math.sin(y * 0.65 + Math.sin(x * 0.08)) + noise * 8
            : kind === "fabric"
              ? 120 + ((x + y) % 2) * 20 + noise * 9
              : 125 + noise * 12;
        const i = (y * n + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = 255;
      }
    const texture = new THREE.DataTexture(data, n, n);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    textures.set(kind, texture);
    return texture;
  }
  function material(color, kind = "wood") {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: kind === "metal" ? 0.36 : kind === "ceramic" ? 0.52 : 0.9,
      metalness: kind === "metal" ? 0.45 : 0,
      bumpMap: ["wood", "fabric", "plaster"].includes(kind)
        ? grain(kind)
        : null,
      bumpScale: kind === "fabric" ? 0.018 : 0.012,
      emissiveIntensity: 0,
    });
  }
  function geometry(key, make) {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  }
  const box = geometry("box", () => new THREE.BoxGeometry(1, 1, 1));
  const sphere = geometry("sphere", () => new THREE.SphereGeometry(1, 12, 8));
  const cylinder = geometry(
    "cylinder",
    () => new THREE.CylinderGeometry(1, 1, 1, 12),
  );
  const cone = geometry(
    "cone",
    () => new THREE.CylinderGeometry(0.55, 1, 1, 12),
  );
  const torus = geometry(
    "torus",
    () => new THREE.TorusGeometry(1, 0.17, 6, 16),
  );
  const matrix = new THREE.Matrix4(),
    quaternion = new THREE.Quaternion(),
    euler = new THREE.Euler();
  function enrich(g, def) {
    const batches = new Map();
    function piece(geo, pos, size, color, kind = "wood", rotation = [0, 0, 0]) {
      const key = color + kind;
      if (!batches.has(key))
        batches.set(key, {
          mat: material(color, kind),
          positions: [],
          normals: [],
          uvs: [],
        });
      const b = batches.get(key);
      quaternion.setFromEuler(euler.set(...rotation));
      matrix.compose(
        new THREE.Vector3(...pos),
        quaternion,
        new THREE.Vector3(...size),
      );
      const transformed = geo.clone().applyMatrix4(matrix),
        flat = transformed.index ? transformed.toNonIndexed() : transformed;
      b.positions.push(...flat.attributes.position.array);
      b.normals.push(...flat.attributes.normal.array);
      b.uvs.push(...flat.attributes.uv.array);
      if (flat !== transformed) flat.dispose();
      transformed.dispose();
    }
    const cube = (pos, size, color, kind = "wood", r) =>
      piece(box, pos, size, color, kind, r);
    const cyl = (pos, r, h, color, kind = "ceramic") =>
      piece(cylinder, pos, [r, h, r], color, kind);
    const book = (x, y, z, color, lean = 0) =>
      cube([x, y, z], [0.12, 0.4, 0.3], color, "fabric", [0, 0, lean]);
    function mug(x, y, z, color = "#d5c4a5") {
      cyl([x, y + 0.11, z], 0.115, 0.22, color);
      cyl([x, y + 0.225, z], 0.083, 0.006, "#564332");
      piece(
        torus,
        [x + 0.13, y + 0.12, z],
        [0.078, 0.085, 0.078],
        color,
        "ceramic",
        [0, Math.PI / 2, 0],
      );
    }
    function vase(x, y, z, color = "#bc8166", scale = 1) {
      piece(
        sphere,
        [x, y + 0.22 * scale, z],
        [0.2 * scale, 0.24 * scale, 0.2 * scale],
        color,
        "ceramic",
      );
      cyl([x, y + 0.45 * scale, z], 0.075 * scale, 0.15 * scale, color);
      for (let i = 0; i < 3; i++) {
        cube(
          [x + (i - 1) * 0.09, y + 0.75 * scale, z],
          [0.018, 0.5 * scale, 0.018],
          "#737c55",
          "wood",
          [0, 0, (i - 1) * 0.24],
        );
        piece(
          sphere,
          [x + (i - 1) * 0.14, y + 0.99 * scale, z],
          [0.07, 0.12, 0.035],
          "#c6b48b",
          "fabric",
        );
      }
    }
    function stool(x, y, z) {
      cyl([x, y + 0.55, z], 0.28, 0.12, "#b98b60", "wood");
      for (const [dx, dz] of [
        [-0.17, -0.13],
        [0.17, -0.13],
        [0, 0.2],
      ])
        cube(
          [x + dx, y + 0.28, z + dz],
          [0.055, 0.5, 0.055],
          "#58695c",
          "metal",
        );
    }
    function cushion(x, y, z, color, angle = 0) {
      piece(sphere, [x, y, z], [0.28, 0.22, 0.12], color, "fabric", [
        0,
        0,
        angle,
      ]);
    }
    if (["chambre", "bureau", "archives"].includes(def.id))
      cube(
        [0, 0.2, -def.depth / 2 + 0.1],
        [def.width - 0.2, 0.18, 0.06],
        "#ac9170",
      );
    if (["chambre", "atelier"].includes(def.id))
      cube(
        [-def.width / 2 + 0.1, 0.2, 0],
        [0.06, 0.18, def.depth - 0.1],
        "#ac9170",
      );
    if (["chambre", "bureau"].includes(def.id)) {
      for (const x of [-def.width / 2 + 0.38, def.width / 2 - 0.38])
        cube([x, 1.63, -def.depth / 2 + 0.045], [0.07, 1.18, 0.08], "#ac9170");
      cube(
        [0, 2.2, -def.depth / 2 + 0.045],
        [def.width - 0.7, 0.07, 0.08],
        "#ac9170",
      );
    }
    if (def.id === "entree") {
      for (let i = 0; i < 3; i++)
        cyl([-0.94 + i * 0.32, 0.45, -1.58], 0.035, 0.07, "#8c7352", "metal");
      cube([0.85, 0.56, -0.7], [0.6, 0.07, 0.35], "#b68b60");
      vase(0.85, 1.14, -0.7, "#d9c6a4", 0.5);
      for (const x of [-1.05, -0.8])
        piece(sphere, [x, 0.2, -0.65], [0.1, 0.1, 0.22], "#536458", "fabric");
      for (let i = 0; i < 7; i++)
        cube(
          [-0.5, 0.148, 0.47 + i * 0.1],
          [1.35, 0.009, 0.017],
          "#d8b790",
          "fabric",
        );
    }
    if (def.id === "chambre") {
      cube([-0.5, 0.105, 0.1], [2.6, 0.025, 3.3], "#ded0b4", "fabric");
      for (const x of [-1.67, 0.67])
        for (let i = 0; i < 8; i++)
          cube(
            [x, 0.122, -1.1 + i * 0.34],
            [0.16, 0.009, 0.045],
            "#b5a586",
            "fabric",
          );
      cube([-0.5, 0.909, 0.98], [1.9, 0.025, 0.35], "#d8b78b", "fabric");
      for (let i = 0; i < 8; i++)
        cube(
          [-1.32 + i * 0.23, 0.925, 0.98],
          [0.025, 0.009, 0.35],
          "#ae785c",
          "fabric",
        );
      cushion(-0.92, 1, -1.12, "#f0dfc1", -0.1);
      cushion(-0.13, 1, -1.12, "#d4bc8f", 0.13);
      for (const y of [0.3, 0.53]) {
        cube([1.15, y, -0.739], [0.49, 0.012, 0.015], "#886e50");
        cube([1.15, y + 0.07, -0.72], [0.13, 0.022, 0.03], "#bfa06b", "metal");
      }
      cube([-2.59, 1.22, 0.3], [0.06, 0.82, 0.65], "#a58460");
      cube([-2.55, 1.22, 0.3], [0.012, 0.7, 0.53], "#e9d9b8", "fabric");
      piece(
        sphere,
        [-2.536, 1.28, 0.26],
        [0.012, 0.2, 0.18],
        "#ad8068",
        "fabric",
      );
    }
    if (def.id === "bureau") {
      mug(-0.92, 1.13, -0.45, "#bd8063");
      cyl([1, 1.26, -0.85], 0.12, 0.27, "#8b9b85");
      for (let i = 0; i < 3; i++)
        cube(
          [0.94 + i * 0.06, 1.52, -0.85],
          [0.025, 0.35, 0.025],
          ["#c49163", "#58695c", "#cfb889"][i],
          "wood",
          [0, 0, (i - 1) * 0.12],
        );
      cube(
        [0.85, 1.13, -0.4],
        [0.52, 0.018, 0.34],
        "#e4d8bb",
        "fabric",
        [0, 0.14, 0],
      );
      for (let shelf = 0; shelf < 3; shelf++)
        for (let i = 0; i < 4; i++)
          book(
            1.72 + i * 0.15,
            0.85 + shelf * 0.7,
            -1.3,
            ["#9d7659", "#708575", "#c4a67a", "#d9c9a6"][i],
            i === 3 ? -0.12 : 0,
          );
      for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3])
        cube([0, 0.16, 0.5], [0.77, 0.06, 0.055], "#505e53", "metal", [
          0,
          a,
          0,
        ]);
      cube([0, 0.81, 0.84], [0.57, 0.33, 0.09], "#8ea18e", "fabric");
      cube([0, 0.109, 0.5], [1.55, 0.026, 1.7], "#a6b1a1", "fabric");
    }
    if (def.id === "atelier") {
      stool(0.65, 0.1, 0.65);
      cube([-0.6, 1.132, -0.44], [0.95, 0.015, 0.55], "#789487", "fabric");
      for (let i = 0; i < 4; i++)
        cube([-0.95 + i * 0.23, 1.145, -0.44], [0.01, 0.004, 0.52], "#b2c4ae");
      cube(
        [-0.63, 1.18, -0.45],
        [0.035, 0.04, 0.39],
        "#b68b60",
        "wood",
        [0, 0.3, 0],
      );
      cube([-0.68, 1.2, -0.63], [0.19, 0.08, 0.065], "#65746c", "metal");
      cube([0.1, 1.14, -0.16], [0.56, 0.014, 0.065], "#d1bd86", "metal");
      piece(
        cylinder,
        [-1.05, 1.23, -0.8],
        [0.07, 0.4, 0.07],
        "#dcd1b7",
        "fabric",
        [0, 0, Math.PI / 2],
      );
      for (const x of [-1.18, 1.18])
        cube([x, 0.9, -1.76], [0.06, 1.6, 0.06], "#a0805f");
      for (let i = 0; i < 3; i++)
        cube(
          [-0.97 + i * 0.8, 1.75, -1.62],
          [0.19, 0.07, 0.07],
          "#718276",
          "metal",
        );
      cube([-1, 0.56, 0.8], [0.56, 0.05, 0.56], "#b68b60");
    }
    if (def.id === "salon") {
      for (const x of [-0.65, 0, 0.65])
        cube([x, 0.749, -0.65], [0.6, 0.06, 0.68], "#8ca087", "fabric");
      cushion(-0.73, 1, -0.8, "#c69770", -0.18);
      cushion(0.72, 1, -0.8, "#d9c9a0", 0.15);
      mug(0.54, 0.68, 0.65);
      vase(-0.28, 0.68, 0.48, "#c4b28e", 0.32);
      cyl([-2.1, 0.16, -1.05], 0.27, 0.1, "#5e695b", "metal");
      cyl([-2.1, 1.05, -1.05], 0.035, 1.75, "#5e695b", "metal");
      piece(cone, [-2.1, 1.95, -1.05], [0.38, 0.4, 0.38], "#e6d1a6", "fabric");
      cyl([-2.1, 1.76, -1.05], 0.3, 0.012, "#eedfb9");
      cube([-2.36, 0.47, 1.45], [0.62, 0.65, 1.2], "#b68b60");
      for (const y of [0.3, 0.6])
        cube([-2.025, y, 1.45], [0.017, 0.02, 1.08], "#846c52");
      vase(-2.36, 0.81, 1.42, "#b87c60", 0.65);
    }
    if (def.id === "archives") {
      for (const x of [-1.07, 1.27])
        cube([x, 1.08, -1.37], [0.06, 2, 0.06], "#665e50");
      for (const x of [0.2, 0.8])
        cube([x, 0.34, 0.967], [0.065, 0.4, 0.014], "#5e6557", "metal");

      cyl([-0.75, 0.28, 0.78], 0.24, 0.36, "#c0ae89", "fabric");
      piece(torus, [-0.75, 0.47, 0.78], [0.21, 0.21, 0.21], "#a18b69", "wood", [
        Math.PI / 2,
        0,
        0,
      ]);
      for (let i = 0; i < 4; i++)
        book(
          -0.87 + i * 0.12,
          0.59,
          0.77,
          ["#8d735d", "#a99a7a", "#6c7b68", "#c4b48f"][i],
        );
    }
    if (def.id === "jardin") {
      for (let i = 0; i < 3; i++)
        cube([0.1, 0.62, 1.45 + i * 0.09], [1.7, 0.06, 0.07], "#b68b60");
      for (const x of [-0.5, 0.7])
        cube([x, 0.35, 1.55], [0.1, 0.5, 0.24], "#596952", "metal");
      mug(-0.25, 1.13, 0.8);
      mug(0.45, 1.13, 0.8, "#bd8063");
      cube([3.12, 0.27, -0.05], [0.55, 0.32, 1.35], "#a7835d");
      cube([3.12, 0.44, -0.05], [0.43, 0.03, 1.2], "#6e624b");
      for (let i = 0; i < 5; i++) {
        const z = -0.52 + i * 0.23;
        piece(
          sphere,
          [3.1, 0.64, z],
          [0.18, 0.24, 0.17],
          i % 2 ? "#83956c" : "#647e59",
          "fabric",
        );
        piece(
          sphere,
          [3.08, 0.86, z],
          [0.075, 0.06, 0.075],
          i % 2 ? "#cdad74" : "#b77760",
          "ceramic",
        );
      }
      for (const [x, z] of [
        [-3.4, 1.1],
        [2.6, 1.1],
      ]) {
        cyl([x, 0.18, z], 0.13, 0.08, "#586757", "metal");
        cyl([x, 0.36, z], 0.09, 0.28, "#e1c899");
        cyl([x, 0.52, z], 0.14, 0.06, "#586757", "metal");
      }
    }
    for (const batch of batches.values()) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(batch.positions, 3),
      );
      geo.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(batch.normals, 3),
      );
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(batch.uvs, 2));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, batch.mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "Décor " + def.id;
      g.add(mesh);
    }
  }
  return { enrich, material };
}

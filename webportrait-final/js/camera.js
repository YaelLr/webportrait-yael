import * as THREE from "../vendor/three.module.js";

export const CAMERA_SETTINGS = {
  target: [1.1, 0.7, 1.3],
  yaw: 0.62, 
  pitch: 0.9, 
  yawLimits: [0.43, 0.81],
  pitchLimits: [0.8, 1.03], 
  damping: 6,
  bounds: { min: [-7.8, -0.5, -5.5], max: [11.2, 3.2, 8.3] },
};

export function createCameraRig(camera) {
  const settings = CAMERA_SETTINGS;
  const general = new THREE.Vector3(...settings.target);
  const target = general.clone(),
    goal = general.clone();
  let selected = null,
    yaw = settings.yaw,
    pitch = settings.pitch,
    distance = 34;
  const spherical = new THREE.Spherical(),
    offset = new THREE.Vector3();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const direction = new THREE.Vector3(),
    right = new THREE.Vector3(),
    up = new THREE.Vector3();
  const corner = new THREE.Vector3(),
    vertical = new THREE.Vector3(0, 1, 0);
  function desiredDistance() {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)),
      tanH = tanV * camera.aspect;
    direction.setFromSpherical(new THREE.Spherical(1, pitch, yaw));
    right.crossVectors(vertical, direction).normalize();
    up.crossVectors(direction, right).normalize();
    const min = selected
      ? [selected.x - selected.width / 2, 0, selected.z - selected.depth / 2]
      : settings.bounds.min;
    const max = selected
      ? [
          selected.x + selected.width / 2,
          selected.outdoor ? 3 : 2.6,
          selected.z + selected.depth / 2,
        ]
      : settings.bounds.max;
    let result = 0;
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          corner.set(x, y, z).sub(goal);
          const near = corner.dot(direction);
          result = Math.max(
            result,
            near + Math.abs(corner.dot(right)) / tanH,
            near + Math.abs(corner.dot(up)) / tanV,
          );
        }
    return result * 1.1;
  }
  function focus(room) {
    selected = room;
    goal.copy(room ? room.target : general);
    yaw = settings.yaw;
    pitch = settings.pitch;
  }
  function rotate(dx, dy) {
    yaw = THREE.MathUtils.clamp(yaw + dx * 0.0025, ...settings.yawLimits);
    pitch = THREE.MathUtils.clamp(pitch + dy * 0.002, ...settings.pitchLimits);
  }
  function update(dt, instant = false) {
    const alpha =
      instant || reduced.matches ? 1 : 1 - Math.exp(-settings.damping * dt);
    target.lerp(goal, alpha);
    const wanted = desiredDistance();
    distance = THREE.MathUtils.lerp(distance, wanted, alpha);
    spherical.set(distance, pitch, yaw);
    offset.setFromSpherical(spherical).add(target);
    camera.position.lerp(offset, alpha);
    camera.lookAt(target);
    return (
      camera.position.distanceToSquared(offset) > 0.000001 ||
      target.distanceToSquared(goal) > 0.000001 ||
      Math.abs(distance - wanted) > 0.001
    );
  }
  return { focus, rotate, update };
}

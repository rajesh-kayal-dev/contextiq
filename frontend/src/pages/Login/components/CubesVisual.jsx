import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CubesVisual — Three.js Interactive Monochrome 3D Cubes & Particle Field
 * Renders edge-to-edge 3D cube grid & floating particles animation without extra padding/borders.
 */
export default function CubesVisual({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x171717, 15, 30);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    // Particle background field
    const particleCount = 800;
    const particles = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 30;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
    particles.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.06,
      transparent: true,
      opacity: 0.4,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // 5x5x5 Grid of Monochrome Cubes
    const cubes = [];
    const gridSize = 5;
    const spacing = 2;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const geo = new THREE.BoxGeometry(1, 1, 1);
          const l = 0.2 + 0.6 * ((x + y + z) / (gridSize * 3 - 3));
          const gray = new THREE.Color().setHSL(0, 0, l);
          const mat = new THREE.MeshPhongMaterial({
            color: gray,
            shininess: 90,
            transparent: true,
            opacity: 0.82,
          });
          const cube = new THREE.Mesh(geo, mat);
          cube.position.x = (x - gridSize / 2) * spacing;
          cube.position.y = (y - gridSize / 2) * spacing;
          cube.position.z = (z - gridSize / 2) * spacing;
          cube.userData = {
            initialScale: 1,
            targetScale: 1,
            initialColor: mat.color.clone(),
            isSelected: false,
            initialX: cube.position.x,
            initialY: cube.position.y,
            initialZ: cube.position.z,
            rotationSpeed: 0.012,
            pulsePhase: Math.random() * Math.PI * 2,
          };
          scene.add(cube);
          cubes.push(cube);
        }
      }
    }

    // Directional & Ambient Lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 0.95);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.35);
    light2.position.set(-1, -1, -1);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0x404040, 0.9));

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredCube = null;

    function resizeCanvas() {
      if (!canvas || !canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth || canvas.clientWidth;
      const h = canvas.parentElement.clientHeight || canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resizeCanvas);

    function getPointer(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
      };
    }

    const handleMouseMove = (event) => {
      const p = getPointer(event);
      mouse.x = p.x;
      mouse.y = p.y;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubes);

      if (
        hoveredCube &&
        (!intersects.length || intersects[0].object !== hoveredCube)
      ) {
        if (!hoveredCube.userData.isSelected) {
          hoveredCube.material.opacity = 0.82;
          hoveredCube.material.emissive.setHex(0x000000);
        }
        hoveredCube = null;
      }
      if (intersects.length) {
        const cube = intersects[0].object;
        if (cube !== hoveredCube) {
          hoveredCube = cube;
          if (!cube.userData.isSelected) {
            cube.material.opacity = 1;
            cube.material.emissive.setHex(0x232323);
          }
        }
      }
    };

    const handleClick = (event) => {
      const p = getPointer(event);
      mouse.x = p.x;
      mouse.y = p.y;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubes);
      if (intersects.length > 0) {
        const cube = intersects[0].object;
        cube.userData.isSelected = !cube.userData.isSelected;
        if (cube.userData.isSelected) {
          cube.userData.targetScale = 1.47;
          cube.userData.rotationSpeed = 0.07;
          cube.material.color.setHSL(0.48, 0.8, 0.5);
          cube.material.opacity = 1;
        } else {
          cube.userData.targetScale = 1;
          cube.userData.rotationSpeed = 0.012;
          cube.material.color.copy(cube.userData.initialColor);
          cube.material.opacity = 0.82;
        }
      }
    };

    canvas.parentElement?.addEventListener("mousemove", handleMouseMove);
    canvas.parentElement?.addEventListener("click", handleClick);

    let animId;
    function animate() {
      if (prefersReducedMotion) return;
      animId = requestAnimationFrame(animate);

      const t = Date.now() * 0.001;
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        if (Math.abs(positions[i * 3]) > 15)
          positions[i * 3] = -positions[i * 3];
        if (Math.abs(positions[i * 3 + 1]) > 15)
          positions[i * 3 + 1] = -positions[i * 3 + 1];
        if (Math.abs(positions[i * 3 + 2]) > 15)
          positions[i * 3 + 2] = -positions[i * 3 + 2];
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      cubes.forEach((cube, i) => {
        const offset = i * 0.1;
        cube.position.x = cube.userData.initialX + Math.sin(t + offset) * 0.52;
        cube.position.y = cube.userData.initialY + Math.cos(t + offset) * 0.52;
        const pulse = Math.sin(t * 2 + cube.userData.pulsePhase) * 0.09;
        const targetScale = cube.userData.targetScale + pulse;
        cube.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.13
        );
        cube.rotation.x += cube.userData.rotationSpeed;
        cube.rotation.y += cube.userData.rotationSpeed;
      });

      camera.position.x = Math.sin(t * 0.5) * 15;
      camera.position.z = Math.cos(t * 0.5) * 15;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    resizeCanvas();
    if (!prefersReducedMotion) animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.parentElement?.removeEventListener("mousemove", handleMouseMove);
      canvas.parentElement?.removeEventListener("click", handleClick);
      if (animId) cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={`w-full h-full relative flex items-center justify-center bg-[#171717] overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />
    </div>
  );
}

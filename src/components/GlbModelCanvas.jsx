import React, { useEffect, useRef } from "react";

/**
 * Imperative three.js + GLTFLoader canvas.
 * Lazy-loaded from Product3DViewer. Supports .glb and .gltf.
 * Calls onError on load failure so CSS rotate can take over.
 */
function GlbModelCanvas({ url, rotX = 12, rotY = -18, scale = 1.35, onError }) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const frameRef = useRef(0);
  const rendererRef = useRef(null);
  const onErrorRef = useRef(onError);
  const rotXRef = useRef(rotX);
  const rotYRef = useRef(rotY);
  const scaleRef = useRef(scale);

  onErrorRef.current = onError;
  rotXRef.current = rotX;
  rotYRef.current = rotY;
  scaleRef.current = scale;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !url) return undefined;

    let cancelled = false;
    let renderer;
    let scene;
    let camera;
    let resizeObserver;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        if (cancelled) return;

        const width = mount.clientWidth || 320;
        const height = mount.clientHeight || 320;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
        camera.position.set(0, 0.35, 2.4);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        mount.replaceChildren(renderer.domElement);
        rendererRef.current = renderer;

        scene.add(new THREE.HemisphereLight(0xfff5ea, 0x8a7060, 1.05));
        const key = new THREE.DirectionalLight(0xffffff, 1.15);
        key.position.set(2.2, 4, 2.5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffd9c2, 0.45);
        fill.position.set(-2.5, 1.5, -1.5);
        scene.add(fill);

        const controlsGroup = new THREE.Group();
        scene.add(controlsGroup);
        modelRef.current = controlsGroup;

        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            if (cancelled) return;
            const root = gltf.scene || gltf.scenes?.[0];
            if (!root) {
              onErrorRef.current?.(new Error("Empty GLTF scene"));
              return;
            }
            const box = new THREE.Box3().setFromObject(root);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            root.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z, 0.001);
            root.scale.setScalar(1.15 / maxDim);
            controlsGroup.add(root);

            const animate = () => {
              if (cancelled) return;
              frameRef.current = requestAnimationFrame(animate);
              const g = modelRef.current;
              if (g) {
                g.rotation.x = (rotXRef.current * Math.PI) / 180;
                g.rotation.y = (rotYRef.current * Math.PI) / 180;
                g.scale.setScalar(scaleRef.current);
              }
              renderer.render(scene, camera);
            };
            animate();
          },
          undefined,
          (err) => {
            if (!cancelled) onErrorRef.current?.(err || new Error("GLTF load failed"));
          }
        );

        const onResize = () => {
          if (!mount || !renderer || !camera) return;
          const w = mount.clientWidth || 320;
          const h = mount.clientHeight || 320;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(mount);
      } catch (err) {
        if (!cancelled) onErrorRef.current?.(err);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      resizeObserver?.disconnect();
      modelRef.current = null;
      if (renderer) {
        try {
          renderer.dispose();
          renderer.forceContextLoss?.();
        } catch (_) { /* ignore */ }
        renderer.domElement?.remove();
      }
      rendererRef.current = null;
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              m.map?.dispose?.();
              m.dispose?.();
            });
          }
        });
      }
    };
  }, [url]);

  return <div className="product-3d-canvas-host" ref={mountRef} aria-hidden="true" />;
}

export default GlbModelCanvas;
'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@eaip/theme';
import styles from './StableSingularityBackground.module.css';
// Removed invalid top-level hook usage

const StableSingularityBackground = () => {
  const { resolved } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const auraMatRef = useRef<any>(null);
  const diskMaterialRef = useRef<any>(null);

  // Enhancement 12: cursor tracking (disabled for touch / reduced-motion)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;
    const onMove = (e: MouseEvent) => {
      cursorRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let animationId: number;
    let renderer: any;
    let scene: any;
    let camera: any;
    let controls: any;
    let instancedMesh: any;
    let dustMat: any;
    let onResizeFn: (() => void) | undefined;

    const init = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

      const canvas = canvasRef.current;
      if (!canvas) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(60, 25, 85);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.6;

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.03;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;

      // Black hole core
      const coreGroup = new THREE.Group();
      scene.add(coreGroup);
      const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const bhGeo = new THREE.SphereGeometry(4, 64, 64);
      coreGroup.add(new THREE.Mesh(bhGeo, bhMat));

      // Aura with cursor-reactive rim (Enhancement 12)
      auraMatRef.current = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1.0 },
          uCursorX: { value: 0.0 },
          uCursorY: { value: 0.0 },
          uTheme: { value: resolved === 'dark' ? 1.0 : 0.0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uIntensity;
          uniform float uCursorX;
          uniform float uCursorY;
          uniform float uTheme;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec3 biasedView = normalize(vView + vec3(uCursorX * 0.04, uCursorY * 0.04, 0.0));
            float rim = pow(1.0 - max(dot(vNormal, biasedView), 0.0), 4.0);
            vec3 lightColor = vec3(0.2, 0.6, 1.0); // cool blue for light mode
            vec3 darkColor = vec3(1.0, 0.45, 0.1); // warm orange for dark mode
            vec3 base = mix(lightColor, darkColor, uTheme);
            gl_FragColor = vec4(base * rim * uIntensity * 5.0, 1.0);
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      coreGroup.add(new THREE.Mesh(new THREE.SphereGeometry(4.25, 64, 64), auraMatRef.current));

      const noiseChunk = `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
        }
      `;

      // Accretion disk (5000 instanced streaks, Stable Singularity params)
      const instanceCount = 5000;
      const streakGeo = new THREE.CylinderGeometry(0.01, 0.12, 2.2, 3);
      streakGeo.rotateX(Math.PI / 2);

      diskMaterialRef.current = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0.1 },
          uCompression: { value: 1.0 },
          uIntensity: { value: 1.0 },
          uOrbitScale: { value: 1.0 },
          uCursorX: { value: 0.0 },
          uCursorY: { value: 0.0 },
          uTheme: { value: resolved === 'dark' ? 1 : 0 },
        },
        vertexShader: `
          ${noiseChunk}
          uniform float uTime;
          uniform float uMorph;
          uniform float uCompression;
          uniform float uIntensity;
          uniform float uOrbitScale;
          uniform float uCursorX;
          uniform float uCursorY;
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            instPos.x += uCursorX * 0.8;
            instPos.y += uCursorY * 0.4;
            float rOriginal = length(instPos.xz);
            float r = rOriginal * uCompression;
            float initialAngle = atan(instPos.z, instPos.x);
            float orbitalVelocity = (1.5 / sqrt(rOriginal)) * uOrbitScale;
            float currentAngle = initialAngle + (uTime * orbitalVelocity);
            vec3 morphedWorldPos = vec3(cos(currentAngle) * r, instPos.y, sin(currentAngle) * r);
            float noise = snoise(vec3(morphedWorldPos.x * 0.08, morphedWorldPos.z * 0.08, uTime * 0.3));
            morphedWorldPos.y += noise * uMorph * 4.0;
            vec3 viewDir = normalize(cameraPosition - morphedWorldPos);
            vec3 orbitDir = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
            float doppler = dot(orbitDir, viewDir);
            vec3 hot = vec3(1.0, 0.95, 0.9);
            vec3 warm = vec3(1.0, 0.45, 0.1);
            vec3 cool = vec3(0.1, 0.35, 1.0);
            vec3 color = mix(cool, warm, smoothstep(45.0, 12.0, r));
            color = mix(color, hot, smoothstep(10.0, 4.0, r));
            vColor = color * (1.3 + doppler * 0.7) * uIntensity;
            vOpacity = (smoothstep(3.8, 5.5, r) * (1.0 - smoothstep(38.0, 48.0, r))) * 0.8;
            float deltaAngle = currentAngle - initialAngle;
            float c = cos(deltaAngle);
            float s = sin(deltaAngle);
            mat3 rotY = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
            vec3 localPos = (instanceMatrix * vec4(position, 0.0)).xyz;
            gl_Position = projectionMatrix * viewMatrix * vec4(morphedWorldPos + rotY * localPos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            gl_FragColor = vec4(vColor, vOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      instancedMesh = new THREE.InstancedMesh(streakGeo, diskMaterialRef.current, instanceCount);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < instanceCount; i++) {
        const r = 5 + Math.pow(Math.random(), 1.3) * 40;
        const angle = Math.random() * Math.PI * 2;
        dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * (8 / r), Math.sin(angle) * r);
        dummy.lookAt(dummy.position.x + Math.sin(angle), dummy.position.y, dummy.position.z - Math.cos(angle));
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      scene.add(instancedMesh);

      // Enhancement 03: Sparse ambient dust — 280 points in same context
      const DUST_COUNT = 280;
      const dustPos = new Float32Array(DUST_COUNT * 3);
      const dustSz = new Float32Array(DUST_COUNT);
      const dustOp = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const rDust = 55 + Math.random() * 80;
        dustPos[i * 3 + 0] = rDust * Math.sin(phi) * Math.cos(theta);
        dustPos[i * 3 + 1] = rDust * Math.sin(phi) * Math.sin(theta);
        dustPos[i * 3 + 2] = rDust * Math.cos(phi);
        dustSz[i] = 0.5 + Math.random() * 1.5;
        dustOp[i] = 0.04 + Math.random() * 0.08;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSz, 1));
      dustGeo.setAttribute('aOpacity', new THREE.BufferAttribute(dustOp, 1));

      dustMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float aSize;
          attribute float aOpacity;
          varying float vOpacity;
          uniform float uTime;
          void main() {
            vOpacity = aOpacity;
            vec3 pos = position;
            pos.x += sin(uTime * 0.03 + position.z * 0.01) * 1.2;
            pos.y += cos(uTime * 0.025 + position.x * 0.01) * 0.8;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying float vOpacity;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float alpha = (1.0 - d * 2.0) * vOpacity;
            gl_FragColor = vec4(0.75, 0.85, 1.0, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const dustPoints = new THREE.Points(dustGeo, dustMat);
      scene.add(dustPoints);

      onResizeFn = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResizeFn);

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        diskMaterialRef.current.uniforms.uTime.value = t;
        auraMatRef.current.uniforms.uTime.value = t;
        dustMat.uniforms.uTime.value = t;

        // Smoothed cursor-reactive uniforms (Enhancement 12)
        const cx = cursorRef.current.x;
        const cy = cursorRef.current.y;
        diskMaterialRef.current.uniforms.uCursorX.value += (cx - diskMaterialRef.current.uniforms.uCursorX.value) * 0.04;
        diskMaterialRef.current.uniforms.uCursorY.value += (cy - diskMaterialRef.current.uniforms.uCursorY.value) * 0.04;
        auraMatRef.current.uniforms.uCursorX.value = diskMaterialRef.current.uniforms.uCursorX.value;
        auraMatRef.current.uniforms.uCursorY.value = diskMaterialRef.current.uniforms.uCursorY.value;

        instancedMesh.rotation.y += 0.0005;
        dustPoints.rotation.y += 0.00008;
        dustPoints.rotation.x += 0.00003;

        controls.update();
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();
    };

    init();
    
    return () => {
      cancelAnimationFrame(animationId);
      if (onResizeFn) window.removeEventListener('resize', onResizeFn);
      if (renderer) renderer.dispose();
      if (diskMaterialRef.current) diskMaterialRef.current.dispose();
      if (auraMatRef.current) auraMatRef.current.dispose();
      if (dustMat) dustMat.dispose();
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
            else obj.material.dispose();
          }
        });
      }
    };
  }, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (auraMatRef.current) auraMatRef.current.uniforms.uTheme.value = resolved === 'dark' ? 1 : 0;
  if (diskMaterialRef.current?.uniforms?.uTheme) diskMaterialRef.current.uniforms.uTheme.value = resolved === 'dark' ? 1 : 0;
}, [resolved]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} aria-hidden="true" />
      <div className={styles.ambientLight} aria-hidden="true" />
      <div className={styles.vignetteOverlay} aria-hidden="true" />
      <div className={styles.techGrid} aria-hidden="true" />
    </>
  );
};

export default StableSingularityBackground;

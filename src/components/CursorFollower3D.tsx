import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const CursorFollower3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const personRef = useRef<THREE.Group>();
  const headRef = useRef<THREE.Mesh>();
  const eyesRef = useRef<THREE.Group>();
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create person group
    const person = new THREE.Group();
    personRef.current = person;

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    headRef.current = head;
    person.add(head);

    // Eyes group
    const eyes = new THREE.Group();
    eyesRef.current = eyes;

    // Left eye
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 0.1, 0.6);
    eyes.add(leftEye);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 0.1, 0.6);
    eyes.add(rightEye);

    head.add(eyes);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a90e2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    person.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 0.3, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    person.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    person.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1.5, 0);
    leftLeg.castShadow = true;
    person.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1.5, 0);
    rightLeg.castShadow = true;
    person.add(rightLeg);

    scene.add(person);

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      const rect = window.innerWidth;
      const rectHeight = window.innerHeight;
      
      mousePosition.current = {
        x: (event.clientX / rect) * 2 - 1,
        y: -(event.clientY / rectHeight) * 2 + 1
      };
    };

    // Scroll handler to hide/show based on scroll position
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Hide when scrolled past first section
      setIsVisible(scrollY < windowHeight * 0.8);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (headRef.current && eyesRef.current) {
        // Make head look at cursor
        const targetX = mousePosition.current.x * 0.3;
        const targetY = mousePosition.current.y * 0.2;
        
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetY, 0.1);
        
        // Make eyes look at cursor more intensely
        eyesRef.current.rotation.y = THREE.MathUtils.lerp(eyesRef.current.rotation.y, targetX * 1.5, 0.15);
        eyesRef.current.rotation.x = THREE.MathUtils.lerp(eyesRef.current.rotation.x, targetY * 1.5, 0.15);
      }

      // Add subtle floating animation
      if (personRef.current) {
        personRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        personRef.current.rotation.y += 0.005;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    />
  );
};

export default CursorFollower3D;
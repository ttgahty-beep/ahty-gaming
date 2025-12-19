import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib/loaders/GLTFLoader';
import { OrbitControls } from 'three-stdlib';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

/**
 * CarStudio:
 * - Fullscreen Three.js canvas
 * - Loads GLTF models from /assets/models/
 * - Integrates MediaPipe Hands for front-camera gesture rotation & pinch zoom
 *
 * Gesture mapping (simple):
 * - If hand detected: compute rotation from yaw of palm (landmarks)
 * - Pinch distance between thumb tip (4) and index tip (8) maps to zoom
 *
 * Notes:
 * - For production, replace with more advanced physics, PBR materials, and post-processing (bloom, AO).
 * - Must be served over HTTPS for camera on some browsers.
 */

export default function CarStudio({ onBack }){
  const mountRef = useRef();
  const [modelName, setModelName] = useState('ferrari.glb');
  const [status, setStatus] = useState('loading assets...');
  const sceneRef = useRef({});
  const videoRef = useRef();

  useEffect(()=>{
    let renderer, scene, camera, controls, mixer, animationId;
    let modelGroup = new THREE.Group();

    async function init(){
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x02040a);

      camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
      camera.position.set(0, 1.3, 3);

      // Lights
      const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(5, 10, 5);
      dir.castShadow = true;
      scene.add(dir);

      // ground / shadow catcher
      const groundMat = new THREE.MeshStandardMaterial({ color:0x000000, metalness:0.1, roughness:0.8 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(40,40), groundMat);
      ground.rotation.x = -Math.PI/2;
      ground.position.y = -0.01;
      ground.receiveShadow = true;
      scene.add(ground);

      modelGroup.position.set(0,0,0);
      scene.add(modelGroup);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.8;
      controls.minDistance = 1.2;
      controls.maxDistance = 8;

      // load default model
      await loadModel(modelName);

      const clock = new THREE.Clock();
      const tick = ()=>{
        const dt = clock.getDelta();
        if(mixer) mixer.update(dt);
        controls.update();
        renderer.render(scene,camera);
        animationId = requestAnimationFrame(tick);
      };
      tick();

      window.addEventListener('resize', onResize);
      sceneRef.current = { renderer, scene, camera, controls, modelGroup };
    }

    async function loadModel(name){
      setStatus('loading ' + name);
      const loader = new GLTFLoader();
      const url = `/assets/models/${name}`;
      try{
        const gltf = await loader.loadAsync(url);
        // clear previous
        modelGroup.clear();
        const root = gltf.scene || gltf.scenes[0];
        // scale to fit
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.6 / maxDim;
        root.scale.setScalar(scale);
        root.traverse((node) => {
          if(node.isMesh){
            node.castShadow = true;
            node.receiveShadow = true;
            node.material.roughness = Math.max(0, (node.material.roughness||0.5) - 0.05);
          }
        });
        modelGroup.add(root);
        setStatus('model ready');
      }catch(err){
        console.error(err);
        setStatus('failed to load model — add models to /client/public/assets/models');
      }
    }

    function onResize(){
      const w = window.innerWidth; const h = window.innerHeight;
      sceneRef.current.camera.aspect = w/h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w,h);
    }

    init();

    // --- MediaPipe Hands integration ---
    let hands, cameraUtils;
    async function initHands(){
      // create video element
      const video = document.createElement('video');
      video.style.display = 'none';
      video.autoplay = true;
      video.playsInline = true;
      videoRef.current = video;
      document.body.appendChild(video);

      hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
      });
      hands.onResults(onHands);
      const cam = new Camera(video, {
        onFrame: async ()=>{
          await hands.send({image: video});
        },
        width: 480, height: 360
      });
      cam.start();
    }

    function onHands(results){
      if(!results.multiHandLandmarks || results.multiHandLandmarks.length===0) return;
      const landmarks = results.multiHandLandmarks[0];
      // calculate palm direction by vector between wrist (0) and middle finger mcp (9)
      const wrist = landmarks[0];
      const indexMcp = landmarks[5];
      const middleMcp = landmarks[9];

      // compute basic yaw/pitch from coordinates
      const dx = indexMcp.x - wrist.x;
      const dy = indexMcp.y - wrist.y;
      // map to rotation
      const rotY = (dx - 0.0) * -6.0; // yaw
      const rotX = (dy - 0.0) * 3.0;  // pitch

      // apply smooth lerp to modelGroup
      const g = sceneRef.current.modelGroup;
      if(g){
        g.rotation.y += (rotY - g.rotation.y) * 0.12;
        g.rotation.x += (rotX - g.rotation.x) * 0.08;
      }

      // pinch distance thumb_tip (4) and index_tip (8)
      const thumb = landmarks[4];
      const index = landmarks[8];
      const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
      // map to camera distance
      const cam = sceneRef.current.camera;
      if(cam){
        const desired = 1.2 + (1.2 - Math.min(Math.max(dist, 0.02), 0.35)) * 4.0; // tuned map
        cam.position.z += (desired - cam.position.z) * 0.08;
      }
    }

    initHands().catch(e=>console.warn('MediaPipe not available', e));

    return () => {
      if(animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      if(renderer && mountRef.current) mountRef.current.removeChild(renderer.domElement);
      if(videoRef.current) try{ videoRef.current.remove(); }catch(e){}
    };
  }, [modelName]);

  return (
    <div style={{width:'100%',height:'100vh',position:'relative',overflow:'hidden'}}>
      <div ref={mountRef} style={{width:'100%',height:'100%'}} />
      <div style={{position:'absolute',left:18,top:18,display:'flex',gap:8}}>
        <button className="card" onClick={onBack}>Back</button>
        <select value={modelName} onChange={e=>setModelName(e.target.value)} className="card">
          <option value="ferrari.glb">Ferrari (ferrari.glb)</option>
          <option value="lambo.glb">Lamborghini (lambo.glb)</option>
          <option value="bmw.glb">BMW (bmw.glb)</option>
          <option value="gtr.glb">GTR (gtr.glb)</option>
        </select>
        <div className="card" style={{display:'flex',alignItems:'center',padding:'8px 12px'}}>Status: {status}</div>
      </div>
      <div style={{position:'absolute',right:18,bottom:18}}>
        <div className="card">Tip: Allow camera permission for hand-gesture rotation & pinch-zoom</div>
      </div>
    </div>
  );
}
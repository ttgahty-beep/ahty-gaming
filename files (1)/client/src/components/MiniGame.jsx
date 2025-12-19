import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * MiniGame — simple arcade-style driving.
 * - Player can steer with keyboard
 * - Collect points (floating orbs)
 * - Basic progression & unlocks
 *
 * This is a playable prototype. For production replace physics & track design.
 */
export default function MiniGame({ onBack }){
  const mountRef = useRef();
  const [score, setScore] = useState(0);

  useEffect(()=>{
    let scene, camera, renderer, car, animationId;
    let orbs = [];
    const width = window.innerWidth, height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width,height);
    mountRef.current.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);
    camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000);
    camera.position.set(0, 3, 6);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5,10,7);
    scene.add(light);

    // car (simple box)
    car = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.4,2.6), new THREE.MeshStandardMaterial({color:0xff0055}));
    car.position.y = 0.25;
    scene.add(car);

    // track (simple plane)
    const track = new THREE.Mesh(new THREE.PlaneGeometry(100,6, 10,1), new THREE.MeshStandardMaterial({color:0x071018}));
    track.rotation.x = -Math.PI/2;
    scene.add(track);

    // spawn orbs
    function spawnOrbs(n=16){
      for(let i=0;i<n;i++){
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18,12,12), new THREE.MeshStandardMaterial({emissive:0x00ffd5}));
        orb.position.set((Math.random()*80-40), 0.3, (Math.random()*4-2));
        scene.add(orb);
        orbs.push(orb);
      }
    }
    spawnOrbs();

    const keys = {ArrowLeft:false,ArrowRight:false,ArrowUp:false,ArrowDown:false};
    window.addEventListener('keydown', e=>{ if(keys.hasOwnProperty(e.key)) keys[e.key]=true});
    window.addEventListener('keyup', e=>{ if(keys.hasOwnProperty(e.key)) keys[e.key]=false});

    let speed = 0;
    function tick(){
      // movement
      if(keys.ArrowUp) speed = Math.min(speed + 0.02, 0.6);
      else speed = Math.max(speed - 0.02, -0.2);
      if(keys.ArrowLeft) car.rotation.y += 0.04;
      if(keys.ArrowRight) car.rotation.y -= 0.04;

      // forward movement along x
      car.position.x += Math.cos(car.rotation.y+Math.PI/2) * speed;
      car.position.z += Math.sin(car.rotation.y+Math.PI/2) * speed;

      camera.position.x += (car.position.x - camera.position.x) * 0.08;
      camera.position.z += (car.position.z + 6 - camera.position.z) * 0.08;
      camera.lookAt(car.position.x, car.position.y, car.position.z);

      // orb collision
      for(let i=orbs.length-1;i>=0;i--){
        const o = orbs[i];
        if(o && o.position.distanceTo(car.position) < 0.6){
          scene.remove(o); orbs.splice(i,1);
          setScore(s=>s+100);
        }else{
          // animate
          o.position.y = 0.3 + Math.sin(performance.now()/400 + i) * 0.06;
        }
      }

      renderer.render(scene,camera);
      animationId = requestAnimationFrame(tick);
    }
    tick();

    return ()=>{
      cancelAnimationFrame(animationId);
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('keydown', ()=>{});
      window.removeEventListener('keyup', ()=>{});
    };
  }, []);

  return (
    <div style={{width:'100%',height:'100vh',position:'relative'}}>
      <div ref={mountRef} style={{width:'100%',height:'100%'}} />
      <div style={{position:'absolute',left:12,top:12}}>
        <div className="card">Score: {score}</div>
        <div style={{height:12}}/>
        <button className="card" onClick={onBack}>Exit</button>
      </div>
    </div>
  );
}
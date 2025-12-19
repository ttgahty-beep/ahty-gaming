import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * PreLanding cinematic:
 * - Canvas-based simple animation: car entering from left, smoke particle sheet reveals background
 * - For production, replace with WebGL timeline and cinematic assets.
 */
export default function PreLanding({ onComplete }){
  const ref = useRef();
  useEffect(()=>{
    const el = ref.current;
    const tl = gsap.timeline({defaults:{ease:'power3.out'}});
    // step: car slide
    tl.fromTo(el.querySelector('.car'), {x:-600, scale:0.8, rotation:-8}, {x:0, scale:1, rotation:0, duration:1.6});
    // smoke reveal: fade overlay
    tl.to(el.querySelector('.smoke'), {opacity:1, duration:0.6}, '-=0.8');
    tl.to(el.querySelector('.smoke'), {opacity:0, duration:1, delay:0.6});
    tl.to(el.querySelector('.center'), {opacity:1, y:0, duration:0.8}, '-=0.6');
    tl.call(()=> onComplete && onComplete(), null, '+=1.2');
    return ()=>tl.kill();
  }, []);
  return (
    <div className="prelanding" ref={ref} style={{background:'#000',color:'#fff'}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#000,#050814)'}}/>
      <div className="car" style={{width:740, height:220, background:'linear-gradient(90deg,#111,#000)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', zIndex:5}}>
        {/* lightweight vector car silhouette */}
        <svg width="700" height="180" viewBox="0 0 700 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 120 Q 80 40 220 40 H480 Q620 40 690 120 V140 H10 V120 Z" fill="#0ff" opacity="0.1"/>
          <path d="M30 120 Q 100 60 220 60 H460 Q590 60 670 120 V140 H30 V120 Z" fill="#00ffd5"/>
        </svg>
      </div>
      <div className="smoke" style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center, rgba(255,255,255,0.06), transparent 40%), rgba(0,0,0,0.9))', opacity:0}}/>
      <div className="center" style={{opacity:0, transform:'translateY(20px)'}}>
        <div className="center-text">Project By Ahtesham & Salman</div>
      </div>
    </div>
  );
}
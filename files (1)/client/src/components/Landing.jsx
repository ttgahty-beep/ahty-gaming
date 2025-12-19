import React from 'react';
export default function Landing({ onOpenStudio, onPlay }){
  return (
    <section className="hero">
      <div className="left">
        <h1>Nexa Arena — Drive The Future</h1>
        <p style={{color:'var(--muted)'}}>Dark cinematic theme, neon accents, immersive car studio and arcade racing.</p>
        <div style={{display:'flex',gap:12,marginTop:20}}>
          <button className="btn" onClick={onPlay}>Enter Arena</button>
          <button className="btn" onClick={onOpenStudio}>Explore Cars</button>
        </div>
      </div>
      <div style={{width:520}}>
        <div className="card" style={{height:320,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{color:'var(--muted)'}}>Cinematic car preview (click Explore Cars to open Studio)</div>
        </div>
      </div>
    </section>
  );
}
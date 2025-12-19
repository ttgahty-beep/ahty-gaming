import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function Dashboard({ onOpenStudio }){
  const [profile, setProfile] = useState(null);
  useEffect(()=>{
    const token = localStorage.getItem('nexa_token');
    if(!token) return;
    // decode simple
    // For demo, fetch profile id 1
    axios.get((import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000') + '/api/profile/1').then(r=>setProfile(r.data)).catch(()=>{});
  },[]);
  return (
    <div style={{padding:24}}>
      <div className="grid">
        <div>
          <div className="card">
            <h2 style={{marginTop:0}}>Player Overview</h2>
            {profile ? (
              <div style={{display:'flex',gap:12}}>
                <div style={{minWidth:140}}>
                  <div style={{fontSize:22,fontWeight:800}}>{profile.username}</div>
                  <div style={{color:'var(--muted)'}}>Level {profile.level}</div>
                  <div style={{color:'var(--muted)'}}>XP {profile.xp}</div>
                  <div style={{color:'var(--muted)'}}>Currency {profile.currency}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{height:120,background:'linear-gradient(90deg,#021018,#021)'}} />
                </div>
              </div>
            ) : <div style={{color:'var(--muted)'}}>Not logged in</div>}
          </div>

          <div className="card" style={{marginTop:18}}>
            <h3>Recent Matches</h3>
            <div style={{color:'var(--muted)'}}>Live match feed coming via socket.io</div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Achievements</h3>
            <div style={{color:'var(--muted)'}}>Animated stat cards & progress bars</div>
            <button className="btn" onClick={onOpenStudio} style={{marginTop:12}}>Open Car Studio</button>
          </div>
        </div>
      </div>
    </div>
  );
}
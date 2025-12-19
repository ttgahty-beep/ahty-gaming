import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function Tournaments(){
  const [list, setList] = useState([]);
  useEffect(()=>{
    axios.get((import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000') + '/api/tournaments')
      .then(r=>setList(r.data)).catch(()=>{});
  },[]);
  return (
    <div style={{padding:24}}>
      <h2>Tournaments & Drifting Championships</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        {list.map(t=>(
          <div className="card" key={t.id}>
            <h4 style={{marginTop:0}}>{t.name}</h4>
            <div style={{color:'var(--muted)'}}>Starts: {new Date(t.starts_at).toLocaleString()}</div>
            <div style={{color:'var(--muted)'}}>Entry: {t.entry_fee}</div>
            <div style={{height:12}}/>
            <button className="btn">Register</button>
          </div>
        ))}
      </div>
    </div>
  );
}
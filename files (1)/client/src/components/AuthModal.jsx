import React, { useState } from 'react';
import axios from 'axios';

export default function AuthModal({ open, onClose }){
  const [mode, setMode] = useState('login');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  if(!open) return null;
  const submit = async ()=>{
    setMessage('Sending...');
    try{
      const url = `/api/auth/${mode}`;
      const res = await axios.post((import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000') + url, { username, password });
      setMessage('Success!');
      localStorage.setItem('nexa_token', res.data.token);
      setTimeout(()=>onClose(),600);
    }catch(err){
      setMessage(err?.response?.data?.error || 'Error');
    }
  };
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:60,background:'rgba(0,0,0,0.6)'}}>
      <div className="card" style={{width:420}}>
        <h3 style={{marginTop:0}}>{mode==='login'?'Login':'Register'}</h3>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={submit}>{mode==='login'?'Login':'Register'}</button>
            <button className="card" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Switch to Register':'Switch to Login'}</button>
            <button className="card" onClick={onClose}>Close</button>
          </div>
          <div style={{color:'var(--neon)'}}>{message}</div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import PreLanding from './components/PreLanding';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import CarStudio from './components/CarStudio';
import MiniGame from './components/MiniGame';
import Tournaments from './components/Tournaments';
import AuthModal from './components/AuthModal';
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000');

export default function App(){
  const [view, setView] = useState('landing');
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className="app">
      <PreLanding onComplete={()=>setView('landing')} />
      <nav style={{padding:18,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{fontWeight:800,fontSize:18}}>Nexa Arena</div>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button className="btn" onClick={()=>setView('dashboard')}>Enter Arena</button>
          <button className="btn" onClick={()=>setAuthOpen(true)}>Register / Login</button>
        </div>
      </nav>
      <main style={{flex:1}}>
        {view==='landing' && <Landing onOpenStudio={()=>setView('studio')} onPlay={()=>setView('game')} />}
        {view==='studio' && <CarStudio onBack={()=>setView('landing')} />}
        {view==='dashboard' && <Dashboard onOpenStudio={()=>setView('studio')} />}
        {view==='game' && <MiniGame onBack={()=>setView('landing')} />}
        {view==='tournaments' && <Tournaments />}
      </main>
      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} />
    </div>
  );
}
import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const HERO_SRC = 'https://cdn.poehali.dev/projects/4a6e96fc-12bd-41f9-a6cb-25a1318dd872/files/0eadfcb7-63b0-4641-aaf2-564188de443f.jpg';

type Screen = 'menu' | 'game' | 'records' | 'settings';

interface RecordItem { score: number; date: string }

const GROUND_Y = 300;
const GAME_W = 800;
const GAME_H = 360;

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [best, setBest] = useState(0);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem('dino_best') || 0));
    try { setRecords(JSON.parse(localStorage.getItem('dino_records') || '[]')); } catch { /* */ }
    setSoundOn(localStorage.getItem('dino_sound') !== '0');
    setMusicOn(localStorage.getItem('dino_music') !== '0');
  }, []);

  const saveResult = useCallback((score: number) => {
    setLastScore(score);
    if (score > best) { setBest(score); localStorage.setItem('dino_best', String(score)); }
    const rec = [{ score, date: new Date().toLocaleDateString('ru-RU') }, ...records]
      .sort((a, b) => b.score - a.score).slice(0, 10);
    setRecords(rec);
    localStorage.setItem('dino_records', JSON.stringify(rec));
  }, [best, records]);

  const toggleSound = () => { const v = !soundOn; setSoundOn(v); localStorage.setItem('dino_sound', v ? '1' : '0'); };
  const toggleMusic = () => { const v = !musicOn; setMusicOn(v); localStorage.setItem('dino_music', v ? '1' : '0'); };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-500 via-sky-300 to-green-500 font-rubik overflow-hidden p-2">
      <div className="relative w-full max-w-[900px] aspect-[900/440] rounded-2xl shadow-2xl overflow-hidden border-4 border-white/60">
        {screen === 'game' ? (
          <Game soundOn={soundOn} musicOn={musicOn} onExit={(s) => { saveResult(s); setScreen('menu'); }} />
        ) : screen === 'records' ? (
          <Records records={records} best={best} onBack={() => setScreen('menu')} />
        ) : screen === 'settings' ? (
          <Settings soundOn={soundOn} musicOn={musicOn} onSound={toggleSound} onMusic={toggleMusic} onBack={() => setScreen('menu')} />
        ) : (
          <Menu best={best} lastScore={lastScore} onPlay={() => setScreen('game')} onRecords={() => setScreen('records')} onSettings={() => setScreen('settings')} />
        )}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-400 via-sky-200 to-lime-400">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-700 to-lime-500" />
      <div className="absolute bottom-[33%] left-0 right-0 h-8 bg-green-800/40" />
      {children}
    </div>
  );
}

function Menu({ best, lastScore, onPlay, onRecords, onSettings }: { best: number; lastScore: number; onPlay: () => void; onRecords: () => void; onSettings: () => void }) {
  return (
    <Panel>
      <div className="relative z-10 flex flex-col items-center gap-1">
        <img src={HERO_SRC} alt="Герой" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg animate-bounce" style={{ animationDuration: '1.4s' }} />
        <h1 className="font-pacifico text-4xl sm:text-5xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] mt-1">Деревенский раннер</h1>
        <p className="text-white/90 font-medium text-sm">Прыгай через еловые шишки!</p>
      </div>
      <div className="relative z-10 flex flex-col gap-3 w-56 mt-2">
        <MenuBtn onClick={onPlay} icon="Play" label="Играть" color="bg-orange-500 hover:bg-orange-600" />
        <MenuBtn onClick={onRecords} icon="Trophy" label="Рекорды" color="bg-amber-500 hover:bg-amber-600" />
        <MenuBtn onClick={onSettings} icon="Settings" label="Настройки" color="bg-emerald-600 hover:bg-emerald-700" />
      </div>
      <div className="relative z-10 flex gap-4 text-white font-bold text-sm mt-1">
        <span>🏆 Рекорд: {best}</span>
        {lastScore > 0 && <span>🎯 Последний: {lastScore}</span>}
      </div>
    </Panel>
  );
}

function MenuBtn({ onClick, icon, label, color }: { onClick: () => void; icon: string; label: string; color: string }) {
  return (
    <button onClick={onClick} className={`${color} text-white font-bold text-lg py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border-b-4 border-black/20`}>
      <Icon name={icon} size={22} /> {label}
    </button>
  );
}

function Records({ records, best, onBack }: { records: RecordItem[]; best: number; onBack: () => void }) {
  return (
    <Panel>
      <div className="relative z-10 flex flex-col items-center gap-3 w-72">
        <h2 className="font-pacifico text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]">Рекорды</h2>
        <div className="bg-white/90 rounded-xl px-4 py-2 font-bold text-orange-600 text-lg">🏆 Лучший: {best}</div>
        <div className="bg-white/85 rounded-xl w-full max-h-40 overflow-y-auto p-2 flex flex-col gap-1">
          {records.length === 0 && <p className="text-center text-gray-500 py-4">Пока нет рекордов</p>}
          {records.map((r, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-lime-100 font-semibold text-gray-700">
              <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="text-lg">{r.score}</span>
              <span className="text-xs text-gray-500">{r.date}</span>
            </div>
          ))}
        </div>
        <MenuBtn onClick={onBack} icon="ArrowLeft" label="Назад" color="bg-emerald-600 hover:bg-emerald-700" />
      </div>
    </Panel>
  );
}

function Settings({ soundOn, musicOn, onSound, onMusic, onBack }: { soundOn: boolean; musicOn: boolean; onSound: () => void; onMusic: () => void; onBack: () => void }) {
  return (
    <Panel>
      <div className="relative z-10 flex flex-col items-center gap-4 w-72">
        <h2 className="font-pacifico text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]">Настройки</h2>
        <button onClick={onSound} className="w-full bg-white/90 rounded-xl px-4 py-3 flex items-center justify-between font-bold text-gray-700 hover:scale-105 transition">
          <span className="flex items-center gap-2"><Icon name="Volume2" size={20} /> Звуки</span>
          <span className={soundOn ? 'text-green-600' : 'text-gray-400'}>{soundOn ? 'ВКЛ' : 'ВЫКЛ'}</span>
        </button>
        <button onClick={onMusic} className="w-full bg-white/90 rounded-xl px-4 py-3 flex items-center justify-between font-bold text-gray-700 hover:scale-105 transition">
          <span className="flex items-center gap-2"><Icon name="Music" size={20} /> Музыка</span>
          <span className={musicOn ? 'text-green-600' : 'text-gray-400'}>{musicOn ? 'ВКЛ' : 'ВЫКЛ'}</span>
        </button>
        <MenuBtn onClick={onBack} icon="ArrowLeft" label="Назад" color="bg-emerald-600 hover:bg-emerald-700" />
      </div>
    </Panel>
  );
}

function Game({ soundOn, musicOn, onExit }: { soundOn: boolean; musicOn: boolean; onExit: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const stateRef = useRef({ running: true, score: 0 });
  const jumpRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const hero = new Image(); hero.crossOrigin = 'anonymous'; hero.src = HERO_SRC;

    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = AC ? new AC() : null;
    const beep = (freq: number, dur: number, type: OscillatorType = 'square', vol = 0.15) => {
      if (!soundOn || !audioCtx) return;
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = vol;
      o.connect(g); g.connect(audioCtx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    };

    let musicTimer: number | null = null;
    if (musicOn && audioCtx) {
      const notes = [392, 440, 494, 440, 392, 330, 392, 440];
      let ni = 0;
      musicTimer = window.setInterval(() => { beep(notes[ni % notes.length], 0.25, 'sine', 0.05); ni++; }, 400);
    }

    let dinoY = GROUND_Y, vy = 0, onGround = true;
    let speed = 6, dist = 0, spawnTimer = 40, frame = 0, localScore = 0;
    let obstacles: { x: number; w: number; h: number }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
    let bonuses: { x: number; y: number; got: boolean }[] = [];
    const clouds = [{ x: 100, y: 50 }, { x: 400, y: 80 }, { x: 650, y: 40 }];
    const trees = Array.from({ length: 8 }, (_, i) => ({ x: i * 120, h: 40 + (i % 3) * 15 }));

    const jump = () => {
      if (onGround && stateRef.current.running) {
        vy = -14; onGround = false; beep(660, 0.15, 'square');
        for (let i = 0; i < 8; i++) particles.push({ x: 120, y: GROUND_Y + 20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * -3, life: 20, c: '#8B5A2B' });
      }
    };
    jumpRef.current = jump;

    const drawCone = (x: number, baseY: number, w: number, h: number) => {
      let col = '#7C4A22';
      for (let row = 0; row < 6; row++) {
        const ry = baseY - (row * h) / 6;
        const rw = w * (1 - row / 7);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, ry, rw / 2, h / 12, 0, 0, Math.PI * 2);
        ctx.fill();
        col = row % 2 ? '#7C4A22' : '#5A3418';
      }
      ctx.fillStyle = '#3E7D2E';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, baseY - h);
      ctx.lineTo(x + w / 2 - 4, baseY - h + 8);
      ctx.lineTo(x + w / 2 + 4, baseY - h + 8);
      ctx.fill();
    };

    let raf = 0;
    const loop = () => {
      frame++;
      const g = ctx.createLinearGradient(0, 0, 0, GAME_H);
      g.addColorStop(0, '#4EC0FF'); g.addColorStop(0.6, '#BEE9FF'); g.addColorStop(1, '#DFF5D0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, GAME_W, GAME_H);
      ctx.fillStyle = '#FFF3A0'; ctx.beginPath(); ctx.arc(700, 60, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFE45E'; ctx.beginPath(); ctx.arc(700, 60, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      clouds.forEach(c => {
        c.x -= speed * 0.15; if (c.x < -60) c.x = GAME_W + 40;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
        ctx.arc(c.x + 22, c.y + 4, 22, 0, Math.PI * 2);
        ctx.arc(c.x + 46, c.y, 16, 0, Math.PI * 2);
        ctx.fill();
      });
      trees.forEach(t => {
        t.x -= speed * 0.4; if (t.x < -40) t.x = GAME_W + 20;
        ctx.fillStyle = '#5A3A1A'; ctx.fillRect(t.x + 14, GROUND_Y - 20, 8, 30);
        ctx.fillStyle = '#2E7D32';
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(t.x + 18, GROUND_Y - 20 - t.h - k * 8);
          ctx.lineTo(t.x + 18 - (18 - k * 3), GROUND_Y - 20 - k * 16);
          ctx.lineTo(t.x + 18 + (18 - k * 3), GROUND_Y - 20 - k * 16);
          ctx.fill();
        }
      });
      ctx.fillStyle = '#7CB342'; ctx.fillRect(0, GROUND_Y + 20, GAME_W, GAME_H);
      ctx.fillStyle = '#C9A063'; ctx.fillRect(0, GROUND_Y + 20, GAME_W, 40);
      ctx.fillStyle = '#B08A52';
      dist += speed;
      for (let i = -1; i < GAME_W / 40 + 1; i++) {
        const px = (i * 40 - (dist % 40));
        ctx.fillRect(px, GROUND_Y + 26, 20, 4);
        ctx.fillRect(px + 10, GROUND_Y + 40, 16, 4);
      }
      ctx.strokeStyle = '#4C8C2B'; ctx.lineWidth = 2;
      for (let i = -1; i < GAME_W / 60 + 1; i++) {
        const px = (i * 60 - (dist % 60));
        ctx.beginPath(); ctx.moveTo(px, GROUND_Y + 20); ctx.lineTo(px - 3, GROUND_Y + 12);
        ctx.moveTo(px, GROUND_Y + 20); ctx.lineTo(px + 4, GROUND_Y + 10); ctx.stroke();
      }

      vy += 0.7; dinoY += vy;
      if (dinoY >= GROUND_Y) { dinoY = GROUND_Y; vy = 0; onGround = true; }

      spawnTimer--;
      if (spawnTimer <= 0) {
        const size = 24 + Math.random() * 30;
        obstacles.push({ x: GAME_W, w: size * 0.7, h: size });
        spawnTimer = 60 + Math.random() * 60;
        if (Math.random() < 0.4) bonuses.push({ x: GAME_W + 40, y: GROUND_Y - 60 - Math.random() * 40, got: false });
      }

      obstacles.forEach(o => { o.x -= speed; drawCone(o.x, GROUND_Y + 22, o.w, o.h); });
      obstacles = obstacles.filter(o => o.x + o.w > 0);

      bonuses.forEach(b => {
        b.x -= speed;
        if (!b.got) {
          ctx.fillStyle = '#E53935'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2E7D32'; ctx.fillRect(b.x - 1, b.y - 14, 3, 6);
          if (b.x > 90 && b.x < 150 && Math.abs(b.y - dinoY) < 50) {
            b.got = true; localScore += 20; beep(880, 0.12, 'triangle');
            for (let i = 0; i < 10; i++) particles.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 25, c: '#FFD54F' });
          }
        }
      });
      bonuses = bonuses.filter(b => b.x > -20 && !b.got);

      const hy = dinoY - 60, hx = 90;
      const runBob = onGround ? Math.sin(frame * 0.3) * 3 : 0;
      if (hero.complete && hero.naturalWidth) {
        ctx.save();
        ctx.beginPath(); ctx.arc(hx + 30, hy + 30 + runBob, 30, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(hero, hx, hy + runBob, 60, 60);
        ctx.restore();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(hx + 30, hy + 30 + runBob, 30, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        const legSwing = onGround ? Math.sin(frame * 0.4) * 10 : 6;
        ctx.beginPath();
        ctx.moveTo(hx + 22, hy + 56 + runBob); ctx.lineTo(hx + 18 - legSwing, hy + 72 + runBob);
        ctx.moveTo(hx + 38, hy + 56 + runBob); ctx.lineTo(hx + 42 + legSwing, hy + 72 + runBob);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.ellipse(hx + 30, GROUND_Y + 22, 26 - (GROUND_Y - dinoY) / 10, 6, 0, 0, Math.PI * 2); ctx.fill();

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, p.life / 25);
        ctx.fillRect(p.x, p.y, 4, 4); ctx.globalAlpha = 1;
      });
      particles = particles.filter(p => p.life > 0);

      for (const o of obstacles) {
        if (o.x < hx + 48 && o.x + o.w > hx + 12 && dinoY > GROUND_Y - o.h + 10) {
          stateRef.current.running = false;
          beep(120, 0.4, 'sawtooth', 0.25);
          for (let i = 0; i < 20; i++) particles.push({ x: hx + 30, y: dinoY - 30, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30, c: '#FF5252' });
        }
      }

      if (stateRef.current.running) {
        localScore += 0.2; speed = 6 + localScore / 200;
        stateRef.current.score = Math.floor(localScore);
      }
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.font = 'bold 24px Rubik';
      ctx.strokeText(`${Math.floor(localScore)}`, GAME_W - 90, 40);
      ctx.fillText(`${Math.floor(localScore)}`, GAME_W - 90, 40);

      if (stateRef.current.running) {
        raf = requestAnimationFrame(loop);
        if (frame % 6 === 0) setScore(Math.floor(localScore));
      } else {
        setScore(Math.floor(localScore));
        setGameOver(true);
        if (musicTimer) clearInterval(musicTimer);
      }
    };
    raf = requestAnimationFrame(loop);

    const key = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', key);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); if (musicTimer) clearInterval(musicTimer); audioCtx?.close(); };
  }, [soundOn, musicOn]);

  return (
    <div className="absolute inset-0 bg-black" onPointerDown={() => !gameOver && jumpRef.current()}>
      <canvas ref={canvasRef} width={GAME_W} height={GAME_H} className="w-full h-full object-cover touch-none select-none" />
      {!gameOver && (
        <div className="absolute top-2 left-2 flex gap-2">
          <button onClick={() => onExit(stateRef.current.score)} className="bg-white/80 rounded-lg px-3 py-1.5 font-bold text-gray-700 text-sm flex items-center gap-1">
            <Icon name="Home" size={16} /> Меню
          </button>
        </div>
      )}
      {!gameOver && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/70 rounded-full px-4 py-1 text-xs font-bold text-gray-700 animate-pulse">
          👆 Тапни / Пробел — прыжок
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
          <h2 className="font-pacifico text-5xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.5)]">Игра окончена</h2>
          <p className="text-white text-2xl font-bold">🎯 Счёт: {score}</p>
          <MenuBtn onClick={() => onExit(score)} icon="ArrowLeft" label="В меню" color="bg-orange-500 hover:bg-orange-600" />
        </div>
      )}
    </div>
  );
}

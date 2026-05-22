'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

// Audio Synthesizer helper using Web Audio API for interactive games
class SoundSynth {
  private static ctx: AudioContext | null = null;

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static playBubblePop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime); // Pitch
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15); // Drop frequency

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Web Audio API not allowed or supported yet.');
    }
  }

  static playZenChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00]; // Pentatonic scale notes
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      
      osc.frequency.setValueAtTime(randomNote, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.65);
    } catch (e) {
      console.warn('Web Audio API error.');
    }
  }
}

export default function ReliefLibraryPage() {
  const { profile, updateProfile, challenges, toggleChallenge } = useMindBloom();
  const [activeTab, setActiveTab] = useState<'games' | 'sound'>('games');
  const [activeGame, setActiveGame] = useState<'none' | 'breath' | 'bubble' | 'memory' | 'zen'>('none');

  // --- 1. Breathing Game State ---
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathIsRunning, setBreathIsRunning] = useState(false);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (breathIsRunning) {
      breathIntervalRef.current = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            // Transition phase
            setBreathPhase(curr => {
              if (curr === 'Inhale') return 'Hold (Full)';
              if (curr === 'Hold (Full)') return 'Exhale';
              if (curr === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4; // Reset to 4s
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathTimer(4);
      setBreathPhase('Inhale');
    }

    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [breathIsRunning]);

  const handleStartBreathing = () => {
    setBreathIsRunning(prev => !prev);
    
    // Auto complete breathing challenge
    const breathChallenge = challenges.find(c => c.id === 'c2');
    if (breathChallenge && !breathChallenge.completed) {
      toggleChallenge('c2');
    }
  };

  // --- 2. Bubble Pop State ---
  const [bubbles, setBubbles] = useState<boolean[]>(Array(12).fill(false));
  const [popCount, setPopCount] = useState(0);

  const handlePopBubble = (index: number) => {
    if (bubbles[index]) return; // Already popped
    
    SoundSynth.playBubblePop();
    const nextBubbles = [...bubbles];
    nextBubbles[index] = true;
    setBubbles(nextBubbles);
    setPopCount(prev => prev + 1);

    // Auto complete challenge if popped some
    if (popCount + 1 >= 12) {
      const nextXp = profile.xp + 15;
      const nextLevel = Math.floor(nextXp / 200) + 1;
      updateProfile({
        xp: nextXp,
        level: nextLevel
      });
    }
  };

  const handleResetBubbles = () => {
    setBubbles(Array(12).fill(false));
    setPopCount(0);
  };

  // --- 3. Memory Match State ---
  const cardIcons = ['🧘', '🌸', '🌊', '🍃', '🌞', '🌙'];
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initMemoryGame = () => {
    // Generate double sets
    const symbols = [...cardIcons, ...cardIcons];
    // Shuffle
    const shuffled = symbols
      .map((symbol, id) => ({ id, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelectedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    if (selectedCards.length >= 2) return;
    const clickedCardIndex = cards.findIndex(c => c.id === id);
    if (cards[clickedCardIndex].flipped || cards[clickedCardIndex].matched) return;

    // Flip card
    const nextCards = [...cards];
    nextCards[clickedCardIndex].flipped = true;
    setCards(nextCards);

    const nextSelection = [...selectedCards, clickedCardIndex];
    setSelectedCards(nextSelection);

    if (nextSelection.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = nextSelection;

      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].matched = true;
          matchedCards[secondIdx].matched = true;
          setCards(matchedCards);
          setSelectedCards([]);
          SoundSynth.playZenChime();

          // Check win
          if (matchedCards.every(c => c.matched)) {
            setIsWon(true);
            const nextXp = profile.xp + 25;
            const nextLevel = Math.floor(nextXp / 200) + 1;
            updateProfile({
              xp: nextXp,
              level: nextLevel
            });
          }
        }, 400);
      } else {
        // Not matching, flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].flipped = false;
          resetCards[secondIdx].flipped = false;
          setCards(resetCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // --- 4. Zen Target Focus State ---
  const [zenScore, setZenScore] = useState(0);
  const [orbPos, setOrbPos] = useState({ top: '40%', left: '50%' });

  const handleOrbClick = () => {
    SoundSynth.playZenChime();
    setZenScore(prev => prev + 10);
    
    // Spawn elsewhere
    const t = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    const l = Math.floor(Math.random() * 70) + 15;
    setOrbPos({ top: `${t}%`, left: `${l}%` });

    if (zenScore + 10 >= 100) {
      const nextXp = profile.xp + 30;
      const nextLevel = Math.floor(nextXp / 200) + 1;
      updateProfile({
        xp: nextXp,
        level: nextLevel
      });
    }
  };

  const resetZenGame = () => {
    setZenScore(0);
    setOrbPos({ top: '40%', left: '50%' });
  };

  useEffect(() => {
    if (activeGame === 'memory') {
      initMemoryGame();
    }
    if (activeGame === 'zen') {
      resetZenGame();
    }
  }, [activeGame]);

  // Ambient sound play states (visual mock)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const soundscapes = [
    { title: 'Forest Rain', desc: 'Soothe anxiety with natural white noise', icon: 'rainy', file: 'rain' },
    { title: 'Ocean Waves', desc: 'Sync breathing to the rise and fall of tides', icon: 'waves', file: 'waves' },
    { title: 'Tibetan Bowls', desc: 'Resonate deep focus and stress relief frequencies', icon: 'gong', file: 'bowl' },
    { title: 'Ambient Space', desc: 'Minimalist synthetic pads for flow and study', icon: 'graphic_eq', file: 'space' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Wellness & Relief Library</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Explore interactive stress-relief grounding mini-games and white noise soundscapes.
        </p>
      </section>

      {/* Tabs list */}
      <section className="flex border-b border-outline-variant/15 select-none">
        <button
          onClick={() => { setActiveTab('games'); setActiveGame('none'); }}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer rounded-[4px] ${
            activeTab === 'games' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Grounding Games
        </button>
        <button
          onClick={() => { setActiveTab('sound'); setActiveGame('none'); }}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer rounded-[4px] ${
            activeTab === 'sound' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Calming Sounds
        </button>
      </section>

      {/* TAB CONTENT: GAMES */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {activeGame === 'none' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Breathing Guide launch */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="material-symbols-outlined text-primary bg-primary/5 p-2 rounded-[4px] text-[24px]">air</span>
                  <h3 className="text-sm font-display font-bold text-on-surface mt-3">Box Breathing Guide</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1">
                    Classic 4-4-4-4 cyclic paced breathing to lower your heart rate and regulate your nervous system.
                  </p>
                </div>
                <button
                  onClick={() => setActiveGame('breath')}
                  className="mt-4 bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold py-2 rounded-[4px] cursor-pointer transition-all border-none"
                >
                  Start Guided Breathe
                </button>
              </div>

              {/* 2. Bubble Pop launch */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="material-symbols-outlined text-secondary bg-secondary/5 p-2 rounded-[4px] text-[24px]">gong</span>
                  <h3 className="text-sm font-display font-bold text-on-surface mt-3">Bubble Pop Relaxation</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1">
                    Pop soft glowing bubbles synthesized with relaxing tone frequencies. Great for sensory stress release.
                  </p>
                </div>
                <button
                  onClick={() => setActiveGame('bubble')}
                  className="mt-4 bg-secondary text-on-secondary hover:bg-secondary/95 text-xs font-bold py-2 rounded-[4px] cursor-pointer transition-all border-none"
                >
                  Enter Bubble Room
                </button>
              </div>

              {/* 3. Memory Match launch */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="material-symbols-outlined text-tertiary bg-tertiary/5 p-2 rounded-[4px] text-[24px]">extension</span>
                  <h3 className="text-sm font-display font-bold text-on-surface mt-3">Zen Memory Match</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1">
                    Flip and match calm symbols in a silent, time-pressure-free card board to focus your attention.
                  </p>
                </div>
                <button
                  onClick={() => setActiveGame('memory')}
                  className="mt-4 bg-tertiary text-on-tertiary hover:bg-tertiary/95 text-xs font-bold py-2 rounded-[4px] cursor-pointer transition-all border-none"
                >
                  Start Card Game
                </button>
              </div>

              {/* 4. Zen Target launch */}
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="material-symbols-outlined text-primary bg-primary/5 p-2 rounded-[4px] text-[24px]">filter_tilt_shift</span>
                  <h3 className="text-sm font-display font-bold text-on-surface mt-3">Zen Focus Target</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1">
                    Click soft rising energy bubbles to clear chaotic thoughts and align focus. Rings sound chimes on click.
                  </p>
                </div>
                <button
                  onClick={() => setActiveGame('zen')}
                  className="mt-4 bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold py-2 rounded-[4px] cursor-pointer transition-all border-none"
                >
                  Open Focus Canvas
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-6 shadow-sm relative">
              {/* Back to games list */}
              <button
                onClick={() => { setActiveGame('none'); setBreathIsRunning(false); }}
                className="absolute top-4 left-4 flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Exit Game
              </button>

              {/* --- Guided Breathing UI --- */}
              {activeGame === 'breath' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 select-none">
                  <div>
                    <h3 className="text-lg font-display font-bold text-on-surface">Box Breathing Guide</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Calm your amygdala with standard cycles</p>
                  </div>

                  {/* Expanding Breathing Box */}
                  <div className="w-56 h-56 flex items-center justify-center relative">
                    <div 
                      className={`absolute inset-0 bg-primary/10 border-2 border-primary/30 transition-all duration-[4000ms] ease-in-out ${
                        !breathIsRunning 
                          ? 'scale-75 opacity-50' 
                          : breathPhase === 'Inhale' 
                            ? 'scale-100 opacity-90 shadow-lg shadow-primary/20' 
                            : breathPhase === 'Hold (Full)' 
                              ? 'scale-100 opacity-100 shadow-xl shadow-primary/30' 
                              : breathPhase === 'Exhale' 
                                ? 'scale-75 opacity-60' 
                                : 'scale-75 opacity-50'
                      }`}
                      style={{ borderRadius: '4px' }}
                    ></div>
                    <div className="relative z-10 space-y-2">
                      <p className="text-xl font-display font-extrabold text-primary transition-all duration-300">
                        {breathPhase}
                      </p>
                      <p className="text-2xl font-extrabold text-on-surface">
                        {breathTimer}s
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartBreathing}
                    className={`px-8 py-3 rounded-[4px] text-xs font-bold transition-all shadow-md cursor-pointer border-none ${
                      breathIsRunning 
                        ? 'bg-red-500 text-on-primary hover:bg-red-600 shadow-red-500/10' 
                        : 'bg-primary text-on-primary hover:bg-primary/95 shadow-primary/15'
                    }`}
                  >
                    {breathIsRunning ? 'Pause Session' : 'Begin Breathing'}
                  </button>
                </div>
              )}

              {/* --- Bubble Pop UI --- */}
              {activeGame === 'bubble' && (
                <div className="py-8 flex flex-col items-center space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-display font-bold text-on-surface">Bubble Pop Relaxation</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Popped: {popCount}/12</p>
                  </div>

                  {/* Grid of bubbles (conforming to 4px border-radius) */}
                  <div className="grid grid-cols-4 gap-4 max-w-xs w-full py-4 select-none">
                    {bubbles.map((isPopped, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePopBubble(idx)}
                        className={`aspect-square rounded-[4px] transition-all duration-300 border flex items-center justify-center cursor-pointer ${
                          isPopped 
                            ? 'bg-outline-variant/10 border-outline-variant/20 scale-90' 
                            : 'bg-gradient-to-tr from-secondary/40 to-secondary-container text-secondary border-secondary/35 shadow-md shadow-secondary/10 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {!isPopped && <span className="w-2.5 h-2.5 bg-white/40 rounded-[1px]"></span>}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleResetBubbles}
                    className="border border-secondary/20 text-secondary hover:bg-secondary/5 px-6 py-2 rounded-[4px] text-xs font-bold cursor-pointer transition-colors bg-transparent"
                  >
                    Restore Bubbles
                  </button>
                </div>
              )}

              {/* --- Memory Match UI --- */}
              {activeGame === 'memory' && (
                <div className="py-6 flex flex-col items-center space-y-5">
                  <div className="text-center">
                    <h3 className="text-lg font-display font-bold text-on-surface">Zen Card Match</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Moves: {moves} | Status: {isWon ? 'Completed! +25 XP' : 'Match the pairs'}</p>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-4 gap-3.5 max-w-sm w-full py-2 select-none">
                    {cards.map((card) => {
                      const isFlipped = card.flipped || card.matched;
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleCardClick(card.id)}
                          className={`aspect-square text-2xl font-bold flex items-center justify-center transition-all duration-300 rounded-[4px] border ${
                            card.matched
                              ? 'bg-secondary/5 border-secondary/15 opacity-70'
                              : isFlipped
                                ? 'bg-white border-primary/45 shadow-sm'
                                : 'bg-primary/20 border-primary/10 hover:bg-primary/25 cursor-pointer text-transparent'
                          }`}
                        >
                          {isFlipped ? card.symbol : '?'}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={initMemoryGame}
                    className="border border-primary/20 text-primary hover:bg-primary/5 px-6 py-2 rounded-[4px] text-xs font-bold cursor-pointer transition-colors bg-transparent"
                  >
                    Reset Cards
                  </button>
                </div>
              )}

              {/* --- Zen Focus UI --- */}
              {activeGame === 'zen' && (
                <div className="py-6 flex flex-col items-center space-y-4 select-none">
                  <div className="text-center">
                    <h3 className="text-lg font-display font-bold text-on-surface">Zen Target Focus</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Zen Rating: {zenScore} XP | Target: 100 XP</p>
                  </div>

                  {/* Focus Canvas */}
                  <div className="w-full max-w-md h-64 bg-surface border border-outline-variant/30 rounded-[4px] relative overflow-hidden shadow-inner">
                    {zenScore >= 100 ? (
                      <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center text-center p-4">
                        <span className="material-symbols-outlined text-[36px] text-secondary">workspace_premium</span>
                        <p className="text-sm font-extrabold text-on-surface mt-2">Mind Cleared & Balanced</p>
                        <p className="text-xs text-on-surface-variant mt-1 font-semibold">+30 XP level bonus credited.</p>
                        <button
                          onClick={resetZenGame}
                          className="mt-4 bg-primary text-on-primary px-5 py-2 rounded-[4px] text-xs font-bold cursor-pointer hover:bg-primary/95 border-none"
                        >
                          Play Again
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleOrbClick}
                        className="w-12 h-12 bg-gradient-to-tr from-primary to-primary-container text-on-primary rounded-[4px] absolute shadow-lg shadow-primary/20 flex items-center justify-center animate-pulse cursor-pointer hover:scale-105 border-none"
                        style={{ 
                          top: orbPos.top, 
                          left: orbPos.left, 
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        🌸
                      </button>
                    )}
                  </div>

                  <button
                    onClick={resetZenGame}
                    className="text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer transition-colors border-none bg-transparent"
                  >
                    Reset Count
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CALMING SOUNDS */}
      {activeTab === 'sound' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {soundscapes.map(track => {
            const isPlaying = playingTrack === track.file;
            return (
              <div 
                key={track.file} 
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary w-12 h-12 flex items-center justify-center rounded-[4px]">
                    <span className="material-symbols-outlined text-[24px]">
                      {isPlaying ? 'graphic_eq' : track.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-on-surface">{track.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-medium">
                      {track.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    SoundSynth.playZenChime();
                    setPlayingTrack(isPlaying ? null : track.file);
                  }}
                  className={`w-10 h-10 rounded-[4px] flex items-center justify-center cursor-pointer transition-all border shrink-0 ${
                    isPlaying 
                      ? 'bg-secondary border-secondary text-on-secondary hover:scale-95' 
                      : 'border-outline-variant/40 text-primary bg-primary/5 hover:bg-primary/10 hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              </div>
            );
          })}
        </section>
      )}

    </div>
  );
}

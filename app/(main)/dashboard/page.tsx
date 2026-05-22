'use client';

import React from 'react';
import Link from 'next/link';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function DashboardPage() {
  const { profile, checkins, challenges, toggleChallenge } = useMindBloom();

  // Get greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get last checkin information
  const lastCheckin = checkins.length > 0 ? checkins[0] : null;

  // Calculate stress status
  const getStressStatus = (stressVal: number) => {
    if (stressVal <= 3) return { text: 'Low Stress', color: 'text-secondary', percent: stressVal * 10 };
    if (stressVal <= 6) return { text: 'Moderate Stress', color: 'text-tertiary', percent: stressVal * 10 };
    return { text: 'High Stress', color: 'text-error', percent: stressVal * 10 };
  };

  const stressInfo = lastCheckin 
    ? getStressStatus(lastCheckin.stressLevel || 3)
    : { text: 'No Logs', color: 'text-on-surface-variant', percent: 0 };

  // Calculate average sleep and focus from last 5 checkins
  const recentCheckins = checkins.slice(0, 5);
  const avgSleep = recentCheckins.length > 0
    ? (recentCheckins.reduce((acc, c) => acc + c.sleepHours, 0) / recentCheckins.length).toFixed(1)
    : '7.0';
  const avgFocus = recentCheckins.length > 0
    ? (recentCheckins.reduce((acc, c) => acc + c.focusScore, 0) / recentCheckins.length).toFixed(1)
    : '7.0';

  // Format time since last checkin
  const getTimeSinceLastCheckin = () => {
    if (!lastCheckin) return 'Never checked in';
    const diffMs = Date.now() - new Date(lastCheckin.timestamp).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  // Determine emotional text based on last checkin mood value (1-10)
  const getMoodEmotion = (value: number) => {
    if (value >= 8) return { emoji: '🧘', text: 'Feeling Calm' };
    if (value >= 6) return { emoji: '😊', text: 'Feeling Good' };
    if (value >= 4) return { emoji: '😐', text: 'Feeling Neutral' };
    return { emoji: '😔', text: 'Feeling Low' };
  };

  const moodDetails = lastCheckin 
    ? getMoodEmotion(lastCheckin.value) 
    : { emoji: '🌱', text: 'Ready to Check In' };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-on-surface">
            {getGreeting()}, {profile.name}.
          </h1>
          <p className="text-base text-on-surface-variant mt-1.5 font-medium">
            {lastCheckin 
              ? `Your last check-in was logged ${getTimeSinceLastCheckin()}.` 
              : "Let's capture your current wellbeing today."}
          </p>
        </div>
        <Link 
          href="/mood" 
          className="inline-flex items-center justify-center bg-primary text-on-primary hover:bg-primary/90 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0 w-fit"
        >
          <span className="material-symbols-outlined text-[20px] mr-2">add</span>
          New Mood Entry
        </Link>
      </section>

      {/* Overview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Summary Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-container/20 to-primary/10 border border-primary-container/20 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="bg-background/80 backdrop-blur-md w-14 h-14 flex items-center justify-center text-3xl shadow-sm border border-outline-variant/10"
                style={{ borderRadius: '50%' }}
              >
                {moodDetails.emoji}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-primary">{moodDetails.text}</h2>
                <p className="text-xs text-on-surface-variant font-semibold mt-0.5">
                  {lastCheckin 
                    ? `Stress rating: ${lastCheckin.stressLevel}/10 • Logged ${lastCheckin.date}` 
                    : 'Start logging daily to monitor stress'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-on-surface-variant font-medium max-w-lg">
                {lastCheckin 
                  ? `"${lastCheckin.note || 'No notes written for this entry.'}"`
                  : "Keep track of anxiety, stress, focus, and sleep patterns. Logging your emotional state daily allows us to build personalized wellness suggestions for you."}
              </p>
              
              {lastCheckin && lastCheckin.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {lastCheckin.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center gap-3 relative z-10">
            <Link 
              href="/mood" 
              className="text-xs text-primary font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              View Log History
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          {/* Calm background aesthetic blobs */}
          <div 
            className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"
            style={{ borderRadius: '50%' }}
          ></div>
          <div 
            className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/5 blur-xl group-hover:translate-x-1 transition-transform duration-500 pointer-events-none"
            style={{ borderRadius: '50%' }}
          ></div>
        </div>

        {/* Quick Access Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-display font-bold text-on-surface">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link 
              href="/chat" 
              className="flex flex-col items-start gap-2.5 p-3.5 bg-surface hover:bg-surface-container-high transition-colors rounded-lg border border-outline-variant/15 group"
            >
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                chat_bubble
              </span>
              <span className="text-xs font-bold text-on-surface">AI Chat</span>
            </Link>
            <Link 
              href="/relief" 
              className="flex flex-col items-start gap-2.5 p-3.5 bg-surface hover:bg-surface-container-high transition-colors rounded-lg border border-outline-variant/15 group"
            >
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                air
              </span>
              <span className="text-xs font-bold text-on-surface">Breathing</span>
            </Link>
            <Link 
              href="/relief" 
              className="flex flex-col items-start gap-2.5 p-3.5 bg-surface hover:bg-surface-container-high transition-colors rounded-lg border border-outline-variant/15 group"
            >
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                videogame_asset
              </span>
              <span className="text-xs font-bold text-on-surface">Mini Games</span>
            </Link>
            <Link 
              href="/community" 
              className="flex flex-col items-start gap-2.5 p-3.5 bg-surface hover:bg-surface-container-high transition-colors rounded-lg border border-outline-variant/15 group"
            >
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg group-hover:scale-105 transition-transform">
                forum
              </span>
              <span className="text-xs font-bold text-on-surface">Community</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Wellness Outlook Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-bold text-on-surface">Wellness Outlook</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stress level gauge */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-on-surface-variant mb-3">Stress Index</span>
            <div className="relative w-28 h-28 mb-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-surface-container-high" 
                  cx="56" 
                  cy="56" 
                  fill="transparent" 
                  r="48" 
                  stroke="currentColor" 
                  strokeWidth="8"
                ></circle>
                <circle 
                  className="text-secondary transition-all duration-1000 ease-out" 
                  cx="56" 
                  cy="56" 
                  fill="transparent" 
                  r="48" 
                  stroke="currentColor" 
                  strokeDasharray="301.6" 
                  strokeDashoffset={301.6 - (301.6 * (lastCheckin?.stressLevel || 3)) / 10} 
                  strokeLinecap="round" 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-on-surface">
                  {lastCheckin ? `${lastCheckin.stressLevel}/10` : '—'}
                </span>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  {stressInfo.text}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold">Based on latest check-in</p>
          </div>

          {/* Daily Streak widget */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-on-surface-variant">Daily Streak</span>
              <span className="material-symbols-outlined text-orange-500 fill-current animate-pulse">
                local_fire_department
              </span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-display font-extrabold text-on-surface">{profile.streak}</span>
              <span className="text-sm font-semibold text-on-surface-variant"> Days</span>
            </div>
            <div className="flex gap-1.5 my-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 flex-1 rounded-sm ${
                    i < (profile.streak % 7 || 7) ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                ></div>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold">Keep it up! Next reward at 7 days.</p>
          </div>

          {/* Sleep Widget */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-primary bg-primary/5 p-1.5 rounded-lg text-[20px]">
                bedtime
              </span>
              <span className="text-xs font-bold text-secondary flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                Avg
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface-variant block">Sleep Quality</span>
              <span className="text-xl font-display font-extrabold text-on-surface mt-0.5 block">
                {avgSleep} hrs
              </span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-surface-container-high rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${Math.min(100, (parseFloat(avgSleep) / 8) * 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold mt-1">Recommended: 7-9 hours</p>
          </div>

          {/* Focus Widget */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="material-symbols-outlined text-tertiary bg-tertiary/5 p-1.5 rounded-lg text-[20px]">
                timer
              </span>
              <span className="text-xs font-bold text-tertiary flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-0.5">insights</span>
                Avg
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface-variant block">Focus Rating</span>
              <span className="text-xl font-display font-extrabold text-on-surface mt-0.5 block">
                {avgFocus}/10
              </span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-surface-container-high rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-tertiary transition-all" 
                  style={{ width: `${parseFloat(avgFocus) * 10}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold mt-1">Target score: 8.0 or higher</p>
          </div>
        </div>
      </section>

      {/* Quests and Recommendations Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quest Check-ins */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-bold text-on-surface">Daily Quests</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              Earn XP & Level Up
            </span>
          </div>
          <div className="divide-y divide-outline-variant/15">
            {challenges.map(quest => (
              <div 
                key={quest.id} 
                className="py-3.5 flex items-start gap-4 transition-colors"
              >
                <button 
                  onClick={() => toggleChallenge(quest.id)}
                  className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 transition-all select-none ${
                    quest.completed 
                      ? 'bg-primary border-primary text-on-primary' 
                      : 'border-outline hover:border-primary bg-transparent'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  {quest.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${quest.completed ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>
                      {quest.title}
                    </span>
                    <span className="text-xs font-extrabold text-secondary">+{quest.xpReward} XP</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-medium">
                    {quest.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized recommendations */}
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">lightbulb</span>
              <span>Recommender</span>
            </div>
            <h3 className="text-lg font-display font-bold text-on-surface">
              {lastCheckin && lastCheckin.value <= 5 
                ? 'Felt stressed today?' 
                : 'Need a mental rest?'}
            </h3>
            <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
              {lastCheckin && lastCheckin.value <= 5
                ? 'We detected high anxiety indicators. Practice our calm breathing bubble or let our companion AI chat it out.'
                : 'Give yourself permission to pause. Try our 3-minute paced breathing exercise to restore focus and emotional calm.'}
            </p>
          </div>

          <div className="mt-6 relative z-10">
            <Link 
              href="/relief" 
              className="w-full inline-flex items-center justify-center bg-primary text-on-primary hover:bg-primary/90 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-primary/15"
            >
              <span className="material-symbols-outlined text-[16px] mr-1.5">play_arrow</span>
              Start Breathing Guide
            </Link>
          </div>

          {/* Aesthetic graphic backing */}
          <div 
            className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 blur-xl group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            style={{ borderRadius: '50%' }}
          ></div>
        </div>
      </section>
    </div>
  );
}

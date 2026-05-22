'use client';

import React, { useState } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { AnomalyDetectionService } from '@/services/anomaly-detection';
import { MoodScoringEngine } from '@/services/mood-scoring-engine';

export default function MoodPage() {
  const { checkins, addCheckin } = useMindBloom();

  // Form State
  const [moodValue, setMoodValue] = useState(7);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [focusScore, setFocusScore] = useState(7);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState(false);

  const availableTags = [
    'Calm', 'Focused', 'Energetic', 'Productive', 'Grateful', 
    'Anxious', 'Tired', 'Overwhelmed', 'Sad', 'Distracted'
  ];

  // Dynamic feedback descriptor for mood slider
  const getMoodDescriptor = (val: number) => {
    if (val <= 2) return { text: 'Deep distress', emoji: '😭', color: 'text-red-500' };
    if (val <= 4) return { text: 'Down / Low', emoji: '😔', color: 'text-orange-500' };
    if (val <= 6) return { text: 'Neutral / Okay', emoji: '😐', color: 'text-amber-500' };
    if (val <= 8) return { text: 'Peaceful / Calm', emoji: '😊', color: 'text-secondary' };
    return { text: 'Joyful / Zen', emoji: '🧘', color: 'text-primary' };
  };

  const currentMoodDesc = getMoodDescriptor(moodValue);

  // Toggle tag selection
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Submit check-in
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckin(moodValue, note, selectedTags, sleepHours, focusScore);
    
    // Reset form
    setNote('');
    setSelectedTags([]);
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  // Anomaly alert analysis
  const trendAlert = AnomalyDetectionService.analyzeMoodTrends(checkins);

  // Calculate current stress calculation preview in the UI
  const previewStress = MoodScoringEngine.calculateStressLevel(moodValue, sleepHours, focusScore);
  const previewStressDesc = MoodScoringEngine.getStressDescription(previewStress);

  // Calendar cells generation (simulate last 28 days grid)
  const getCalendarDays = () => {
    // Generate an array of 28 dates ending today
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Find matching log in checkins
      const log = checkins.find(c => c.date === dateStr);
      days.push({
        date: d,
        log: log || null
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Isolation Forest / Anomaly Alert Message Banner */}
      {trendAlert.isAnomaly && (
        <div className={`p-4 border rounded-[4px] flex items-start gap-3.5 ${
          trendAlert.severity === 'critical' 
            ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' 
            : 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400'
        }`}>
          <span className="material-symbols-outlined text-[24px] shrink-0 fill-current">
            {trendAlert.severity === 'critical' ? 'dangerous' : 'warning'}
          </span>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {trendAlert.severity === 'critical' ? 'Wellness Warning' : 'Emotional Pattern Alert'}
            </h4>
            <p className="text-xs font-medium mt-1 leading-relaxed">
              {trendAlert.message}
            </p>
            {trendAlert.suggestAction && (
              <div className="mt-3 flex gap-4">
                <a 
                  href="/chat" 
                  className="text-xs font-bold underline hover:no-underline"
                >
                  Chat with Bloom Companion
                </a>
                <a 
                  href="#emergency" 
                  onClick={() => alert("Emergency resources list is located in the site footer.")}
                  className="text-xs font-bold underline hover:no-underline text-red-500"
                >
                  View Support Lines
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Form + History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Check-in Form */}
        <section className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-6 shadow-sm">
          <h2 className="text-lg font-display font-bold text-on-surface mb-5">Log Your Mental State</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mood Slider (1-10) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant">General Mood Rating</label>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={currentMoodDesc.color}>{currentMoodDesc.emoji}</span>
                  <span className={currentMoodDesc.color}>{currentMoodDesc.text}</span>
                  <span className="text-on-surface-variant font-medium">({moodValue}/10)</span>
                </div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={moodValue}
                onChange={(e) => setMoodValue(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-[4px] appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1">
                <span>Distressed (1)</span>
                <span>Neutral (5)</span>
                <span>Ecstatic (10)</span>
              </div>
            </div>

            {/* Sleep Hours Input & Focus Slider Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Sleep Hours Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant">Sleep Duration</label>
                  <span className="text-xs font-bold text-primary">{sleepHours} hours</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface-container-high rounded-[4px] appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1">
                  <span>4h</span>
                  <span>8h (Ideal)</span>
                  <span>12h</span>
                </div>
              </div>

              {/* Focus Level Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant">Focus & Attention</label>
                  <span className="text-xs font-bold text-tertiary">{focusScore}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={focusScore}
                  onChange={(e) => setFocusScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container-high rounded-[4px] appearance-none cursor-pointer accent-tertiary"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1">
                  <span>Distracted (1)</span>
                  <span>Average (5)</span>
                  <span>Hyper-Focus (10)</span>
                </div>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant block">Emotional Labels (Select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-surface border-outline-variant/15 text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant block">Reflection / Journal Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What happened today? How did you respond to stressful moments? Write anything you want..."
                rows={3}
                className="w-full bg-surface border border-outline-variant/30 rounded-[4px] p-3 text-xs focus:outline-none focus:border-primary placeholder-on-surface-variant/40 leading-relaxed font-medium"
              />
            </div>

            {/* Real-time calculated stress preview */}
            <div className="bg-surface border border-outline-variant/15 p-4 rounded-[4px] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Estimated Stress Index</p>
                <p className="text-sm font-extrabold text-secondary mt-0.5">{previewStressDesc}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-extrabold text-on-surface">{previewStress}</span>
                <span className="text-xs text-on-surface-variant font-semibold">/10</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center bg-primary text-on-primary hover:bg-primary/95 py-3 rounded-[4px] text-xs font-bold shadow-md shadow-primary/15 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">send</span>
              Save Daily Entry
            </button>

            {successMessage && (
              <div className="text-center text-xs font-bold text-secondary animate-pulse">
                ✓ Entry saved successfully! +20 XP awarded.
              </div>
            )}

          </form>
        </section>

        {/* Right Side: Stress Calendar & History List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Stress Heatmap Grid */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm">
            <h3 className="text-sm font-display font-bold text-on-surface mb-3 flex items-center justify-between">
              <span>Stress Heatmap</span>
              <span className="text-[10px] text-on-surface-variant font-semibold">Last 28 Days</span>
            </h3>
            
            <div className="grid grid-cols-7 gap-1.5 select-none">
              {calendarDays.map((cell, idx) => {
                let cellColor = 'bg-surface-container-high'; // No log
                let titleStr = `${cell.date.toLocaleDateString()}: No log`;

                if (cell.log) {
                  const stress = cell.log.stressLevel || 3;
                  titleStr = `${cell.date.toLocaleDateString()}: Stress rating ${stress}/10 (${cell.log.note.slice(0, 30)}...)`;
                  if (stress <= 3) cellColor = 'bg-secondary';
                  else if (stress <= 6) cellColor = 'bg-tertiary-container';
                  else cellColor = 'bg-error';
                }

                return (
                  <div
                    key={idx}
                    className={`aspect-square w-full rounded-sm relative group cursor-help transition-all hover:scale-110 ${cellColor}`}
                    title={titleStr}
                  >
                    {/* Tiny date tooltips */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[8px] font-bold py-1 px-1.5 rounded shadow-lg whitespace-nowrap z-30">
                      {titleStr}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10 text-[10px] text-on-surface-variant font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-surface-container-high rounded-sm"></span> None
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-secondary rounded-sm"></span> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-tertiary-container rounded-sm"></span> Mod
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-error rounded-sm"></span> High
              </span>
            </div>
          </section>

          {/* Recent History Stream */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm max-h-[360px] overflow-y-auto flex flex-col">
            <h3 className="text-sm font-display font-bold text-on-surface mb-3">Logs History</h3>
            <div className="space-y-3.5 flex-1 overflow-y-auto">
              {checkins.length === 0 ? (
                <p className="text-xs text-on-surface-variant font-medium py-4 text-center">No check-ins yet.</p>
              ) : (
                checkins.map(log => {
                  const stress = log.stressLevel || 3;
                  let dotColor = 'bg-secondary';
                  if (stress > 6) dotColor = 'bg-error';
                  else if (stress > 3) dotColor = 'bg-tertiary';

                  return (
                    <div 
                      key={log.id} 
                      className="border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-on-surface">{log.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} style={{ borderRadius: '50%' }}></span>
                          <span className="text-[10px] font-extrabold text-on-surface-variant">Stress: {stress}/10</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-semibold mt-1 italic">
                        {log.note ? `"${log.note}"` : 'No reflection notes.'}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] text-on-surface-variant/80 font-bold">
                          Sleep: {log.sleepHours}h • Focus: {log.focusScore}/10
                        </span>
                        {log.tags.length > 0 && (
                          <span className="text-[9px] text-primary font-bold">
                            {log.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { AnomalyDetectionService } from '@/services/anomaly-detection';

export default function AnalyticsPage() {
  const { checkins } = useMindBloom();

  // 1. Calculate Average Statistics
  const totalEntries = checkins.length;
  const recentEntries = checkins.slice(0, 7); // Last 7 check-ins
  const avgMood = recentEntries.length > 0
    ? (recentEntries.reduce((sum, item) => sum + item.value, 0) / recentEntries.length).toFixed(1)
    : '—';
  
  const avgSleep = recentEntries.length > 0
    ? (recentEntries.reduce((sum, item) => sum + item.sleepHours, 0) / recentEntries.length).toFixed(1)
    : '—';

  const avgStress = recentEntries.length > 0
    ? (recentEntries.reduce((sum, item) => sum + (item.stressLevel || 3), 0) / recentEntries.length).toFixed(1)
    : '—';

  const avgFocus = recentEntries.length > 0
    ? (recentEntries.reduce((sum, item) => sum + item.focusScore, 0) / recentEntries.length).toFixed(1)
    : '—';

  // 2. Generate SVG coordinates for Stress Trend Graph (Last 6 entries)
  const renderTrendGraph = () => {
    if (checkins.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center border border-dashed border-outline-variant/30 rounded-lg text-xs text-on-surface-variant font-medium">
          Not enough mood logs to display trend lines. Log at least 2 entries.
        </div>
      );
    }

    // Get last 6 entries in chronological order
    const data = [...checkins.slice(0, 6)].reverse();
    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate (x, y) coordinates
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      // Stress rating (1-10): 1 is bottom, 10 is top
      const val = item.stressLevel || 3;
      const y = padding + chartHeight - ((val - 1) / 9) * chartHeight;
      return { x, y, label: item.date.slice(5), val }; // MM-DD
    });

    // Create SVG Path string
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
      <div className="w-full overflow-x-auto select-none pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[450px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            return (
              <line 
                key={idx} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                className="stroke-outline-variant/15" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`}
            className="fill-primary/5"
          />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            className="stroke-primary"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-surface stroke-primary"
                strokeWidth="2.5"
              />
              {/* Text value indicator */}
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="fill-on-surface text-[9px] font-extrabold"
              >
                {pt.val}
              </text>
              {/* X Axis Label */}
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                className="fill-on-surface-variant text-[8px] font-bold"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // 3. Dynamic AI Recommendation Text Summary
  const getAIRecommendations = () => {
    if (checkins.length === 0) {
      return "Log your emotional wellbeing parameters to generate custom clinical recommendations.";
    }

    const recentNoteWords = checkins.slice(0, 4).map(c => c.note.toLowerCase()).join(' ');
    const anxietyMatches = recentNoteWords.match(/(anxio|panic|worry|scared|fear)/g);
    const tiredMatches = recentNoteWords.match(/(tired|exhaust|burn|sleep|weary)/g);
    const stressMatches = recentNoteWords.match(/(stress|work|deadlin|exam|press)/g);

    if (anxietyMatches && anxietyMatches.length >= 2) {
      return "We detected elevated anxiety patterns. Refrain from excess caffeine. Focus on breathing guide activities in the Relief Library for 5 minutes twice daily.";
    }
    if (tiredMatches && tiredMatches.length >= 2) {
      return "Your logs show high tiredness fatigue tags. We recommend prioritizing 8 hours of sleep. Try playing Forest Rain soundscapes at 10:00 PM to assist deep sleep cycles.";
    }
    if (stressMatches && stressMatches.length >= 2) {
      return "Heavy work stressors identified. Practice box breathing between client calls. Take a 3-minute mini-break every 90 minutes to restore mental bandwidth.";
    }

    return "Your emotional wellbeing indices are currently stable. Maintain daily mood reflections, challenge quests, and chat checkins to preserve mental focus.";
  };

  // 4. Anomaly detector report
  const trendAlert = AnomalyDetectionService.analyzeMoodTrends(checkins);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Insights & Analytics</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Detailed overview of emotional ratings, stress indicators, and sleep data over your past logs.
        </p>
      </section>

      {/* Stats Counter Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mood Avg card */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Average Mood</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-extrabold text-primary">{avgMood}</span>
            <span className="text-xs text-on-surface-variant font-semibold">/10</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">Last 7 check-ins</p>
        </div>

        {/* Sleep Avg card */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Average Sleep</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-extrabold text-secondary">{avgSleep}</span>
            <span className="text-xs text-on-surface-variant font-semibold">hrs</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">Goal: 7.5+ hours</p>
        </div>

        {/* Stress score avg card */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Average Stress</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-extrabold text-tertiary">{avgStress}</span>
            <span className="text-xs text-on-surface-variant font-semibold">/10</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium font-semibold text-secondary">Low-to-Moderate</p>
        </div>

        {/* Focus avg card */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-5 shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Average Focus</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-extrabold text-primary">{avgFocus}</span>
            <span className="text-xs text-on-surface-variant font-semibold">/10</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">Active attention index</p>
        </div>
      </section>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Graph */}
        <section className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-bold text-on-surface">Stress Rating Trend</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 font-medium">Visual log representation of stress indices</p>
          </div>
          <div className="flex-1 flex items-center mt-4">
            {renderTrendGraph()}
          </div>
        </section>

        {/* AI Recommendations summary */}
        <section className="lg:col-span-4 bg-surface-container border border-outline-variant/20 rounded-lg p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>AI Clinical Summary</span>
            </div>
            
            <p className="text-xs leading-relaxed text-on-surface-variant font-semibold">
              Our analyzer parsed your recent mood parameters and sleep logs:
            </p>
            
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/15 p-4 rounded-lg">
              <p className="text-xs leading-relaxed text-on-surface font-semibold">
                "{getAIRecommendations()}"
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/10 text-[10px] text-on-surface-variant font-bold relative z-10">
            {trendAlert.isAnomaly ? (
              <span className="text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Anomalous patterns registered.
              </span>
            ) : (
              <span className="text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                All metrics are within stable levels.
              </span>
            )}
          </div>
          
          <div 
            className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 blur-xl group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            style={{ borderRadius: '50%' }}
          ></div>
        </section>

      </div>
    </div>
  );
}

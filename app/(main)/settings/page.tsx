'use client';

import React, { useState } from 'react';
import { useMindBloom } from '@/components/ui/mindbloom-provider';
import { useTheme } from '@/components/ui/theme-provider';

export default function SettingsPage() {
  const { profile, updateProfile, checkins } = useMindBloom();
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [privacyLevel, setPrivacyLevel] = useState(2); // 1 = High, 2 = Medium, 3 = Low
  const [showExportAlert, setShowExportAlert] = useState(false);

  // Get description for privacy index
  const getPrivacyDesc = (level: number) => {
    if (level === 1) return { title: 'Strict Confidentiality', desc: 'All mood journals, reflection details, and AI chat logs remain strictly on this device. Zero data sent to researchers.' };
    if (level === 2) return { title: 'Anonymized Research Share', desc: 'Mood check-in averages (scores only, no text notes) are aggregated anonymously to optimize mental health trends.' };
    return { title: 'Open Clinician Share', desc: 'Allows sharing wellness dashboards with registered counselors or mental health professionals for coordinated therapy.' };
  };

  const currentPrivacy = getPrivacyDesc(privacyLevel);

  const handleNotificationToggle = () => {
    updateProfile({
      notificationsEnabled: !profile.notificationsEnabled
    });
  };

  // Premium feature: Export user data as a downloadable JSON file
  const handleExportData = () => {
    const dataStr = JSON.stringify({ profile, checkins }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and download
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindbloom_wellness_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportAlert(true);
    setTimeout(() => setShowExportAlert(false), 4000);
  };

  // Reset local storage
  const handleResetData = () => {
    const confirm = window.confirm("Are you sure you want to reset all MindBloom data? This will clear all mood logs, level progress, badges, and onboarding variables permanently.");
    if (confirm) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <section>
        <h1 className="text-2xl font-display font-extrabold text-on-surface">Application Settings</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Customize notifications, toggle theme modes, adjust privacy levels, and export or reset your local data.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Display and Notification settings */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* General customization card */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-display font-bold text-on-surface">Preferences</h3>
            
            {/* Dark mode toggle control */}
            <div className="flex items-center justify-between py-2 border-b border-outline-variant/10">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Dark Mode Interface</h4>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Toggle interface styling palette</p>
              </div>
              
              <button
                onClick={toggleTheme}
                className="bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold px-4 py-2 rounded-[4px] transition-all cursor-pointer shadow-sm select-none"
              >
                {theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
              </button>
            </div>

            {/* Notifications toggle control */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Daily Check-in Reminders</h4>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Send a quick morning check-in reminder</p>
              </div>
              
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`text-xs font-bold px-4 py-2 rounded-[4px] transition-all cursor-pointer border select-none ${
                  profile.notificationsEnabled
                    ? 'bg-secondary/10 border-secondary text-secondary hover:bg-secondary/15'
                    : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline'
                }`}
              >
                {profile.notificationsEnabled ? 'Reminders On' : 'Reminders Off'}
              </button>
            </div>

          </div>

          {/* Privacy Slider Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-bold text-on-surface">Data Privacy Controls</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-on-surface">Sharing Policy</span>
                <span className="text-xs font-extrabold text-primary">{currentPrivacy.title}</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-[4px] appearance-none cursor-pointer accent-primary"
              />
              
              <div className="flex justify-between text-[9px] text-on-surface-variant font-bold px-1 select-none">
                <span>Strict (1)</span>
                <span>Anonymized (2)</span>
                <span>Clinician (3)</span>
              </div>

              <div className="bg-surface border border-outline-variant/15 p-3 rounded-[4px] mt-3">
                <p className="text-[10px] leading-relaxed text-on-surface-variant font-semibold">
                  {currentPrivacy.desc}
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Right pane: Export and Reset controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Data Portability Card */}
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-[4px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-bold text-on-surface">Data Portability</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              We respect your right to hold and move your personal history. You can request a copy of all log records in JSON format.
            </p>

            {showExportAlert && (
              <div className="p-3 bg-secondary/15 border border-secondary/20 text-secondary text-[11px] font-bold rounded-[4px] text-center animate-pulse">
                ✓ Check-in data compiled. Downloading file.
              </div>
            )}

            <button
              onClick={handleExportData}
              className="w-full inline-flex items-center justify-center bg-primary text-on-primary hover:bg-primary/95 py-2.5 rounded-[4px] text-xs font-bold transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">download</span>
              Export Wellness History
            </button>
          </section>

          {/* Reset Application Card */}
          <section className="bg-red-500/5 border border-red-500/20 rounded-[4px] p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-500">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              <h3 className="text-xs font-display font-bold">Danger Zone</h3>
            </div>
            <p className="text-[10px] leading-relaxed text-on-surface-variant font-medium">
              Resetting deletes all files, database indices, and profiles cached in this browser session. This action is irreversible.
            </p>
            <button
              onClick={handleResetData}
              className="w-full bg-red-500 text-on-primary hover:bg-red-600 py-2.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Erase Platform Data
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMindBloom } from '@/components/ui/mindbloom-provider';

export default function OnboardingPersonalPage() {
  const router = useRouter();
  const { profile, updateProfile } = useMindBloom();
  const [selectedGender, setSelectedGender] = useState<string>(profile.gender || 'Female');
  const [selectedSmoking, setSelectedSmoking] = useState<string>(profile.smoking || 'No');
  const [selectedAlcohol, setSelectedAlcohol] = useState<string>(profile.alcohol || 'Never');

  const handleContinue = () => {
    updateProfile({ 
      gender: selectedGender,
      smoking: selectedSmoking,
      alcohol: selectedAlcohol
    });
    router.push('/onboarding/intentions');
  };

  const genderOptions = [
    { id: 'Female', label: 'Female', icon: 'female' },
    { id: 'Male', label: 'Male', icon: 'male' },
    { id: 'Non-binary', label: 'Non-binary', icon: 'transgender' },
    { id: 'Prefer not to say', label: 'Prefer not to say', icon: 'visibility_off' },
  ];

  const smokingOptions = ['Yes', 'No', 'Occasional'];
  
  const alcoholOptions = ['Never', 'Occasional', 'Weekly', 'Daily'];

  return (
    <div className="flex flex-col items-center">
      {/* Onboarding Question */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          Personal details & habits
        </h2>
        <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto">
          Help us customize your safe space and recommendations.
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6 mb-8">
        {/* Gender Identity */}
        <div className="glass-card p-6 border border-outline-variant/35 flex flex-col gap-4" style={{ borderRadius: '4px' }}>
          <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            How do you identify?
          </span>
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((option) => {
              const isActive = selectedGender === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedGender(option.id)}
                  className={`p-3.5 flex items-center justify-between group cursor-pointer transition-all border ${
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-outline-variant/35 hover:border-primary/20 hover:bg-surface-container-low/50'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg group-hover:scale-105 transition-transform ${
                        isActive ? 'text-primary' : 'text-on-surface-variant/80'
                      }`}
                    >
                      {option.icon}
                    </span>
                    <span className="font-sans text-xs font-semibold text-foreground">
                      {option.label}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isActive ? 'border-primary' : 'border-outline-variant'
                    }`}
                    style={{ borderRadius: '50%' }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-primary transition-transform duration-200 ${
                        isActive ? 'scale-100' : 'scale-0'
                      }`}
                      style={{ borderRadius: '50%' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Habits Block */}
        <div className="glass-card p-6 border border-outline-variant/35 flex flex-col gap-6" style={{ borderRadius: '4px' }}>
          {/* Smoking Habits */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Do you smoke?
            </span>
            <div className="flex flex-wrap gap-2">
              {smokingOptions.map((opt) => {
                const isActive = selectedSmoking === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedSmoking(opt)}
                    className={`px-4 py-2.5 text-xs font-semibold font-sans transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border-outline-variant/40'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alcohol Habits */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Alcohol Consumption
            </span>
            <div className="flex flex-wrap gap-2">
              {alcoholOptions.map((opt) => {
                const isActive = selectedAlcohol === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedAlcohol(opt)}
                    className={`px-4 py-2.5 text-xs font-semibold font-sans transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border-outline-variant/40'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => router.push('/onboarding/role')}
          className="flex-1 py-3.5 border border-primary/20 hover:bg-primary/5 text-primary font-sans text-sm font-semibold transition-all cursor-pointer"
          style={{ borderRadius: '4px' }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 py-3.5 bg-primary text-on-primary font-sans text-sm font-semibold shadow-md cursor-pointer hover:bg-primary-hover transition-all"
          style={{ borderRadius: '4px' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

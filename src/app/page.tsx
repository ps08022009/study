"use client";
import { useState, useEffect, useRef } from 'react';

type Subject = {
  id: string;
  name: string;
  emoji: string;
  hours: number;
};

type LogEntry = {
  id: string;
  date: string;
  hours: number;
  subjectId: string;
};

type LofiStation = {
  id: string;
  name: string;
  url: string;
};

type Badge = {
  id: string;
  emoji: string;
  name: string;
  hoursRequired: number;
  dateEarned: string;
};

export default function Home() {
  const subjects: Subject[] = [
    { id: 'precalc', name: 'Pre-Calculus', emoji: '📐', hours: 0 },
    { id: 'hlit', name: 'Honors Literature', emoji: '📚', hours: 0 },
    { id: 'webdesign', name: 'Web Design', emoji: '💻', hours: 0 },
    { id: 'japanese', name: 'Japanese', emoji: '🏯', hours: 0 },
    { id: 'apworld', name: 'AP World History', emoji: '🌍', hours: 0 },
    { id: 'deca', name: 'DECA', emoji: '💼', hours: 0 },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪', hours: 0 },
    { id: 'sat', name: 'SAT', emoji: '📝', hours: 0 },
  ];

  const badgeTemplates: Badge[] = [
    { id: 'badge1', emoji: '🌟', name: 'Study Star', hoursRequired: 15, dateEarned: '' },
    { id: 'badge2', emoji: '🎯', name: 'Focus Master', hoursRequired: 30, dateEarned: '' },
    { id: 'badge3', emoji: '⚡', name: 'Power Learner', hoursRequired: 50, dateEarned: '' },
    { id: 'badge4', emoji: '🏆', name: 'Study Champion', hoursRequired: 100, dateEarned: '' },
    { id: 'badge5', emoji: '👑', name: 'Knowledge King', hoursRequired: 200, dateEarned: '' },
  ];

  const lofiStations: LofiStation[] = [
    { id: 'lofi1', name: 'Lofi Girl', url: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
    { id: 'lofi2', name: 'Chilled Cow', url: 'https://www.youtube.com/embed/rUxyA-v-cTg' },
    { id: 'lofi3', name: 'Coffee Shop', url: 'https://www.youtube.com/embed/-5KAN9_CzSA' },
  ];

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0].id);
  const [hours, setHours] = useState(2.5);
  const [studyLog, setStudyLog] = useState<LogEntry[]>(() => {
    const savedLog = localStorage.getItem('studyLog');
    return savedLog ? JSON.parse(savedLog) : [];
  });
  const [badges, setBadges] = useState<Badge[]>(() => {
    const savedBadges = localStorage.getItem('badges');
    return savedBadges ? JSON.parse(savedBadges) : badgeTemplates;
  });
  const [showNotification, setShowNotification] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  
  const [currentStation, setCurrentStation] = useState<LofiStation>(lofiStations[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLIFrameElement>(null);
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const dailyGoal = 8;
  const progressOffset = circumference - (hours / dailyGoal) * circumference;

  // Calculate total hours studied
  const totalHours = studyLog.reduce((sum, entry) => sum + entry.hours, 0);

  // Calculate subject totals
  const subjectTotals = subjects.map(subject => ({
    ...subject,
    hours: studyLog
      .filter(entry => entry.subjectId === subject.id)
      .reduce((sum, entry) => sum + entry.hours, 0)
  }));

  // Check for new badges
  useEffect(() => {
    const checkBadges = () => {
      const updatedBadges = badges.map(badge => {
        if (!badge.dateEarned && totalHours >= badge.hoursRequired) {
          const updatedBadge = { ...badge, dateEarned: new Date().toISOString() };
          setNewBadge(updatedBadge);
          setShowNotification(true);
          setBadges(prevBadges => 
            prevBadges.map(b => b.id === badge.id ? updatedBadge : b)
          );
        }
      });
    };
    checkBadges();
  }, [totalHours, badges]);

  // Save badges to localStorage
  useEffect(() => {
    localStorage.setItem('badges', JSON.stringify(badges));
  }, [badges]);

  // Save log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studyLog', JSON.stringify(studyLog));
  }, [studyLog]);

  const addStudySession = () => {
    const newLogEntry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      hours,
      subjectId: selectedSubject,
    };
    setStudyLog(prevLog => [...prevLog, newLogEntry]);
    setHours(2.5);
  };

  const removeLogEntry = (entryId: string) => {
    setStudyLog(prevLog => prevLog.filter(entry => entry.id !== entryId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center p-8">
      {showNotification && newBadge && (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-green-500 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{newBadge.emoji}</span>
            <div>
              <p className="font-medium">New Badge Earned!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{newBadge.name}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-12 tracking-tight">
        Study Buddies 🤝
      </h1>
      {/* Subject Selector */}
      <div className="w-full max-w-md mb-8">
        <div className="grid grid-cols-2 gap-3">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                selectedSubject === subject.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{subject.emoji}</span>
              <span className="font-medium">{subject.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className="relative w-60 h-60 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth="12"
            fill="transparent"
            className="dark:stroke-gray-700"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke={`rgb(${Math.min(255, Math.floor(hours * 70))}, 0, ${Math.max(0, 255 - Math.floor(hours * 30))})`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">
            {hours.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            hours
          </span>
        </div>
      </div>

      {/* Time Controls */}
      <div className="flex gap-6 mb-12">
        <button 
          onClick={() => setHours(Math.max(0, hours - 0.5))}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
        >
          <span className="text-2xl font-medium">−</span>
        </button>
        <button
          onClick={() => setHours(hours + 0.5)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
        >
          <span className="text-2xl font-medium">+</span>
        </button>
        <button
          onClick={addStudySession}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
        >
          <span className="text-lg font-medium">✓</span>
        </button>
      </div>

      {/* Subject Totals */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Subject Totals
        </h2>
        <div className="space-y-3">
          {subjectTotals.map(subject => (
            <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">{subject.emoji}</span>
                <span className="font-medium">{subject.name}</span>
              </div>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {subject.hours.toFixed(1)} hours
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Study Log */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Study Log
        </h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {studyLog.slice().reverse().map(entry => {
            const subject = subjects.find(s => s.id === entry.subjectId);
            return (
              <div key={entry.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(entry.date).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{subject?.emoji}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {entry.hours} hours
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLogEntry(entry.id)}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Your Badges
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {badgeTemplates.map(badge => {
            const earnedBadge = badges.find(b => b.id === badge.id);
            const isEarned = earnedBadge?.dateEarned !== '';
            const progress = Math.min(100, (totalHours / badge.hoursRequired) * 100);
            
            return (
              <div 
                key={badge.id} 
                className={`p-4 rounded-xl border-2 ${
                  isEarned 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {badge.hoursRequired} hours
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isEarned ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isEarned && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Earned on {new Date(earnedBadge!.dateEarned).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

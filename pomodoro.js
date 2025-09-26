import { useState, useEffect, useCallback, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

const SESSION_DURATIONS = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

const PomodoroTimer: NextPage = () => {
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleNextSession = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    setIsActive(false);
    if (sessionType === 'pomodoro') {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      if (newPomodoroCount % 4 === 0) {
        setSessionType('longBreak');
        setTimeRemaining(SESSION_DURATIONS.longBreak);
      } else {
        setSessionType('shortBreak');
        setTimeRemaining(SESSION_DURATIONS.shortBreak);
      }
    } else {
      setSessionType('pomodoro');
      setTimeRemaining(SESSION_DURATIONS.pomodoro);
    }
  }, [sessionType, pomodoroCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleNextSession();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, handleNextSession]);

  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const sessionName = sessionType.replace('B', ' B');
    document.title = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} - ${sessionName.charAt(0).toUpperCase() + sessionName.slice(1)}`;
  }, [timeRemaining, sessionType]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(SESSION_DURATIONS[sessionType]);
  };

  const selectSession = (type: SessionType) => {
    setIsActive(false);
    setSessionType(type);
    setTimeRemaining(SESSION_DURATIONS[type]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = SESSION_DURATIONS[sessionType];
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  const getThemeColors = () => {
    switch (sessionType) {
      case 'pomodoro':
        return { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-200', progress: 'stroke-red-500' };
      case 'shortBreak':
        return { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-200', progress: 'stroke-green-500' };
      case 'longBreak':
        return { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-200', progress: 'stroke-blue-500' };
    }
  };

  const theme = getThemeColors();

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Head>
        <title>Pomodoro Timer</title>
        <meta name="description" content="A simple and beautiful Pomodoro productivity timer." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans transition-colors duration-500`}>
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-3xl shadow-2xl">
          <div className="flex justify-center space-x-2">
            <button onClick={() => selectSession('pomodoro')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${sessionType === 'pomodoro' ? `${theme.bg} text-white` : 'bg-gray-700 hover:bg-gray-600'}`}>Pomodoro</button>
            <button onClick={() => selectSession('shortBreak')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${sessionType === 'shortBreak' ? `${theme.bg} text-white` : 'bg-gray-700 hover:bg-gray-600'}`}>Short Break</button>
            <button onClick={() => selectSession('longBreak')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${sessionType === 'longBreak' ? `${theme.bg} text-white` : 'bg-gray-700 hover:bg-gray-600'}`}>Long Break</button>
          </div>

          <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
            <svg className="absolute w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="12" className="stroke-gray-700" />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                strokeWidth="12"
                className={`${theme.progress} transition-all duration-500`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="z-10 text-center">
              <h1 className="text-6xl font-bold tracking-tighter">{formatTime(timeRemaining)}</h1>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button onClick={resetTimer} className="p-4 text-gray-400 bg-gray-700 rounded-full hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all">
              <RotateCcw size={24} />
            </button>
            <button onClick={toggleTimer} className={`w-24 h-24 flex items-center justify-center text-white font-bold text-xl uppercase tracking-wider rounded-full ${theme.bg} hover:opacity-90 focus:outline-none focus:ring-4 ${theme.ring} transition-all shadow-lg`}>
              {isActive ? <Pause size={40} /> : <Play size={40} />}
            </button>
            <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                {sessionType === 'pomodoro' ? <BookOpen size={24} /> : <Coffee size={24} />}
            </div>
          </div>
        </div>
        <p className="mt-6 text-gray-500">Completed Pomodoros: {pomodoroCount}</p>
        <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" />
      </main>
    </>
  );
};

export default PomodoroTimer;

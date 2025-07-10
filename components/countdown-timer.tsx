'use client'

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-07-20T00:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
      <Clock className="h-4 w-4 text-yellow-300" />
      <div className="text-white/90 text-sm font-eras-medium">
        <span className="font-eras-bold">Beta</span> - Versión completa el 20 de julio
      </div>
      <div className="flex items-center gap-2 text-white/80 text-xs font-eras">
        <span className="font-mono font-eras-bold">{timeLeft.days}d</span>
        <span>:</span>
        <span className="font-mono font-eras-bold">{timeLeft.hours.toString().padStart(2, '0')}h</span>
        <span>:</span>
        <span className="font-mono font-eras-bold">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
        <span>:</span>
        <span className="font-mono font-eras-bold">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer; 
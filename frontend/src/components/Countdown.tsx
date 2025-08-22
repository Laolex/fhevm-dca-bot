import React, { useState, useEffect } from 'react';

interface CountdownProps {
  target: number;
  className?: string;
  showLabel?: boolean;
}

const Countdown: React.FC<CountdownProps> = ({ target, className = '', showLabel = true }) => {
  const [timeLeft, setTimeLeft] = useState(target - Date.now() / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(target - Date.now() / 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (timeLeft <= 0) {
    return (
      <span className={`text-emerald-600 font-semibold ${className}`}>
        {showLabel ? 'Ready to execute' : 'Ready'}
      </span>
    );
  }

  const hrs = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = Math.floor(timeLeft % 60);

  return (
    <span className={`font-mono ${className}`}>
      {hrs > 0 ? `${hrs}h ` : ''}{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </span>
  );
};

export default Countdown;

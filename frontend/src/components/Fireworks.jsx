import React, { useEffect, useState } from 'react';
import './Fireworks.css';

export default function Fireworks() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fireworks-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="firework"
          style={{
            left: `${particle.left}%`,
            '--delay': `${particle.delay}s`,
            '--duration': `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
}

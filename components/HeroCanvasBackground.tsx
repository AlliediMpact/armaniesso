'use client';

import React, { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  targetX: number;
  targetY: number;
}

export const HeroCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Warm color palette
    const colors = [
      'rgba(255, 140, 0, 0.15)',    // Orange
      'rgba(255, 107, 53, 0.12)',   // Warm Orange-Red
      'rgba(255, 184, 77, 0.1)',    // Golden Orange
      'rgba(59, 130, 246, 0.08)',   // Cool Blue accent
    ];

    // Create blobs
    const blobs: Blob[] = [];
    const blobCount = 5;

    for (let i = 0; i < blobCount; i++) {
      const angle = (i / blobCount) * Math.PI * 2;
      const distance = 200 + Math.random() * 200;
      
      blobs.push({
        x: canvas.width / 2 + Math.cos(angle) * distance,
        y: canvas.height / 2 + Math.sin(angle) * distance,
        radius: 100 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: colors[i % colors.length],
        targetX: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8,
        targetY: canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.8,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear with semi-transparent background for motion blur effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw blobs
      blobs.forEach((blob) => {
        // Gentle steering towards target
        const dx = blob.targetX - blob.x;
        const dy = blob.targetY - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          // Pick new target when close
          blob.targetX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8;
          blob.targetY = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.8;
        }

        // Move towards target
        const force = 0.002;
        blob.vx += (dx / distance) * force;
        blob.vy += (dy / distance) * force;

        // Damping
        blob.vx *= 0.98;
        blob.vy *= 0.98;

        // Limit speed
        const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
        if (speed > 2) {
          blob.vx = (blob.vx / speed) * 2;
          blob.vy = (blob.vy / speed) * 2;
        }

        blob.x += blob.vx;
        blob.y += blob.vy;

        // Draw blob with glow effect
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, blob.color.replace('0.', '0.3'));
        gradient.addColorStop(0.5, blob.color);
        gradient.addColorStop(1, blob.color.replace(')', ', 0)'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-60"
      style={{ filter: 'blur(40px)' }}
    />
  );
};

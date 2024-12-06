"use client"

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.min(Math.floor(width * 0.05), 80)
    const particles: Particle[] = []
    
    const colors = [
      'rgba(255, 100, 0, 0.8)',  // Bright orange
      'rgba(255, 150, 50, 0.6)', // Light orange
      'rgba(255, 80, 0, 0.7)',   // Deep orange
    ]
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    
    particlesRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const particles = particlesRef.current
    const maxDistance = 150

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((particle, i) => {
      // Update position with smooth movement
      particle.x += particle.vx
      particle.y += particle.vy

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width
      if (particle.x > canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = canvas.height
      if (particle.y > canvas.height) particle.y = 0

      // Draw particle with glow
      ctx.beginPath()
      ctx.shadowBlur = 15
      ctx.shadowColor = particle.color
      ctx.fillStyle = particle.color
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          
          const gradient = ctx.createLinearGradient(
            particle.x, particle.y, other.x, other.y
          )
          gradient.addColorStop(0, particle.color.replace('0.8', '0.2'))
          gradient.addColorStop(1, 'transparent')
          
          ctx.strokeStyle = gradient
          ctx.lineWidth = Math.max(0.5, (1 - distance / maxDistance) * 2)
          ctx.stroke()
        }
      }
    })

    requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [animate, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  )
}
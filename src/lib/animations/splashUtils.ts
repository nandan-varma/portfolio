import type { SplashParticle } from './types';

export class SplashManager {
    private splashParticles: SplashParticle[] = [];

    constructor(
        private ctx: CanvasRenderingContext2D,
        private checkCollision: (x: number, y: number, radius: number) => false | { x: number; y: number }
    ) {}

    createSplashAtPoint(x: number, y: number) {
        // Create splash particles at collision point
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 1 + Math.random() * 3;
            this.splashParticles.push({
                x: x + Math.cos(angle) * 5,
                y: y + Math.sin(angle) * 5,
                radius: 1 + Math.random() * 2,
                opacity: 0.8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
            });
        }
    }

    update(deltaMultiplier: number) {
        for (let i = 0; i < this.splashParticles.length; i++) {
            const particle = this.splashParticles[i];

            // Update position with delta time
            particle.x += particle.vx * deltaMultiplier;
            particle.y += particle.vy * deltaMultiplier;
            particle.vy += particle.gravity * deltaMultiplier;

            // Check for collision with text
            const collision = this.checkCollision(
                particle.x,
                particle.y,
                particle.radius,
            );
            if (collision) {
                // Bounce off text
                particle.vx *= -0.5;
                particle.vy *= -0.5;

                // Reduce opacity faster
                particle.opacity *= 0.8;
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2,
            );
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();

            // Fade out with delta time
            particle.opacity -= 0.02 * deltaMultiplier;

            // Remove faded particles
            if (particle.opacity <= 0) {
                this.splashParticles.splice(i, 1);
                i--;
            }
        }
    }
}

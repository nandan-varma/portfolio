import type { SplashParticle } from './types';

export class SplashManager {
    private splashParticles: SplashParticle[] = [];
    /** rgba strings indexed by 8-bit alpha, so particles don't allocate per frame. */
    private readonly colors = new Map<number, string>();

    constructor(
        private ctx: CanvasRenderingContext2D,
        private checkCollision: (x: number, y: number, radius: number) => false | { x: number; y: number }
    ) {}

    private color(alpha: number): string {
        const index = Math.max(0, Math.min(255, Math.round(alpha * 255)));
        let color = this.colors.get(index);
        if (!color) {
            color = `rgba(255, 255, 255, ${index / 255})`;
            this.colors.set(index, color);
        }
        return color;
    }

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
            this.ctx.fillStyle = this.color(particle.opacity);
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

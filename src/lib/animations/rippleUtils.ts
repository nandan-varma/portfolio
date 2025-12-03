import type { Ripple } from './types';

export class RippleManager {
    private ripples: Ripple[] = [];
    private readonly perspectiveRatio = 0.4;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private getWaterLevel: () => number,
        private checkCollision: (x: number, y: number, radius: number) => false | { x: number; y: number },
        private onSplash: (x: number, y: number) => void
    ) {}

    createRipple(x: number, radius: number, opacity: number = 1) {
        this.ripples.push({
            x: x,
            y: this.getWaterLevel(),
            radius: radius,
            opacity: opacity,
            speed: 2 + Math.random() * 0.5,
        });
    }

    update(deltaMultiplier: number) {
        for (let i = 0; i < this.ripples.length; i++) {
            const ripple = this.ripples[i];

            // Check for collision with text before drawing
            let collided = false;

            // Only check collision if ripple is expanding
            if (ripple.radius > 20) {
                // Check multiple points around the ripple circumference
                for (
                    let angle = 0;
                    angle < Math.PI * 2;
                    angle += Math.PI / 8
                ) {
                    const checkX = ripple.x + Math.cos(angle) * ripple.radius;
                    const checkY = ripple.y + Math.sin(angle) * ripple.radius;

                    const collision = this.checkCollision(checkX, checkY, 2);
                    if (collision) {
                        collided = true;
                        // Create splash at collision point occasionally
                        if (Math.random() < 0.1) {
                            this.onSplash(collision.x, collision.y);
                        }
                        break;
                    }
                }
            }

            // Draw ripple with perspective (ellipse instead of circle)
            this.ctx.beginPath();
            this.ctx.ellipse(
                ripple.x,
                ripple.y,
                ripple.radius,
                ripple.radius * this.perspectiveRatio,
                0,
                0,
                Math.PI * 2,
            );

            // Create gradient for ripple
            const rippleGradient = this.ctx.createRadialGradient(
                ripple.x,
                ripple.y,
                ripple.radius * 0.7,
                ripple.x,
                ripple.y,
                ripple.radius,
            );
            rippleGradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            rippleGradient.addColorStop(
                0.5,
                `rgba(255, 255, 255, ${ripple.opacity * 0.3})`,
            );
            rippleGradient.addColorStop(
                1,
                `rgba(255, 255, 255, ${ripple.opacity})`,
            );

            this.ctx.strokeStyle = rippleGradient;
            this.ctx.lineWidth = 1.5;

            // Add glow effect
            this.ctx.shadowColor = "white";
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            // Update ripple with delta time
            ripple.radius += ripple.speed * deltaMultiplier;
            // Fade out faster as they get larger or if collided
            ripple.opacity -=
                (0.005 + ripple.radius / 500 + (collided ? 0.02 : 0)) * deltaMultiplier;

            // Remove faded ripples
            if (ripple.opacity <= 0) {
                this.ripples.splice(i, 1);
                i--;
            }
        }
    }

    getRipples() {
        return this.ripples;
    }
}

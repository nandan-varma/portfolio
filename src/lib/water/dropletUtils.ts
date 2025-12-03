import type { Droplet } from './types';

export class DropletManager {
    private droplets: Droplet[] = [];
    private readonly maxDroplets: number;
    private readonly dropletSpawnRate: number;
    private readonly gravity = 0.3;
    private readonly dropletRadius = 10;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private canvas: HTMLCanvasElement,
        private getWaterLevel: () => number,
        private checkCollision: (x: number, y: number, radius: number) => false | { x: number; y: number },
        private onSplash: (x: number, y: number) => void,
        private onRipple: (x: number, radius: number, opacity: number) => void
    ) {
        // Scale based on width: baseline at 1200px
        const widthScale = Math.min(canvas.width / 1200, 1);
        this.maxDroplets = Math.max(8, Math.floor(canvas.width / 8 * widthScale));
        this.dropletSpawnRate = 0.006 * widthScale;
    }

    createDroplet(deltaTime: number) {
        if (
            this.droplets.length < this.maxDroplets &&
            Math.random() < this.dropletSpawnRate * deltaTime
        ) {
            const x = Math.random() * this.canvas.width;
            this.droplets.push({
                x: x,
                y: -20,
                radius: 2 + Math.random() * 3,
                velocity: 0,
                opacity: 0.8 + Math.random() * 0.2,
            });
        }
    }

    update(deltaMultiplier: number) {
        for (let i = 0; i < this.droplets.length; i++) {
            const droplet = this.droplets[i];

            // Apply gravity with delta time
            droplet.velocity += this.gravity * deltaMultiplier;
            droplet.y += droplet.velocity * deltaMultiplier;

            // Draw droplet
            this.ctx.beginPath();
            this.ctx.arc(
                droplet.x,
                droplet.y,
                droplet.radius,
                0,
                Math.PI * 2,
            );

            // Create gradient for droplet
            const dropGradient = this.ctx.createRadialGradient(
                droplet.x - 3,
                droplet.y - 3,
                1,
                droplet.x,
                droplet.y,
                droplet.radius,
            );
            dropGradient.addColorStop(0, "white");
            dropGradient.addColorStop(
                1,
                `rgba(200, 200, 200, ${droplet.opacity})`,
            );

            this.ctx.fillStyle = dropGradient;
            this.ctx.fill();

            // Add highlight
            this.ctx.beginPath();
            this.ctx.arc(
                droplet.x - droplet.radius * 0.3,
                droplet.y - droplet.radius * 0.3,
                droplet.radius * 0.2,
                0,
                Math.PI * 2,
            );
            this.ctx.fillStyle = `rgba(255, 255, 255, ${droplet.opacity})`;
            this.ctx.fill();

            // Check for collision with text
            const collision = this.checkCollision(
                droplet.x,
                droplet.y,
                droplet.radius,
            );
            if (collision) {
                // Create splash at collision point
                this.onSplash(collision.x, collision.y);

                // Remove this droplet
                this.droplets.splice(i, 1);
                i--;
                continue;
            }

            // Check for impact with water
            if (droplet.y + droplet.radius >= this.getWaterLevel()) {
                // Create ripple at water level
                this.onRipple(droplet.x, droplet.radius, droplet.opacity);

                // Remove this droplet
                this.droplets.splice(i, 1);
                i--;
            }
        }
    }
}

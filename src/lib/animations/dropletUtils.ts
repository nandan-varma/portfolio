import type { Droplet, Viewport } from './types';
import { ColorCache } from './colorCache';

export class DropletManager {
    private droplets: Droplet[] = [];
    private maxDroplets = 0;
    private dropletSpawnRate = 0;
    private readonly gravity = 0.3;
    private readonly colors = new ColorCache();

    constructor(
        private ctx: CanvasRenderingContext2D,
        private viewport: Viewport,
        private getWaterLevel: () => number,
        private checkCollision: (x: number, y: number, radius: number) => false | { x: number; y: number },
        private onSplash: (x: number, y: number) => void,
        private onRipple: (x: number, radius: number, opacity: number) => void
    ) {
        this.resize();
    }

    /** Recompute density for the current viewport width. */
    resize() {
        // Scale based on width: baseline at 1200px
        const widthScale = Math.min(this.viewport.width / 1200, 1);
        this.maxDroplets = Math.max(8, Math.floor(this.viewport.width / 8 * widthScale));
        this.dropletSpawnRate = 0.02 * widthScale;
    }

    createDroplet(deltaTime: number) {
        if (
            this.droplets.length < this.maxDroplets &&
            Math.random() < this.dropletSpawnRate * deltaTime
        ) {
            const x = Math.random() * this.viewport.width;
            this.droplets.push({
                x: x,
                y: -20,
                radius: 3 + Math.random() * 3,
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
            dropGradient.addColorStop(1, this.colors.get(200, droplet.opacity));

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
            this.ctx.fillStyle = this.colors.get(255, droplet.opacity);
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

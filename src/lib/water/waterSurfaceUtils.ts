import type { Ripple } from './types';

export class WaterSurface {
    private readonly perspectiveRatio = 0.4;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private canvas: HTMLCanvasElement,
        private getWaterLevel: () => number
    ) {}

    draw(ripples: Ripple[]) {
        const waterLevel = this.getWaterLevel();
        // Draw water surface with grid to show perspective
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.fillRect(
            0,
            waterLevel,
            this.canvas.width,
            this.canvas.height - waterLevel,
        );

        // Draw perspective grid on water
        const gridSize = 40;
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        this.ctx.lineWidth = 0.5;

        // Horizontal lines with perspective
        for (let y = 0; y < this.canvas.height - waterLevel; y += gridSize) {
            this.ctx.beginPath();
            for (let x = 0; x < this.canvas.width; x += 2) {
                // Add wave effect to grid based on ripples
                let waveOffset = 0;
                ripples.forEach((ripple) => {
                    const dx = x - ripple.x;
                    const dy = waterLevel + y - ripple.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (
                        distance < ripple.radius &&
                        distance > ripple.radius - 30
                    ) {
                        const intensity =
                            1 - (ripple.radius - distance) / 30;
                        waveOffset +=
                            Math.sin(distance * 0.2) *
                            intensity *
                            3 *
                            ripple.opacity;
                    }
                });

                const yPos = waterLevel + y + waveOffset;

                if (x === 0) {
                    this.ctx.moveTo(x, yPos);
                } else {
                    this.ctx.lineTo(x, yPos);
                }
            }
            this.ctx.stroke();
        }

        // Vertical lines with perspective
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            for (let y = 0; y < this.canvas.height - waterLevel; y += 2) {
                // Add wave effect to grid based on ripples
                let waveOffset = 0;
                ripples.forEach((ripple) => {
                    const dx = x - ripple.x;
                    const dy = waterLevel + y - ripple.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (
                        distance < ripple.radius &&
                        distance > ripple.radius - 30
                    ) {
                        const intensity =
                            1 - (ripple.radius - distance) / 30;
                        waveOffset +=
                            Math.sin(distance * 0.2) *
                            intensity *
                            2 *
                            ripple.opacity;
                    }
                });

                const xPos = x + waveOffset;

                if (y === 0) {
                    this.ctx.moveTo(xPos, waterLevel + y);
                } else {
                    this.ctx.lineTo(xPos, waterLevel + y);
                }
            }
            this.ctx.stroke();
        }
    }
}

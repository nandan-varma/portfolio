import type { TextBounds, TextPixel } from './types';

export class TextManager {
    private textPixels: TextPixel[] = [];
    private textBounds: TextBounds = { left: 0, right: 0, top: 0, bottom: 0 };
    
    constructor(
        private ctx: CanvasRenderingContext2D,
        private canvas: HTMLCanvasElement,
        private text: string
    ) {}

    generateTextPixels() {
        // Set text style - larger on desktop, smaller on mobile
        const isMobile = this.canvas.width < 768;
        const fontSize = isMobile 
            ? Math.min(this.canvas.width / 10, 72)
            : Math.min(this.canvas.width / 6, 120);
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // Measure text
        const metrics = this.ctx.measureText(this.text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // Clear canvas temporarily to draw text for pixel detection
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);

        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        // Get image data
        const imageData = this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
        );
        const data = imageData.data;

        // Reset textPixels
        this.textPixels = [];

        // Calculate text boundaries
        this.textBounds = {
            left: this.canvas.width / 2 - textWidth / 2,
            right: this.canvas.width / 2 + textWidth / 2,
            top: this.canvas.height / 2 - textHeight / 2,
            bottom: this.canvas.height / 2 + textHeight / 2,
        };

        // Store pixel positions where text exists
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const index = (y * this.canvas.width + x) * 4;
                if (data[index + 3] > 0) {
                    this.textPixels.push({ x, y });
                }
            }
        }

        // Clear canvas again
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    checkTextCollision(x: number, y: number, radius: number): false | { x: number; y: number } {
        // Quick boundary check first
        if (
            x + radius < this.textBounds.left ||
            x - radius > this.textBounds.right ||
            y + radius < this.textBounds.top ||
            y - radius > this.textBounds.bottom
        ) {
            return false;
        }

        // Check against actual pixels
        for (const pixel of this.textPixels) {
            const dx = x - pixel.x;
            const dy = y - pixel.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius) {
                return { x: pixel.x, y: pixel.y };
            }
        }

        return false;
    }

    drawText(torchX?: number, torchY?: number) {
        // Set text style - larger on desktop, smaller on mobile
        const isMobile = this.canvas.width < 768;
        const fontSize = isMobile 
            ? Math.min(this.canvas.width / 10, 72)
            : Math.min(this.canvas.width / 6, 120);
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        const textX = this.canvas.width / 2;
        const textY = this.canvas.height / 2;

        // Draw shadow if torch position is provided
        if (torchX !== undefined && torchY !== undefined) {
            // Calculate shadow offset based on torch position
            const dx = textX - torchX;
            const dy = textY - torchY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize and scale shadow offset
            const shadowScale = 40; // How far the shadow extends
            const shadowOffsetX = (dx / distance) * shadowScale;
            const shadowOffsetY = (dy / distance) * shadowScale;
            
            // Draw shadow with blur
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetX = shadowOffsetX;
            this.ctx.shadowOffsetY = shadowOffsetY;
            
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillText(this.text, textX, textY);
        }

        // Reset shadow for main text
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Create gradient for text
        const gradient = this.ctx.createLinearGradient(
            this.textBounds.left,
            this.textBounds.top,
            this.textBounds.right,
            this.textBounds.bottom,
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");

        this.ctx.fillStyle = gradient;
        this.ctx.fillText(this.text, textX, textY);

        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
}

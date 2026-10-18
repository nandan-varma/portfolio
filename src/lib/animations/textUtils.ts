import type { TextBounds, TextPixel, Viewport } from './types';

export class TextManager {
    private textPixels: TextPixel[] = [];
    private textBounds: TextBounds = { left: 0, right: 0, top: 0, bottom: 0 };

    constructor(
        private ctx: CanvasRenderingContext2D,
        private viewport: Viewport,
        private text: string
    ) {}

    private fontSize(): number {
        const width = this.viewport.width;
        return width < 768
            ? Math.min(width / 10, 72)
            : Math.min(width / 6, 120);
    }

    generateTextPixels() {
        const { width, height } = this.viewport;
        if (width === 0 || height === 0) {
            return;
        }

        const fontSize = this.fontSize();
        const textX = width / 2;
        const textY = height / 2;

        const measureCtx = document.createElement("canvas").getContext("2d");
        if (!measureCtx) {
            return;
        }
        measureCtx.font = `bold ${fontSize}px Arial`;
        const textWidth = measureCtx.measureText(this.text).width;
        const textHeight = fontSize;

        // Calculate text boundaries
        this.textBounds = {
            left: textX - textWidth / 2,
            right: textX + textWidth / 2,
            top: textY - textHeight / 2,
            bottom: textY + textHeight / 2,
        };

        // Rasterize only the text box (not the whole viewport) and keep glyphs at
        // the exact subpixel position they have on the main canvas. The readback
        // happens on a throwaway canvas so the animated one stays GPU-backed.
        const padding = Math.ceil(fontSize * 0.6) + 4;
        const boxWidth = Math.max(1, Math.ceil(textWidth) + padding * 2);
        const boxHeight = Math.max(1, Math.ceil(textHeight) + padding * 2);
        const originX = Math.floor(textX - boxWidth / 2);
        const originY = Math.floor(textY - boxHeight / 2);

        const canvas = document.createElement("canvas");
        canvas.width = boxWidth;
        canvas.height = boxHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            return;
        }

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText(this.text, textX - originX, textY - originY);

        const data = ctx.getImageData(0, 0, boxWidth, boxHeight).data;
        const pixels: TextPixel[] = [];

        for (let y = 0; y < boxHeight; y++) {
            for (let x = 0; x < boxWidth; x++) {
                const index = (y * boxWidth + x) * 4;
                if (data[index + 3] > 0) {
                    pixels.push({ x: originX + x, y: originY + y });
                }
            }
        }

        this.textPixels = pixels;
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
        const { width, height } = this.viewport;
        const fontSize = this.fontSize();

        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        const textX = width / 2;
        const textY = height / 2;

        // Draw shadow if torch position is provided
        if (torchX !== undefined && torchY !== undefined) {
            // Calculate shadow offset based on torch position
            const dx = textX - torchX;
            const dy = textY - torchY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalize and scale shadow offset
            const shadowScale = 30; // How far the shadow extends
            const shadowOffsetX = (dx / distance) * shadowScale;
            const shadowOffsetY = (dy / distance) * shadowScale;

            // Draw shadow with blur
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            this.ctx.shadowBlur = 12;
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

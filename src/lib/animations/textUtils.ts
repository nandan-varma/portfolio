import type { TextBounds, Viewport } from './types';

export class TextManager {
    private glyphs?: ImageData;
    private originX = 0;
    private originY = 0;
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

        this.glyphs = ctx.getImageData(0, 0, boxWidth, boxHeight);
        this.originX = originX;
        this.originY = originY;
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

        const glyphs = this.glyphs;
        if (!glyphs) return false;

        // Visit only pixels inside the droplet's box, retaining the original
        // row-major order so the first collision and splash position are exact.
        const left = Math.max(0, Math.floor(x - radius - this.originX));
        const right = Math.min(glyphs.width - 1, Math.ceil(x + radius - this.originX));
        const top = Math.max(0, Math.floor(y - radius - this.originY));
        const bottom = Math.min(glyphs.height - 1, Math.ceil(y + radius - this.originY));
        for (let py = top; py <= bottom; py++) {
            for (let px = left; px <= right; px++) {
                if (glyphs.data[(py * glyphs.width + px) * 4 + 3] === 0) continue;
                const dx = x - (this.originX + px);
                const dy = y - (this.originY + py);
                if (dx * dx + dy * dy < radius * radius) {
                    return { x: this.originX + px, y: this.originY + py };
                }
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

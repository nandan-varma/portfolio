import type { TextBounds } from './types';

// Collision grid resolution divisor. A full-resolution pixel scan of a
// ~1700x950 canvas touches 1.6M+ pixels and takes tens of milliseconds on
// the main thread; downsampling by this factor cuts that to ~1/16th while
// staying well under the size of anything colliding with it (droplets,
// splashes, ripple probes are all a few pixels in radius).
const GRID_SCALE = 4;

export class TextManager {
    private textBounds: TextBounds = { left: 0, right: 0, top: 0, bottom: 0 };
    private grid: Uint8Array | null = null;
    private gridCols = 0;
    private gridRows = 0;
    private ready = false;

    constructor(
        private ctx: CanvasRenderingContext2D,
        private canvas: HTMLCanvasElement,
        private text: string
    ) {}

    private getFontSize(): number {
        const isMobile = this.canvas.width < 768;
        return isMobile
            ? Math.min(this.canvas.width / 10, 72)
            : Math.min(this.canvas.width / 6, 120);
    }

    generateTextPixels() {
        this.ready = false;

        const width = this.canvas.width;
        const height = this.canvas.height;
        if (width === 0 || height === 0) return;

        const fontSize = this.getFontSize();

        // Text bounds are measured directly against the main context - cheap,
        // and needed for the coarse bounding-box reject in checkTextCollision.
        this.ctx.font = `bold ${fontSize}px Arial`;
        const metrics = this.ctx.measureText(this.text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        this.textBounds = {
            left: width / 2 - textWidth / 2,
            right: width / 2 + textWidth / 2,
            top: height / 2 - textHeight / 2,
            bottom: height / 2 + textHeight / 2,
        };

        // Build the collision grid on a small, detached canvas so this never
        // touches the shared draw context or reads back a full-size frame.
        this.gridCols = Math.max(1, Math.ceil(width / GRID_SCALE));
        this.gridRows = Math.max(1, Math.ceil(height / GRID_SCALE));

        const off = document.createElement('canvas');
        off.width = this.gridCols;
        off.height = this.gridRows;
        const offCtx = off.getContext('2d', { willReadFrequently: true });
        if (!offCtx) return;

        offCtx.scale(1 / GRID_SCALE, 1 / GRID_SCALE);
        offCtx.font = `bold ${fontSize}px Arial`;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = 'white';
        offCtx.fillText(this.text, width / 2, height / 2);

        const imageData = offCtx.getImageData(0, 0, this.gridCols, this.gridRows);
        const data = imageData.data;
        const grid = new Uint8Array(this.gridCols * this.gridRows);
        for (let i = 0, p = 3; i < grid.length; i++, p += 4) {
            grid[i] = data[p] > 0 ? 1 : 0;
        }

        this.grid = grid;
        this.ready = true;
    }

    checkTextCollision(x: number, y: number, radius: number): false | { x: number; y: number } {
        if (!this.ready || !this.grid) return false;

        // Quick boundary check first
        if (
            x + radius < this.textBounds.left ||
            x - radius > this.textBounds.right ||
            y + radius < this.textBounds.top ||
            y - radius > this.textBounds.bottom
        ) {
            return false;
        }

        // Scan only the handful of grid cells the query circle can reach -
        // O(radius^2 / GRID_SCALE^2) instead of O(text pixel count).
        const gx = Math.floor(x / GRID_SCALE);
        const gy = Math.floor(y / GRID_SCALE);
        const gr = Math.max(1, Math.ceil(radius / GRID_SCALE) + 1);

        const minGx = Math.max(0, gx - gr);
        const maxGx = Math.min(this.gridCols - 1, gx + gr);
        const minGy = Math.max(0, gy - gr);
        const maxGy = Math.min(this.gridRows - 1, gy + gr);
        const radiusSq = radius * radius;

        for (let cy = minGy; cy <= maxGy; cy++) {
            const rowOffset = cy * this.gridCols;
            for (let cx = minGx; cx <= maxGx; cx++) {
                if (!this.grid[rowOffset + cx]) continue;

                const px = cx * GRID_SCALE + GRID_SCALE / 2;
                const py = cy * GRID_SCALE + GRID_SCALE / 2;
                const dx = x - px;
                const dy = y - py;
                if (dx * dx + dy * dy < radiusSq) {
                    return { x: px, y: py };
                }
            }
        }

        return false;
    }

    drawText(torchX?: number, torchY?: number) {
        const fontSize = this.getFontSize();
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

import { TorchEffect } from './torchUtils';

export class TorchWallAnimationController {
    private ctx: CanvasRenderingContext2D;
    private torchEffect: TorchEffect;
    private animationFrameId: number | null = null;

    constructor(private canvas: HTMLCanvasElement, initialPosition?: { x: number; y: number }) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = ctx;
        this.torchEffect = new TorchEffect(this.ctx, this.canvas, initialPosition);
    }

    setCanvasDimensions() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initialize() {
        this.setCanvasDimensions();
    }

    handleResize = () => {
        this.setCanvasDimensions();
    }

    animate = () => {
        // Clear canvas
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw torch effect (brick wall with lighting)
        this.torchEffect.draw();

        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    start() {
        this.initialize();
        window.addEventListener("resize", this.handleResize);
        this.animate();
    }

    getMousePosition() {
        return this.torchEffect.getMousePosition();
    }

    cleanup() {
        // Cancel animation frame
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        window.removeEventListener("resize", this.handleResize);
        this.torchEffect.cleanup();
    }
}

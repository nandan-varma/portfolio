import { TextManager } from './textUtils';
import { DropletManager } from './dropletUtils';
import { SplashManager } from './splashUtils';
import { RippleManager } from './rippleUtils';
import { WaterSurface } from './waterSurfaceUtils';

export class WaterAnimationController {
    private ctx: CanvasRenderingContext2D;
    private waterLevel: number;
    private lastFrameTime: number = performance.now();
    private readonly targetFPS = 60;
    private readonly frameTime: number;
    private animationFrameId: number | null = null;
    
    private textManager: TextManager;
    private dropletManager: DropletManager;
    private splashManager: SplashManager;
    private rippleManager: RippleManager;
    private waterSurface: WaterSurface;

    constructor(
        private canvas: HTMLCanvasElement,
        private text: string = "Nandan Varma"
    ) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = ctx;
        
        this.frameTime = 1000 / this.targetFPS;
        this.waterLevel = canvas.height;
        
        // Initialize managers with getter functions for dynamic values
        this.textManager = new TextManager(this.ctx, this.canvas, this.text);
        this.splashManager = new SplashManager(
            this.ctx,
            (x, y, r) => this.textManager.checkTextCollision(x, y, r)
        );
        this.rippleManager = new RippleManager(
            this.ctx,
            () => this.waterLevel,
            (x, y, r) => this.textManager.checkTextCollision(x, y, r),
            (x, y) => this.splashManager.createSplashAtPoint(x, y)
        );
        this.dropletManager = new DropletManager(
            this.ctx,
            this.canvas,
            () => this.waterLevel,
            (x, y, r) => this.textManager.checkTextCollision(x, y, r),
            (x, y) => this.splashManager.createSplashAtPoint(x, y),
            (x, r, o) => this.rippleManager.createRipple(x, r, o)
        );
        this.waterSurface = new WaterSurface(this.ctx, this.canvas, () => this.waterLevel);
    }

    setCanvasDimensions() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.waterLevel = this.canvas.height;
    }

    initialize() {
        this.setCanvasDimensions();
        this.textManager.generateTextPixels();
    }

    handleResize = () => {
        this.setCanvasDimensions();
        this.textManager.generateTextPixels();
    }

    animate = (currentTime: number = performance.now()) => {
        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Normalize delta time to target FPS
        const normalizedDelta = deltaTime / this.frameTime;
        
        // Clear canvas with transparency
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw water surface with perspective
        this.waterSurface.draw(this.rippleManager.getRipples());

        // Possibly create a new droplet
        this.dropletManager.createDroplet(deltaTime);

        // Update and draw droplets
        this.dropletManager.update(normalizedDelta);

        // Update and draw splash particles
        this.splashManager.update(normalizedDelta);

        // Update and draw ripples
        this.rippleManager.update(normalizedDelta);

        // Draw the text
        this.textManager.drawText();

        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    start() {
        this.initialize();
        window.addEventListener("resize", this.handleResize);
        this.animate();
    }

    cleanup() {
        // Cancel animation frame
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        window.removeEventListener("resize", this.handleResize);
    }
}

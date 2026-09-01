import { TorchEffect } from './torchUtils';
import { TextManager } from './textUtils';
import { DropletManager } from './dropletUtils';
import { SplashManager } from './splashUtils';
import { RippleManager } from './rippleUtils';
import { WaterSurface } from './waterSurfaceUtils';

export class BackgroundAnimationController {
    private ctx: CanvasRenderingContext2D;
    private waterLevel: number;
    private lastFrameTime: number = performance.now();
    private readonly targetFPS = 60;
    private readonly frameTime: number;
    private animationFrameId: number | null = null;
    
    // Torch wall components
    private torchEffect: TorchEffect;
    
    // Water animation components (always present)
    private textManager?: TextManager;
    private dropletManager: DropletManager;
    private splashManager: SplashManager;
    private rippleManager: RippleManager;
    private waterSurface: WaterSurface;
    
    private hasText: boolean;

    constructor(
        private canvas: HTMLCanvasElement,
        private text?: string
    ) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = ctx;
        
        this.frameTime = 1000 / this.targetFPS;
        this.waterLevel = canvas.height;
        this.hasText = !!text;
        
        // Always initialize torch effect
        this.torchEffect = new TorchEffect(this.ctx, this.canvas);
        
        // Initialize text manager only if text is provided
        if (this.hasText && text) {
            this.textManager = new TextManager(this.ctx, this.canvas, text);
        }
        
        // Always initialize water animation components
        // Collision detection function - only check text collision if text exists
        const checkCollision = (x: number, y: number, r: number) => {
            return this.textManager ? this.textManager.checkTextCollision(x, y, r) : false;
        };
        
        this.splashManager = new SplashManager(
            this.ctx,
            checkCollision
        );
        this.rippleManager = new RippleManager(
            this.ctx,
            () => this.waterLevel,
            checkCollision,
            (x, y) => this.splashManager.createSplashAtPoint(x, y)
        );
        this.dropletManager = new DropletManager(
            this.ctx,
            this.canvas,
            () => this.waterLevel,
            checkCollision,
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
        if (this.hasText && this.textManager) {
            this.textManager.generateTextPixels();
        }
    }

    handleResize = () => {
        this.setCanvasDimensions();
        if (this.hasText && this.textManager) {
            this.textManager.generateTextPixels();
        }
    }

    animate = (currentTime: number = performance.now()) => {
        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Normalize delta time to target FPS
        const normalizedDelta = deltaTime / this.frameTime;
        
        // Clear canvas with transparency
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw torch effect (brick wall with lighting)
        this.torchEffect.draw();

        // Always draw water animation
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

        // Draw the text if provided
        if (this.hasText && this.textManager) {
            const torchPos = this.torchEffect.getMousePosition();
            this.textManager.drawText(torchPos.x, torchPos.y);
        }

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
    
    setMousePosition(x: number, y: number) {
        this.torchEffect.setMousePosition(x, y);
    }
    
    saveMousePosition() {
        const pos = this.torchEffect.getMousePosition();
        try {
            sessionStorage.setItem('torchPosition', JSON.stringify(pos));
        } catch (e) {
            // Silently fail if sessionStorage is unavailable
        }
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

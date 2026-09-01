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

    // The loop is paused (not just throttled) while the tab is hidden or the
    // user has asked for reduced motion, so a stray click/navigation is never
    // competing with animation work it can't even see.
    private reducedMotion = false;
    private motionMedia: MediaQueryList | null = null;

    // generateTextPixels() reads the canvas back, which - even downsampled -
    // is unnecessary work to do synchronously on the page-load/transition
    // critical path. It's scheduled for idle time instead.
    private textGenHandle: number | null = null;
    private textGenIsTimeout = false;

    constructor(
        private canvas: HTMLCanvasElement,
        private text?: string
    ) {
        // getImageData is never called on this context (text-pixel detection
        // uses its own small offscreen canvas - see textUtils.ts), so there's
        // no reason to force the slower CPU-rendered canvas path here.
        const ctx = canvas.getContext("2d");
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
        this.scheduleTextGeneration();
    }

    private scheduleTextGeneration(): void {
        if (!this.hasText || !this.textManager) return;
        this.cancelScheduledTextGeneration();

        const generate = () => {
            this.textGenHandle = null;
            this.textManager?.generateTextPixels();
        };

        if (typeof window.requestIdleCallback === 'function') {
            this.textGenIsTimeout = false;
            this.textGenHandle = window.requestIdleCallback(generate, { timeout: 500 });
        } else {
            this.textGenIsTimeout = true;
            this.textGenHandle = window.setTimeout(generate, 0);
        }
    }

    private cancelScheduledTextGeneration(): void {
        if (this.textGenHandle === null) return;
        if (this.textGenIsTimeout) {
            clearTimeout(this.textGenHandle);
        } else {
            window.cancelIdleCallback?.(this.textGenHandle);
        }
        this.textGenHandle = null;
    }

    handleResize = () => {
        this.setCanvasDimensions();
        this.scheduleTextGeneration();
    }

    private handleVisibilityChange = () => {
        if (document.hidden) {
            this.stopLoop();
        } else {
            this.resumeLoop();
        }
    }

    private handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
        this.reducedMotion = e.matches;
        if (this.reducedMotion) {
            this.stopLoop();
            // Still reflect the new state with a single static frame.
            this.animate(performance.now());
        } else {
            this.resumeLoop();
        }
    }

    private stopLoop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private resumeLoop(): void {
        if (this.animationFrameId !== null || this.reducedMotion || document.hidden) return;
        // Avoid a huge deltaTime spike (e.g. droplets falling off-screen in
        // one frame) after the loop has been paused for a while.
        this.lastFrameTime = performance.now();
        this.animate();
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

        if (!this.reducedMotion && !document.hidden) {
            this.animationFrameId = requestAnimationFrame(this.animate);
        }
    }

    start() {
        this.initialize();
        window.addEventListener("resize", this.handleResize);
        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reducedMotion = this.motionMedia.matches;
        this.motionMedia.addEventListener('change', this.handleMotionPreferenceChange);

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
        this.stopLoop();
        this.cancelScheduledTextGeneration();

        window.removeEventListener("resize", this.handleResize);
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
        this.motionMedia?.removeEventListener('change', this.handleMotionPreferenceChange);
        this.motionMedia = null;

        this.torchEffect.cleanup();
    }
}

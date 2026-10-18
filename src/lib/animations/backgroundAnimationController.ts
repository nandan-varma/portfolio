import { TorchEffect } from './torchUtils';
import { TextManager } from './textUtils';
import { DropletManager } from './dropletUtils';
import { SplashManager } from './splashUtils';
import { RippleManager } from './rippleUtils';
import type { Viewport } from './types';

/** One 60fps frame, used to normalize time so animations feel identical at any refresh rate. */
const BASE_FRAME_MS = 1000 / 60;
/** Ignore huge gaps (tab restore) so the scene never jumps; not a frame-rate cap. */
const MAX_FRAME_DELTA_MS = 100;

export class BackgroundAnimationController {
    private ctx: CanvasRenderingContext2D;
    private viewport: Viewport = { width: 0, height: 0, dpr: 1 };
    private lastFrameTime = performance.now();
    private animationFrameId: number | null = null;
    private dprQuery: MediaQueryList | null = null;
    private readonly motionQuery: MediaQueryList;

    // Torch wall components
    private torchEffect: TorchEffect;

    // Water animation components (always present)
    private textManager?: TextManager;
    private dropletManager: DropletManager;
    private splashManager: SplashManager;
    private rippleManager: RippleManager;

    private text?: string;

    constructor(
        private canvas: HTMLCanvasElement,
        text?: string
    ) {
        // No `willReadFrequently`: the only pixel readback is the one-off text
        // raster in TextManager, while this context is used for a full-frame
        // animation every tick. The flag would force a CPU-backed canvas and
        // cost GPU acceleration on every frame.
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = ctx;
        this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.text = text;

        // Size the backing store (device pixels) and set a CSS-pixel transform
        // before anything builds geometry, so all drawing code works in logical
        // units and looks identical at every device pixel ratio.
        this.applyViewport(true);

        // Always initialize torch effect
        this.torchEffect = new TorchEffect(this.ctx, this.viewport);

        // Initialize text manager only if text is provided
        if (text) {
            this.textManager = new TextManager(this.ctx, this.viewport, text);
        }

        // Grouped water effects. Collision detection only matters when text exists.
        const checkCollision = (x: number, y: number, r: number) => {
            return this.textManager ? this.textManager.checkTextCollision(x, y, r) : false;
        };

        this.splashManager = new SplashManager(this.ctx, checkCollision);
        this.rippleManager = new RippleManager(
            this.ctx,
            () => this.viewport.height,
            checkCollision,
            (x, y) => this.splashManager.createSplashAtPoint(x, y)
        );
        this.dropletManager = new DropletManager(
            this.ctx,
            this.viewport,
            () => this.viewport.height,
            checkCollision,
            (x, y) => this.splashManager.createSplashAtPoint(x, y),
            (x, r, o) => this.rippleManager.createRipple(x, r, o)
        );
    }

    /** Re-measure the viewport and resize the backing store. Returns true if it changed. */
    private applyViewport(force = false): boolean {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const vp = this.viewport;

        if (!force && vp.width === width && vp.height === height && vp.dpr === dpr) {
            return false;
        }

        vp.width = width;
        vp.height = height;
        vp.dpr = dpr;

        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        // Resizing resets the context, so re-apply the device-pixel scale.
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        return true;
    }

    private isReducedMotion(): boolean {
        return this.motionQuery.matches;
    }

    initialize() {
        if (this.textManager) {
            this.textManager.generateTextPixels();
        }
    }

    ownsCanvas(canvas: HTMLCanvasElement): boolean {
        return this.canvas === canvas;
    }

    setText(text?: string) {
        if (this.text === text) return;
        this.text = text;
        this.canvas.dataset.text = text ?? "";
        this.textManager = text ? new TextManager(this.ctx, this.viewport, text) : undefined;
        this.initialize();
        this.renderFrame(0);
    }

    handleResize = () => {
        if (!this.applyViewport()) {
            return;
        }

        this.torchEffect.resize();
        this.textManager?.generateTextPixels();
        this.dropletManager.resize();
        this.watchDpr();

        // Resizing clears the bitmap. Repaint before the next browser paint,
        // including when motion is reduced or a transition pauses animation.
        this.renderFrame(0);
    };

    private watchDpr() {
        if (this.dprQuery) {
            this.dprQuery.removeEventListener("change", this.handleResize);
        }
        // DPR changes when the window moves between displays or the page is zoomed.
        this.dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        this.dprQuery.addEventListener("change", this.handleResize);
    }

    syncAnimation = () => {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.lastFrameTime = performance.now();
        if (document.hidden) return;

        // Paint synchronously before a transition snapshot, or on tab restore,
        // without advancing the simulation by time spent offscreen.
        this.renderFrame(0);
        if (!this.isReducedMotion()) {
            this.animationFrameId = requestAnimationFrame(this.animate);
        }
    };

    private renderFrame(deltaMs: number) {
        // Time-normalized delta: identical motion per second at 60Hz, 120Hz, ...
        const deltaScale =
            Math.min(Math.max(deltaMs, 0), MAX_FRAME_DELTA_MS) / BASE_FRAME_MS;

        this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);

        // Draw torch effect (brick wall with lighting)
        this.torchEffect.update(deltaScale);
        this.torchEffect.draw();

        // Possibly create a new droplet
        this.dropletManager.createDroplet(deltaMs);

        // Update and draw droplets
        this.dropletManager.update(deltaScale);

        // Update and draw splash particles
        this.splashManager.update(deltaScale);

        // Update and draw ripples
        this.rippleManager.update(deltaScale);

        // Draw the text if provided
        if (this.textManager) {
            const torchPos = this.torchEffect.getMousePosition();
            this.textManager.drawText(torchPos.x, torchPos.y);
        }
    }

    animate = (currentTime: number = performance.now()) => {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.renderFrame(deltaTime);

        if (this.isReducedMotion()) {
            this.animationFrameId = null;
            return;
        }

        this.animationFrameId = requestAnimationFrame(this.animate);
    };

    start() {
        this.initialize();
        window.addEventListener("resize", this.handleResize);
        this.watchDpr();
        this.motionQuery.addEventListener("change", this.syncAnimation);
        document.addEventListener("visibilitychange", this.syncAnimation);
        this.syncAnimation();
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
        this.motionQuery.removeEventListener("change", this.syncAnimation);
        document.removeEventListener("visibilitychange", this.syncAnimation);
        this.dprQuery?.removeEventListener("change", this.handleResize);
        this.dprQuery = null;
        this.torchEffect.cleanup();
    }
}

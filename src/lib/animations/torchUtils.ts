// Configuration constants
const TORCH_CONFIG = {
    distanceFromCenter: 200,
    baseRadius: 250,
    autoAnimationRadius: 0.25,
    touchResumeDelay: 1000,
} as const;

const FLAME_CONFIG = {
    particleCount: 12,
    noiseCount: 20,
    intensityLerpSpeed: 0.05,
    microFlickerRange: 0.12,
    intensityMin: 0.6,
    intensityMax: 1.0,
    targetIntensityBase: 0.75,
    targetIntensityRange: 0.35,
    intensityChangeMinDelay: 200,
    intensityChangeMaxDelay: 400,
} as const;

const PARTICLE_CONFIG = {
    distanceBase: 0.65,
    distanceRange: 0.45,
    speedMin: 0.015,
    speedRange: 0.03,
    intensityBase: 0.65,
    intensityRange: 0.4,
    angleVariation: 0.7,
    noiseInfluence: 0.45,
    resetProbability: 0.004,
} as const;

const LIGHTING_CONFIG = {
    baseOpacity: 0.06,
    maxOpacityMultiplier: 0.55,
    particleOffsetX: 35,
    particleOffsetY: 30,
    particleRadiusBase: 0.85,
    particleRadiusRange: 0.4,
    gradientStops: [
        { stop: 0, color: '220, 220, 220', alpha: 0.16 },
        { stop: 0.4, color: '180, 180, 180', alpha: 0.09 },
        { stop: 0.7, color: '130, 130, 130', alpha: 0.04 },
        { stop: 1, color: '50, 50, 50', alpha: 0 },
    ],
} as const;

const BRICK_CONFIG = {
    width: 80,
    height: 50,
    mortarSize: 3,
    noiseScale: 0.1,
    noiseAmount: 0.02,
} as const;

/** Mouse smoothing factor per 60fps frame. */
const MOUSE_LERP_PER_FRAME = 0.08;
/** Auto-orbit speed per 60fps frame. */
const AUTO_ORBIT_SPEED_PER_FRAME = 0.008;

interface FlameParticle {
    angle: number;
    distance: number;
    speed: number;
    intensity: number;
    life: number;
}

interface NoiseSystem {
    seeds: Float32Array;
    offsets: Float32Array;
    speeds: Float32Array;
}

interface BrickFillLayer {
    brightness: number;
    opacityScale: number;
    paths: Path2D[][];
    activeAlphas: number[];
}

function brickFillLayer(brightness: number, opacityScale: number): BrickFillLayer {
    return { brightness, opacityScale, paths: Array.from({ length: 256 }, () => []), activeAlphas: [] };
}

import type { Brick, Viewport } from './types';

export class TorchEffect {
    // Position state
    private mouseX = 0;
    private mouseY = 0;
    private targetMouseX = 0;
    private targetMouseY = 0;
    private torchX = 0;
    private torchY = 0;

    // Animation state
    private autoAnimate = false;
    private animationTime = 0;
    private lastInteraction = 0;

    // Flame state
    private noiseSystem: NoiseSystem;
    private flameParticles: FlameParticle[] = [];
    private globalIntensity = 1;
    private targetIntensity = 1;
    private nextIntensityChange = 0;

    // Static geometry, rebuilt on resize. Drawing paths once per resize keeps the
    // per-frame work to fills only, with byte-identical colours.
    private bricks: Brick[] = [];
    private colorTables = new Map<number, string[]>();
    private readonly brickLayers = [
        brickFillLayer(180, 1),
        brickFillLayer(140, 0.25),
        brickFillLayer(200, 0.4),
        brickFillLayer(100, 0.3),
    ];

    constructor(
        private readonly ctx: CanvasRenderingContext2D,
        private readonly viewport: Viewport,
        initialPosition?: { x: number; y: number }
    ) {
        this.autoAnimate = this.detectTouchDevice();

        // Center the torch for mobile devices, offset for desktop
        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;

        // Use stored position if available, otherwise use center
        if (initialPosition) {
            this.mouseX = initialPosition.x;
            this.mouseY = initialPosition.y;
            this.targetMouseX = initialPosition.x;
            this.targetMouseY = initialPosition.y;
        } else {
            this.mouseX = centerX;
            this.mouseY = centerY;
            this.targetMouseX = centerX;
            this.targetMouseY = centerY;
        }

        this.noiseSystem = this.initializeNoiseSystem();
        this.flameParticles = this.initializeFlameParticles();
        this.setupInputListeners();
        this.scheduleNextIntensityChange();
        this.buildBricks();

        if (this.autoAnimate) {
            this.torchX = centerX;
            this.torchY = centerY;
        } else {
            this.updateTorchPosition();
        }
    }

    /** Rebuild static geometry after a viewport change. */
    resize(): void {
        this.buildBricks();
    }

    /**
     * Advance the simulation by `deltaScale` 60fps-frames, so the animation has
     * the same speed and easing at any display refresh rate.
     */
    update(deltaScale: number): void {
        if (this.autoAnimate) {
            this.updateAutoOrbit(deltaScale);
        }
        this.smoothMousePosition(deltaScale);
        this.updateFlameAnimation(deltaScale);
    }

    private initializeNoiseSystem(): NoiseSystem {
        const { noiseCount } = FLAME_CONFIG;
        const seeds = new Float32Array(noiseCount);
        const offsets = new Float32Array(noiseCount);
        const speeds = new Float32Array(noiseCount);

        for (let i = 0; i < noiseCount; i++) {
            seeds[i] = Math.random() * 1000;
            offsets[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.003 + Math.random() * 0.008;
        }

        return { seeds, offsets, speeds };
    }

    private initializeFlameParticles(): FlameParticle[] {
        const { particleCount } = FLAME_CONFIG;
        const { distanceBase, distanceRange, speedMin, speedRange, intensityBase, intensityRange } = PARTICLE_CONFIG;

        return Array.from({ length: particleCount }, (_, i) => ({
            angle: (i / particleCount) * Math.PI * 2,
            distance: distanceBase + Math.random() * distanceRange,
            speed: speedMin + Math.random() * speedRange,
            intensity: intensityBase + Math.random() * intensityRange,
            life: Math.random()
        }));
    }

    private detectTouchDevice(): boolean {
        return 'ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches;
    }

    private scheduleNextIntensityChange(): void {
        const { intensityChangeMinDelay, intensityChangeMaxDelay, targetIntensityBase, targetIntensityRange } = FLAME_CONFIG;
        this.nextIntensityChange = performance.now() + intensityChangeMinDelay + Math.random() * intensityChangeMaxDelay;
        this.targetIntensity = targetIntensityBase + Math.random() * targetIntensityRange;
    }

    private setupInputListeners(): void {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('touchmove', this.handleTouch, { passive: true });
        document.addEventListener('touchstart', this.handleTouch, { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd);
    }

    private handleMouseMove = (e: MouseEvent): void => {
        this.updateMousePosition(e.clientX, e.clientY);
    };

    private handleTouch = (e: TouchEvent): void => {
        if (e.touches.length > 0) {
            this.updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    private handleTouchEnd = (): void => {
        // Restart the idle orbit relative to the moment the finger lifts.
        this.lastInteraction = performance.now();
    };

    private updateMousePosition(x: number, y: number): void {
        this.lastInteraction = performance.now();
        this.targetMouseX = x;
        this.targetMouseY = y;
    }

    private smoothMousePosition(deltaScale: number): void {
        // Frame-rate independent exponential smoothing: same feel at 60/120/144Hz.
        const lerpFactor = 1 - Math.pow(1 - MOUSE_LERP_PER_FRAME, deltaScale);

        const dx = this.targetMouseX - this.mouseX;
        const dy = this.targetMouseY - this.mouseY;

        // Only update if there's a meaningful distance
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            this.mouseX += dx * lerpFactor;
            this.mouseY += dy * lerpFactor;
            this.updateTorchPosition();
        }
    }

    private updateAutoOrbit(deltaScale: number): void {
        // Pause the orbit for two seconds after the last interaction.
        if (performance.now() - this.lastInteraction < TORCH_CONFIG.touchResumeDelay * 2) {
            return;
        }

        this.animationTime += AUTO_ORBIT_SPEED_PER_FRAME * deltaScale;

        const { width, height } = this.viewport;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * TORCH_CONFIG.autoAnimationRadius;

        this.targetMouseX = centerX + Math.cos(this.animationTime) * radius;
        this.targetMouseY = centerY + Math.sin(this.animationTime * 0.8) * radius * 0.7;
    }

    private updateTorchPosition(): void {
        const centerX = this.viewport.width / 2;
        const centerY = this.viewport.height / 2;
        const angle = Math.atan2(this.mouseY - centerY, this.mouseX - centerX);

        // Position torch opposite to mouse direction
        this.torchX = centerX - Math.cos(angle) * TORCH_CONFIG.distanceFromCenter;
        this.torchY = centerY - Math.sin(angle) * TORCH_CONFIG.distanceFromCenter;
    }

    private updateFlameAnimation(deltaScale: number): void {
        const now = performance.now();

        this.updateNoiseSystem(deltaScale);
        this.updateIntensity(now, deltaScale);
        this.updateParticles(deltaScale);
    }

    private updateNoiseSystem(deltaScale: number): void {
        const { offsets, speeds } = this.noiseSystem;
        for (let i = 0; i < offsets.length; i++) {
            offsets[i] += speeds[i] * deltaScale;
        }
    }

    private updateIntensity(now: number, deltaScale: number): void {
        if (now >= this.nextIntensityChange) {
            this.scheduleNextIntensityChange();
        }

        const { intensityLerpSpeed, microFlickerRange, intensityMin, intensityMax } = FLAME_CONFIG;
        const lerpFactor = 1 - Math.pow(1 - intensityLerpSpeed, deltaScale);
        this.globalIntensity += (this.targetIntensity - this.globalIntensity) * lerpFactor;

        const microFlicker = (Math.random() - 0.5) * microFlickerRange * deltaScale;
        this.globalIntensity = Math.max(intensityMin, Math.min(intensityMax, this.globalIntensity + microFlicker));
    }

    private updateParticles(deltaScale: number): void {
        const { angleVariation, noiseInfluence, resetProbability, speedMin, speedRange } = PARTICLE_CONFIG;

        this.flameParticles.forEach((particle, i) => {
            particle.angle += particle.speed * (0.5 + Math.random() * angleVariation) * deltaScale;
            const noise1 = this.getNoiseValue(i * 2);
            const noise2 = this.getNoiseValue(i * 2 + 1);
            particle.distance = 0.5 + (noise1 + 1) * 0.5 * noiseInfluence;
            particle.intensity = 0.4 + (noise2 + 1) * 0.5 * noiseInfluence;
            particle.life += 0.01 * deltaScale;

            if (Math.random() < resetProbability * deltaScale) {
                particle.angle = Math.random() * Math.PI * 2;
                particle.speed = speedMin + Math.random() * speedRange;
                particle.life = 0;
            }
        });
    }

    private getNoiseValue(index: number): number {
        const { seeds, offsets } = this.noiseSystem;
        const idx = index % seeds.length;
        const t = offsets[idx];

        const n1 = Math.sin(t + seeds[idx]);
        const n2 = Math.sin(t * 1.7 + seeds[idx] * 2.3);
        const n3 = Math.sin(t * 2.3 + seeds[idx] * 1.7);

        return (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
    }

    private getFlameIntensityAt(x: number, y: number, centerX: number, centerY: number): number {
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);

        // Smooth blending across all particles instead of selective closest ones
        let totalInfluence = 0;
        let totalWeight = 0;

        this.flameParticles.forEach(particle => {
            const angleDiff = Math.abs(angle - particle.angle);
            const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

            // Use wider angle range and smoother falloff
            const angleFactor = Math.cos(normalizedAngleDiff / 2);
            const weight = Math.max(0, angleFactor) * particle.intensity;
            const influence = particle.distance;
            totalInfluence += influence * weight;
            totalWeight += weight;
        });

        // Clamp the result to prevent extreme values
        const avgInfluence = totalWeight > 0 ? totalInfluence / totalWeight : 0.75;
        return Math.max(0.6, Math.min(0.9, avgInfluence));
    }

    /**
     * Pre-build brick paths (in CSS pixels) once per resize. Paths are re-used by
     * every frame; only fill colours change with the torch position.
     */
    private buildBricks(): void {
        const { width, height, mortarSize } = BRICK_CONFIG;
        const { width: viewWidth, height: viewHeight } = this.viewport;
        const radius = 3;
        const brickWidth = width - mortarSize * 2;
        const brickHeight = height - mortarSize * 2;
        const bricks: Brick[] = [];

        for (let y = 0; y < viewHeight + height; y += height) {
            const offset = (Math.floor(y / height) % 2) * (width / 2);

            for (let x = -width; x < viewWidth + width; x += width) {
                const brickX = x + offset;
                const brickY = y;
                const x0 = brickX + mortarSize;
                const y0 = brickY + mortarSize;

                // The grid includes padding cells for staggered rows. Cells
                // wholly outside the viewport cannot contribute any pixels.
                if (x0 > viewWidth || y0 > viewHeight || x0 + brickWidth < 0 || y0 + brickHeight < 0) {
                    continue;
                }

                const base = new Path2D();
                base.roundRect(x0, y0, brickWidth, brickHeight, radius);

                const lineA = new Path2D();
                lineA.roundRect(x0 + 5, y0 + brickHeight * 0.3, brickWidth - 10, 1.5, 0.5);

                const lineB = new Path2D();
                lineB.roundRect(x0 + 8, y0 + brickHeight * 0.65, brickWidth - 16, 1, 0.5);

                const highlight = new Path2D();
                highlight.roundRect(x0 + 3, y0 + 2, brickWidth - 6, brickHeight * 0.2, radius - 1);

                const shade = new Path2D();
                shade.roundRect(x0 + 3, y0 + brickHeight * 0.8, brickWidth - 6, brickHeight * 0.18, radius - 1);

                bricks.push({
                    x: brickX,
                    y: brickY,
                    centerX: brickX + width / 2,
                    centerY: brickY + height / 2,
                    noise: this.getBrickNoise(brickX, brickY),
                    base,
                    lineA,
                    lineB,
                    highlight,
                    shade,
                });
            }
        }

        this.bricks = bricks;
    }

    /** rgba() strings indexed by 8-bit alpha, cached per base brightness. */
    private colorTable(base: number): string[] {
        let table = this.colorTables.get(base);
        if (!table) {
            table = new Array(256);
            for (let i = 0; i < 256; i++) {
                table[i] = `rgba(${base}, ${base}, ${base}, ${i / 255})`;
            }
            this.colorTables.set(base, table);
        }
        return table;
    }

    private alphaIndex(alpha: number): number {
        return Math.max(0, Math.min(255, Math.round(alpha * 255)));
    }

    drawBrickWall(): void {
        for (const layer of this.brickLayers) {
            for (const alpha of layer.activeAlphas) layer.paths[alpha].length = 0;
            layer.activeAlphas.length = 0;
        }

        for (const brick of this.bricks) {
            const opacity = this.calculateBrickOpacity(brick);
            this.queueBrickFill(this.brickLayers[0], opacity, brick.base);
            this.queueBrickFill(this.brickLayers[1], opacity, brick.lineA, brick.lineB);
            this.queueBrickFill(this.brickLayers[2], opacity, brick.highlight);
            this.queueBrickFill(this.brickLayers[3], opacity, brick.shade);
        }

        // Brick cells do not overlap. Retain each original path and its layer
        // order, but set a fill colour once for all paths that share it.
        // Unlike merging paths or raster caching, this preserves antialiasing.
        for (const layer of this.brickLayers) {
            const colors = this.colorTable(layer.brightness);
            for (const alpha of layer.activeAlphas) {
                this.ctx.fillStyle = colors[alpha];
                for (const path of layer.paths[alpha]) this.ctx.fill(path);
            }
        }
    }

    private queueBrickFill(layer: BrickFillLayer, opacity: number, path: Path2D, secondPath?: Path2D) {
        const alpha = this.alphaIndex(opacity * layer.opacityScale);
        const paths = layer.paths[alpha];
        if (paths.length === 0) layer.activeAlphas.push(alpha);
        paths.push(path);
        if (secondPath) paths.push(secondPath);
    }

    private calculateBrickOpacity(brick: Brick): number {
        const dx = brick.centerX - this.mouseX;
        const dy = brick.centerY - this.mouseY;
        // Flame shape is clamped to 0.9, so this is the largest possible cutoff.
        const maxDistance = TORCH_CONFIG.baseRadius * (1.4 + 0.9 * 0.4) * 1.5;
        if (dx * dx + dy * dy >= maxDistance * maxDistance) {
            return LIGHTING_CONFIG.baseOpacity;
        }
        const distanceFromLight = Math.sqrt(dx * dx + dy * dy);

        const flameShape = this.getFlameIntensityAt(brick.centerX, brick.centerY, this.mouseX, this.mouseY);
        const { baseOpacity, maxOpacityMultiplier } = LIGHTING_CONFIG;
        const maxOpacity = maxOpacityMultiplier * this.globalIntensity;
        const effectiveRadius = TORCH_CONFIG.baseRadius * (1.4 + flameShape * 0.4);

        if (distanceFromLight >= effectiveRadius * 1.5) {
            return baseOpacity;
        }

        const normalizedDistance = distanceFromLight / effectiveRadius;
        const falloff = Math.pow(Math.max(0, 1 - normalizedDistance), 2.5);
        const shapedFalloff = falloff * (0.7 + flameShape * 0.3);

        let opacity = baseOpacity + (shapedFalloff * (maxOpacity - baseOpacity));
        opacity += brick.noise;

        return Math.max(baseOpacity, opacity);
    }

    private getBrickNoise(brickX: number, brickY: number): number {
        const { noiseScale, noiseAmount } = BRICK_CONFIG;
        return Math.sin(brickX * noiseScale) * Math.cos(brickY * noiseScale) * noiseAmount;
    }

    drawTorchLight(): void {
        this.flameParticles.forEach((particle, i) => {
            if (i % 2 === 0) {
                this.drawParticleLight(particle);
            }
        });
    }

    private drawParticleLight(particle: FlameParticle): void {
        const { particleOffsetX, particleOffsetY, particleRadiusBase, particleRadiusRange } = LIGHTING_CONFIG;

        const offsetX = Math.cos(particle.angle) * particle.distance * particleOffsetX;
        const offsetY = Math.sin(particle.angle) * particle.distance * particleOffsetY;
        const radius = TORCH_CONFIG.baseRadius * (particleRadiusBase + particle.distance * particleRadiusRange);

        const centerX = this.mouseX + offsetX;
        const centerY = this.mouseY + offsetY;

        const gradient = this.createParticleGradient(centerX, centerY, radius, particle);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private createParticleGradient(x: number, y: number, radius: number, particle: FlameParticle): CanvasGradient {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        const alpha = Math.min(particle.intensity * this.globalIntensity, 0.8);

        LIGHTING_CONFIG.gradientStops.forEach(({ stop, color, alpha: stopAlpha }) => {
            const finalAlpha = stopAlpha * alpha;
            gradient.addColorStop(stop, `rgba(${color}, ${finalAlpha})`);
        });

        return gradient;
    }

    draw(): void {
        this.drawBrickWall();
        this.drawTorchLight();
    }

    getTorchPosition(): { x: number; y: number } {
        return { x: this.torchX, y: this.torchY };
    }

    getMousePosition(): { x: number; y: number } {
        return { x: this.mouseX, y: this.mouseY };
    }

    setMousePosition(x: number, y: number): void {
        this.mouseX = x;
        this.mouseY = y;
        this.targetMouseX = x;
        this.targetMouseY = y;
    }

    cleanup(): void {
        this.bricks = [];
        for (const layer of this.brickLayers) {
            for (const alpha of layer.activeAlphas) layer.paths[alpha].length = 0;
            layer.activeAlphas.length = 0;
        }
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

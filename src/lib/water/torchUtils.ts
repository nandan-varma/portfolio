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
    height: 40,
    mortarSize: 3,
    noiseScale: 0.1,
    noiseAmount: 0.02,
} as const;

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

export class TorchEffect {
    // Position state
    private mouseX = 0;
    private mouseY = 0;
    private targetMouseX = 0;
    private targetMouseY = 0;
    private torchX = 0;
    private torchY = 0;
    
    // Animation state
    private animationFrame: number | null = null;
    private autoAnimate = false;
    private animationTime = 0;
    private lastInteraction = 0;
    private smoothingEnabled = true;
    
    // Flame state
    private noiseSystem: NoiseSystem;
    private flameParticles: FlameParticle[] = [];
    private globalIntensity = 1;
    private targetIntensity = 1;
    private nextIntensityChange = 0;

    constructor(
        private readonly ctx: CanvasRenderingContext2D,
        private readonly canvas: HTMLCanvasElement
    ) {
        this.autoAnimate = this.detectTouchDevice();
        
        // Center the torch for mobile devices, offset for desktop
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        this.mouseX = centerX;
        this.mouseY = centerY;
        this.targetMouseX = centerX;
        this.targetMouseY = centerY;
        
        if (this.autoAnimate) {
            this.torchX = centerX;
            this.torchY = centerY;
        } else {
            this.updateTorchPosition();
        }
        
        this.noiseSystem = this.initializeNoiseSystem();
        this.flameParticles = this.initializeFlameParticles();
        this.setupInputListeners();
        this.scheduleNextIntensityChange();
        
        if (this.autoAnimate) {
            this.startAutoAnimation();
        } else {
            this.startSmoothingAnimation();
        }
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
        if (this.autoAnimate) {
            setTimeout(() => this.startAutoAnimation(), TORCH_CONFIG.touchResumeDelay);
        }
    };
    
    private updateMousePosition(x: number, y: number): void {
        this.lastInteraction = performance.now();
        this.targetMouseX = x;
        this.targetMouseY = y;
    }
    
    private smoothMousePosition(): void {
        const lerpFactor = 0.08; // Smoothing speed (0-1, higher = faster)
        
        const dx = this.targetMouseX - this.mouseX;
        const dy = this.targetMouseY - this.mouseY;
        
        // Only update if there's a meaningful distance
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            this.mouseX += dx * lerpFactor;
            this.mouseY += dy * lerpFactor;
            this.updateTorchPosition();
        }
    }
    
    private startSmoothingAnimation(): void {
        if (this.animationFrame && this.autoAnimate) return;
        
        const animate = (): void => {
            this.smoothMousePosition();
            this.updateFlameAnimation();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    private updateTorchPosition(): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const angle = Math.atan2(this.mouseY - centerY, this.mouseX - centerX);
        
        // Position torch opposite to mouse direction
        this.torchX = centerX - Math.cos(angle) * TORCH_CONFIG.distanceFromCenter;
        this.torchY = centerY - Math.sin(angle) * TORCH_CONFIG.distanceFromCenter;
    }

    private updateFlameAnimation(): void {
        const now = performance.now();
        
        this.updateNoiseSystem();
        this.updateIntensity(now);
        this.updateParticles();
    }
    
    private updateNoiseSystem(): void {
        const { offsets, speeds } = this.noiseSystem;
        for (let i = 0; i < offsets.length; i++) {
            offsets[i] += speeds[i];
        }
    }
    
    private updateIntensity(now: number): void {
        if (now >= this.nextIntensityChange) {
            this.scheduleNextIntensityChange();
        }
        
        const { intensityLerpSpeed, microFlickerRange, intensityMin, intensityMax } = FLAME_CONFIG;
        this.globalIntensity += (this.targetIntensity - this.globalIntensity) * intensityLerpSpeed;
        
        const microFlicker = (Math.random() - 0.5) * microFlickerRange;
        this.globalIntensity = Math.max(intensityMin, Math.min(intensityMax, this.globalIntensity + microFlicker));
    }
    
    private updateParticles(): void {
        const { angleVariation, noiseInfluence, resetProbability, speedMin, speedRange } = PARTICLE_CONFIG;
        
        this.flameParticles.forEach((particle, i) => {
            particle.angle += particle.speed * (0.5 + Math.random() * angleVariation);
            const noise1 = this.getNoiseValue(i * 2);
            const noise2 = this.getNoiseValue(i * 2 + 1);
            particle.distance = 0.5 + (noise1 + 1) * 0.5 * noiseInfluence;
            particle.intensity = 0.4 + (noise2 + 1) * 0.5 * noiseInfluence;
            particle.life += 0.01;
            
            if (Math.random() < resetProbability) {
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

    private startAutoAnimation(): void {
        if (this.animationFrame) return;
        
        const animate = (): void => {
            const timeSinceInteraction = performance.now() - this.lastInteraction;
            
            if (timeSinceInteraction < 2000 && this.autoAnimate) {
                this.animationFrame = requestAnimationFrame(animate);
                return;
            }
            
            this.animationTime += 0.008;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const radius = Math.min(this.canvas.width, this.canvas.height) * TORCH_CONFIG.autoAnimationRadius;
            
            this.targetMouseX = centerX + Math.cos(this.animationTime) * radius;
            this.targetMouseY = centerY + Math.sin(this.animationTime * 0.8) * radius * 0.7;
            
            this.smoothMousePosition();
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    drawBrickWall(): void {
        const { width, height, mortarSize } = BRICK_CONFIG;

        for (let y = 0; y < this.canvas.height + height; y += height) {
            const offset = (Math.floor(y / height) % 2) * (width / 2);
            
            for (let x = -width; x < this.canvas.width + width; x += width) {
                const brickX = x + offset;
                const brickY = y;
                const opacity = this.calculateBrickOpacity(brickX, brickY, width, height);

                if (opacity > 0.05) {
                    this.drawBrick(brickX, brickY, width, height, mortarSize, opacity);
                }
            }
        }
    }
    
    private calculateBrickOpacity(brickX: number, brickY: number, width: number, height: number): number {
        const brickCenterX = brickX + width / 2;
        const brickCenterY = brickY + height / 2;
        const distanceFromLight = this.getDistance(brickCenterX, brickCenterY, this.mouseX, this.mouseY);
        
        const flameShape = this.getFlameIntensityAt(brickCenterX, brickCenterY, this.mouseX, this.mouseY);
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
        opacity += this.getBrickNoise(brickX, brickY);
        
        return Math.max(baseOpacity, opacity);
    }
    
    private getBrickNoise(brickX: number, brickY: number): number {
        const { noiseScale, noiseAmount } = BRICK_CONFIG;
        return Math.sin(brickX * noiseScale) * Math.cos(brickY * noiseScale) * noiseAmount;
    }
    
    private drawBrick(x: number, y: number, width: number, height: number, mortarSize: number, opacity: number): void {
        // Main brick
        this.ctx.fillStyle = `rgba(180, 180, 180, ${opacity})`;
        this.ctx.fillRect(
            x + mortarSize,
            y + mortarSize,
            width - mortarSize * 2,
            height - mortarSize * 2
        );

        // Texture detail
        this.ctx.fillStyle = `rgba(120, 120, 120, ${opacity * 0.3})`;
        this.ctx.fillRect(
            x + mortarSize + 5,
            y + mortarSize + 5,
            width - mortarSize * 2 - 10,
            height / 3
        );
    }
    
    private getDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    drawTorchLight(): void {
        if (!this.animationFrame) {
            this.updateFlameAnimation();
        }
        
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
        if (!this.animationFrame) {
            this.updateFlameAnimation();
        }
        
        this.drawBrickWall();
        this.drawTorchLight();
    }

    getTorchPosition(): { x: number; y: number } {
        return { x: this.torchX, y: this.torchY };
    }

    cleanup(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

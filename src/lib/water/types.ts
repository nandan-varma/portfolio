export interface Droplet {
    x: number;
    y: number;
    radius: number;
    velocity: number;
    opacity: number;
}

export interface SplashParticle {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    vx: number;
    vy: number;
    gravity: number;
}

export interface Ripple {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    speed: number;
}

export interface TextBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface TextPixel {
    x: number;
    y: number;
}

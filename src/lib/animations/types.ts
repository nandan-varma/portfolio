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

/** Logical (CSS pixel) viewport shared by the canvas animation modules. */
export interface Viewport {
    width: number;
    height: number;
    dpr: number;
}

/** A brick with its geometry pre-built once per resize. */
export interface Brick {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    base: Path2D;
    lineA: Path2D;
    lineB: Path2D;
    highlight: Path2D;
    shade: Path2D;
}

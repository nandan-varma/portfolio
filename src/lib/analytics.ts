/**
 * Analytics utility wrapper for Rybbit SDK
 * Provides typed helper functions for tracking events, outbound links, and errors
 */

import type rybbit from "@rybbit/js";

// Type definitions for event properties
export interface TrackProperties {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

// Standard event names using dot notation for consistency
export const EventNames = {
  // Link clicks
  LINK_OUTBOUND: "link.outbound",
  LINK_GITHUB: "link.github",
  LINK_DEMO: "link.demo",
  LINK_EMAIL: "link.email",
  LINK_SOCIAL: "link.social",
} as const;

// Get the global rybbit instance (will be available after init)
function getRybbit(): typeof rybbit | null {
  if (typeof window !== "undefined" && "rybbit" in window) {
    return (window as any).rybbit;
  }
  return null;
}

/**
 * Track a custom event with optional properties
 */
export function trackEvent(name: string, properties?: TrackProperties): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    console.warn("[Analytics] Rybbit not initialized, skipping event:", name);
    return;
  }
  
  try {
    rybbitInstance.event(name, properties);
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Track an outbound link click
 */
export function trackOutbound(
  url: string,
  text?: string,
  target?: string,
  additionalProps?: TrackProperties
): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    console.warn("[Analytics] Rybbit not initialized, skipping outbound:", url);
    return;
  }
  
  try {
    rybbitInstance.outbound(url, text, target);
    
    // Track additional custom event with more context if provided
    if (additionalProps) {
      rybbitInstance.event(EventNames.LINK_OUTBOUND, {
        url,
        text: text || "",
        target: target || "_self",
        ...additionalProps,
      });
    }
  } catch (error) {
    console.error("[Analytics] Error tracking outbound link:", error);
  }
}

/**
 * Track an error with context
 */
export function trackError(
  error: Error | ErrorEvent,
  context?: TrackProperties
): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    console.warn("[Analytics] Rybbit not initialized, skipping error:", error);
    return;
  }
  
  try {
    rybbitInstance.captureError(error, context);
  } catch (err) {
    console.error("[Analytics] Error tracking error:", err);
  }
}

/**
 * Identify a user with a unique ID
 */
export function identify(userId: string): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    console.warn("[Analytics] Rybbit not initialized, skipping identify:", userId);
    return;
  }
  
  try {
    rybbitInstance.identify(userId);
  } catch (error) {
    console.error("[Analytics] Error identifying user:", error);
  }
}

/**
 * Clear the current user ID
 */
export function clearUser(): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    console.warn("[Analytics] Rybbit not initialized, skipping clearUser");
    return;
  }
  
  try {
    rybbitInstance.clearUserId();
  } catch (error) {
    console.error("[Analytics] Error clearing user:", error);
  }
}

/**
 * Get the current user ID
 */
export function getUserId(): string | null {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    return null;
  }
  
  try {
    return rybbitInstance.getUserId();
  } catch (error) {
    console.error("[Analytics] Error getting user ID:", error);
    return null;
  }
}

/**
 * Start session replay (if enabled in dashboard)
 */
export function startSessionReplay(): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    return;
  }
  
  try {
    rybbitInstance.startSessionReplay();
  } catch (error) {
    console.error("[Analytics] Error starting session replay:", error);
  }
}

/**
 * Stop session replay
 */
export function stopSessionReplay(): void {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    return;
  }
  
  try {
    rybbitInstance.stopSessionReplay();
  } catch (error) {
    console.error("[Analytics] Error stopping session replay:", error);
  }
}

/**
 * Check if session replay is active
 */
export function isSessionReplayActive(): boolean {
  const rybbitInstance = getRybbit();
  if (!rybbitInstance) {
    return false;
  }
  
  try {
    return rybbitInstance.isSessionReplayActive();
  } catch (error) {
    console.error("[Analytics] Error checking session replay status:", error);
    return false;
  }
}

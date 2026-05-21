/**
 * Simplified Mode Manager
 * 
 * Centralized simplified mode management for reduced UI density.
 */

import { ACCESSIBILITY_CONSTANTS } from '@/constants/accessibility';
import type { CognitiveLoadLevel, CognitiveLoadState } from '@/types/accessibility';

export interface SimplifiedModeConfig {
  enabled: boolean;
  maxVisibleCards: number;
  maxVisibleActions: number;
  reduceSpacing: boolean;
  hideSecondaryElements: boolean;
  minimizeActions: boolean;
}

export class SimplifiedModeManager {
  private config: SimplifiedModeConfig = {
    enabled: false,
    maxVisibleCards: ACCESSIBILITY_CONSTANTS.SIMPLIFIED_MODE.MAX_VISIBLE_CARDS,
    maxVisibleActions: ACCESSIBILITY_CONSTANTS.SIMPLIFIED_MODE.MAX_VISIBLE_ACTIONS,
    reduceSpacing: false,
    hideSecondaryElements: false,
    minimizeActions: false,
  };

  private cognitiveLoad: CognitiveLoadState = {
    level: 'medium',
    visibleActionCount: 5,
    dashboardDensity: 'normal',
  };

  private listeners: Set<(config: SimplifiedModeConfig) => void> = new Set();

  /**
   * Get current simplified mode config
   */
  getConfig(): SimplifiedModeConfig {
    return { ...this.config };
  }

  /**
   * Enable simplified mode
   */
  enableSimplifiedMode(): void {
    this.config.enabled = true;
    this.config.maxVisibleCards = ACCESSIBILITY_CONSTANTS.SIMPLIFIED_MODE.MAX_VISIBLE_CARDS;
    this.config.maxVisibleActions = ACCESSIBILITY_CONSTANTS.SIMPLIFIED_MODE.MAX_VISIBLE_ACTIONS;
    this.config.reduceSpacing = true;
    this.config.hideSecondaryElements = true;
    this.config.minimizeActions = true;
    this.notifyListeners();
  }

  /**
   * Disable simplified mode
   */
  disableSimplifiedMode(): void {
    this.config.enabled = false;
    this.config.maxVisibleCards = 6;
    this.config.maxVisibleActions = 3;
    this.config.reduceSpacing = false;
    this.config.hideSecondaryElements = false;
    this.config.minimizeActions = false;
    this.notifyListeners();
  }

  /**
   * Toggle simplified mode
   */
  toggleSimplifiedMode(): void {
    if (this.config.enabled) {
      this.disableSimplifiedMode();
    } else {
      this.enableSimplifiedMode();
    }
  }

  /**
   * Update cognitive load
   */
  updateCognitiveLoad(level: CognitiveLoadLevel): void {
    this.cognitiveLoad.level = level;
    
    // Adapt simplified mode based on cognitive load
    if (level === 'high' || level === 'overwhelmed') {
      this.config.maxVisibleActions = ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD[level === 'overwhelmed' ? 'OVERWHELMED_MAX_ACTIONS' : 'HIGH_MAX_ACTIONS'];
      this.config.minimizeActions = true;
    } else {
      this.config.maxVisibleActions = ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD[level === 'low' ? 'LOW_MAX_ACTIONS' : 'MEDIUM_MAX_ACTIONS'];
      this.config.minimizeActions = false;
    }
    
    this.notifyListeners();
  }

  /**
   * Check if element should be visible in simplified mode
   */
  shouldShowElement(priority: 'primary' | 'secondary' | 'tertiary'): boolean {
    if (!this.config.enabled) return true;
    
    switch (priority) {
      case 'primary':
        return true;
      case 'secondary':
        return !this.config.hideSecondaryElements;
      case 'tertiary':
        return false;
      default:
        return true;
    }
  }

  /**
   * Get visible item count limit
   */
  getVisibleItemCount(): number {
    return this.config.enabled ? this.config.maxVisibleCards : 6;
  }

  /**
   * Subscribe to simplified mode changes
   */
  subscribe(listener: (config: SimplifiedModeConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of config change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getConfig()));
  }
}

// Singleton instance
export const simplifiedModeManager = new SimplifiedModeManager();

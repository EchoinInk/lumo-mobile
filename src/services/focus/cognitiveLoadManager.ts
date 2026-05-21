/**
 * Cognitive Load Manager
 * 
 * Service for managing cognitive load estimation and adaptive UI adjustment.
 * Dynamically reduces visible complexity based on estimated cognitive load.
 */

import { ACCESSIBILITY_CONSTANTS } from '@/constants/accessibility';
import { simplifiedModeManager } from '@/accessibility';
import type { CognitiveLoadLevel } from '@/types/accessibility';

export interface CognitiveLoadMetrics {
  visibleActionCount: number;
  dashboardDensity: 'minimal' | 'normal' | 'dense';
  timeSpentInApp: number;
  interactionFrequency: number;
}

export class CognitiveLoadManager {
  private metrics: CognitiveLoadMetrics = {
    visibleActionCount: 5,
    dashboardDensity: 'normal',
    timeSpentInApp: 0,
    interactionFrequency: 0,
  };

  private interactionTimestamps: number[] = [];
  private sessionStartTime: number = Date.now();

  /**
   * Estimate cognitive load based on metrics
   */
  estimateCognitiveLoad(): CognitiveLoadLevel {
    const { visibleActionCount, dashboardDensity, interactionFrequency } = this.metrics;

    // High visible actions
    if (visibleActionCount > ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD.LOW_MAX_ACTIONS) {
      return 'high';
    }

    // High interaction frequency
    if (interactionFrequency > 10) {
      return 'high';
    }

    // Dense dashboard
    if (dashboardDensity === 'dense') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Track interaction
   */
  trackInteraction(): void {
    const now = Date.now();
    this.interactionTimestamps.push(now);
    
    // Keep only last minute of interactions
    const oneMinuteAgo = now - 60000;
    this.interactionTimestamps = this.interactionTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    this.metrics.interactionFrequency = this.interactionTimestamps.length;
  }

  /**
   * Update visible action count
   */
  updateVisibleActionCount(count: number): void {
    this.metrics.visibleActionCount = count;
    
    // Adjust simplified mode based on cognitive load
    const cognitiveLoad = this.estimateCognitiveLoad();
    simplifiedModeManager.updateCognitiveLoad(cognitiveLoad);
  }

  /**
   * Update dashboard density
   */
  updateDashboardDensity(density: 'minimal' | 'normal' | 'dense'): void {
    this.metrics.dashboardDensity = density;
    
    // Adjust simplified mode based on density
    if (density === 'dense') {
      simplifiedModeManager.updateCognitiveLoad('high');
    } else if (density === 'minimal') {
      simplifiedModeManager.updateCognitiveLoad('low');
    }
  }

  /**
   * Get recommended action limit
   */
  getRecommendedActionLimit(): number {
    const cognitiveLoad = this.estimateCognitiveLoad();
    
    switch (cognitiveLoad) {
      case 'low':
        return ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD.LOW_MAX_ACTIONS;
      case 'medium':
        return ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD.MEDIUM_MAX_ACTIONS;
      case 'high':
        return ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD.HIGH_MAX_ACTIONS;
      case 'overwhelmed':
        return ACCESSIBILITY_CONSTANTS.COGNITIVE_LOAD.OVERWHELMED_MAX_ACTIONS;
      default:
        return 5;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CognitiveLoadMetrics {
    this.metrics.timeSpentInApp = Date.now() - this.sessionStartTime;
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      visibleActionCount: 5,
      dashboardDensity: 'normal',
      timeSpentInApp: 0,
      interactionFrequency: 0,
    };
    this.interactionTimestamps = [];
    this.sessionStartTime = Date.now();
  }
}

export const cognitiveLoadManager = new CognitiveLoadManager();

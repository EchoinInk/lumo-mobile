/**
 * Dashboard Filtering Service
 * 
 * Service for filtering dashboard content based on focus mode and simplified mode.
 * Reduces cognitive load by showing only relevant information.
 */

import { FOCUS_MODE_CONSTANTS } from '@/constants/focusModes';
import type { FocusMode } from '@/types/focusModes';

export interface DashboardFilterConfig {
  focusMode: FocusMode;
  simplifiedMode: boolean;
  cognitiveLoad: 'low' | 'medium' | 'high' | 'overwhelmed';
}

export class DashboardFilteringService {
  /**
   * Filter tasks based on focus mode
   */
  filterTasks(tasks: any[], config: DashboardFilterConfig): any[] {
    let filtered = [...tasks];

    // Filter by focus mode
    switch (config.focusMode) {
      case 'single-task':
        const activeTaskId = this.getActiveTaskId();
        if (activeTaskId) {
          filtered = filtered.filter(task => task.id === activeTaskId);
        }
        break;
      case 'today-only':
        filtered = this.filterTodayOnly(filtered);
        break;
      case 'distraction-free':
        filtered = this.filterByPriority(filtered);
        break;
      case 'calm':
        // No filtering in calm mode
        break;
    }

    // Filter by simplified mode
    if (config.simplifiedMode) {
      filtered = this.filterByCount(filtered, FOCUS_MODE_CONSTANTS.DASHBOARD_DENSITY.MINIMAL.MAX_CARDS);
    }

    // Filter by cognitive load
    if (config.cognitiveLoad === 'high' || config.cognitiveLoad === 'overwhelmed') {
      const maxCount = config.cognitiveLoad === 'overwhelmed' ? 1 : 3;
      filtered = filtered.slice(0, maxCount);
    }

    return filtered;
  }

  /**
   * Filter habits based on focus mode
   */
  filterHabits(habits: any[], config: DashboardFilterConfig): any[] {
    let filtered = [...habits];

    // Filter by focus mode
    switch (config.focusMode) {
      case 'today-only':
        filtered = this.filterTodayOnly(filtered);
        break;
      case 'distraction-free':
        filtered = this.filterByPriority(filtered);
        break;
    }

    // Filter by simplified mode
    if (config.simplifiedMode) {
      filtered = this.filterByCount(filtered, FOCUS_MODE_CONSTANTS.DASHBOARD_DENSITY.MINIMAL.MAX_CARDS);
    }

    return filtered;
  }

  /**
   * Filter by date (today only)
   */
  private filterTodayOnly(items: any[]): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  }

  /**
   * Filter by priority
   */
  private filterByPriority(items: any[]): any[] {
    return items.filter(item => {
      if (!item.priority) return true;
      return item.priority === 'high' || item.priority === 'urgent';
    });
  }

  /**
   * Filter by count
   */
  private filterByCount(items: any[], maxCount: number): any[] {
    return items.slice(0, maxCount);
  }

  /**
   * Get active task ID (placeholder - would come from focus mode manager)
   */
  private getActiveTaskId(): string | null {
    // Placeholder - would integrate with focus mode manager
    return null;
  }
}

export const dashboardFilteringService = new DashboardFilteringService();

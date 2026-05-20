/**
 * Onboarding Type Definitions
 * 
 * Type definitions for the onboarding system.
 * Supports emotional-first onboarding with personalization.
 */

export type StruggleArea =
  | 'rememberingTasks'
  | 'routines'
  | 'mealPlanning'
  | 'overwhelm'
  | 'budgeting'
  | 'consistency';

export type PlanningPreference = 'minimal' | 'visual' | 'structured' | 'flexible';

export type FocusArea = 'habits' | 'tasks' | 'meals' | 'wellness' | 'fitness';

export interface OnboardingData {
  // Step 1: Emotional friction
  struggleAreas: StruggleArea[];
  
  // Step 2: Planning preference
  planningPreference: PlanningPreference;
  
  // Step 3: Focus areas
  focusAreas: FocusArea[];
  
  // Metadata
  completedAt: string | null;
  currentStep: number;
}

export interface DashboardPersonalization {
  // Feature visibility
  showHabits: boolean;
  showTasks: boolean;
  showMeals: boolean;
  showWellness: boolean;
  showFitness: boolean;
  
  // Layout preferences
  dashboardDensity: 'minimal' | 'standard' | 'detailed';
  
  // Card layout style
  cardStyle: 'compact' | 'comfortable' | 'spacious';
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  type: 'selection' | 'multi-selection' | 'input';
  options?: OnboardingOption[];
}

export interface OnboardingOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'What do you struggle with most?',
    description: 'Select all that apply. This helps us personalize your experience.',
    type: 'multi-selection',
    options: [
      { id: 'rememberingTasks', label: 'Remembering tasks' },
      { id: 'routines', label: 'Routines' },
      { id: 'mealPlanning', label: 'Meal planning' },
      { id: 'overwhelm', label: 'Overwhelm' },
      { id: 'budgeting', label: 'Budgeting' },
      { id: 'consistency', label: 'Consistency' },
    ],
  },
  {
    id: 2,
    title: 'How do you prefer planning?',
    description: 'Choose the style that feels most natural to you.',
    type: 'selection',
    options: [
      { id: 'minimal', label: 'Minimal', description: 'Simple, focused lists' },
      { id: 'visual', label: 'Visual', description: 'Cards and visual cues' },
      { id: 'structured', label: 'Structured', description: 'Organized categories' },
      { id: 'flexible', label: 'Flexible', description: 'Adaptable and freeform' },
    ],
  },
  {
    id: 3,
    title: 'Choose your focus areas',
    description: 'Select what you want to track first. You can always add more later.',
    type: 'multi-selection',
    options: [
      { id: 'habits', label: 'Habits' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'meals', label: 'Meals' },
      { id: 'wellness', label: 'Wellness' },
      { id: 'fitness', label: 'Fitness' },
    ],
  },
];

export interface RoutineBundleItem {
  title: string;
  description?: string;
}

export interface RoutineBundle {
  id: string;
  title: string;
  description: string;
  items: RoutineBundleItem[];
}

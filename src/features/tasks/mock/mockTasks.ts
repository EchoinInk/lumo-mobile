import { Task } from '../types/task';

/**
 * Neurodivergent-Friendly Task Seed Data
 * 
 * Calm, realistic task examples designed for neurodivergent users.
 * Focuses on:
 * - Small, manageable chunks
 * - Self-care and wellness
 * - Clear, actionable language
 * - Low-pressure descriptions
 * - Sensory-friendly activities
 */
export const mockTasks: Task[] = [
  // Today's tasks - high priority
  {
    id: '1',
    title: 'Prepare medication refill',
    description: 'Call pharmacy for refill, 5 minutes',
    completed: false,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },
  {
    id: '2',
    title: '15 minute room reset',
    description: 'Pick up visible items, no deep cleaning',
    completed: false,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
  },
  {
    id: '3',
    title: 'Reply to landlord email',
    description: 'Keep response brief, ask for help if needed',
    completed: false,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },

  // Today's tasks - medium priority
  {
    id: '4',
    title: 'Hydration check',
    description: 'Drink one glass of water now',
    completed: false,
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T11:00:00Z',
    updatedAt: '2026-05-20T11:00:00Z',
  },
  {
    id: '5',
    title: 'Morning reset',
    description: 'Stretch, wash face, change clothes',
    completed: false,
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T07:00:00Z',
    updatedAt: '2026-05-20T07:00:00Z',
  },
  {
    id: '6',
    title: 'Charge phone',
    description: 'Plug in phone before battery gets low',
    completed: false,
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T12:00:00Z',
    updatedAt: '2026-05-20T12:00:00Z',
  },

  // Today's tasks - low priority
  {
    id: '7',
    title: 'Take 3 deep breaths',
    description: 'Pause and breathe, no rush',
    completed: false,
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T13:00:00Z',
    updatedAt: '2026-05-20T13:00:00Z',
  },
  {
    id: '8',
    title: 'Listen to calming music',
    description: '5 minutes, headphones on',
    completed: false,
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-05-20T14:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
  },

  // Overdue tasks
  {
    id: '9',
    title: 'Schedule dentist appointment',
    description: 'Call before 5pm, ask for morning slot',
    completed: false,
    priority: 'medium',
    dueDate: '2026-05-18',
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
  },
  {
    id: '10',
    title: 'Laundry - one load',
    description: 'Start one load, no folding required today',
    completed: false,
    priority: 'low',
    dueDate: '2026-05-19',
    createdAt: '2026-05-17T09:00:00Z',
    updatedAt: '2026-05-17T09:00:00Z',
  },

  // Completed tasks
  {
    id: '11',
    title: 'Grocery list',
    description: 'Write down 3 essential items',
    completed: true,
    priority: 'medium',
    dueDate: '2026-05-19',
    createdAt: '2026-05-18T16:00:00Z',
    updatedAt: '2026-05-19T10:30:00Z',
  },
  {
    id: '12',
    title: 'Evening walk',
    description: '10 minutes around the block',
    completed: true,
    priority: 'low',
    dueDate: '2026-05-18',
    createdAt: '2026-05-17T18:00:00Z',
    updatedAt: '2026-05-18T19:00:00Z',
  },
  {
    id: '13',
    title: 'Take vitamins',
    description: 'With food, set reminder for tomorrow',
    completed: true,
    priority: 'high',
    dueDate: '2026-05-18',
    createdAt: '2026-05-17T08:00:00Z',
    updatedAt: '2026-05-18T08:30:00Z',
  },

  // Future tasks
  {
    id: '14',
    title: 'Weekly meal prep',
    description: 'Prepare 2 simple meals for the week',
    completed: false,
    priority: 'medium',
    dueDate: '2026-05-25',
    createdAt: '2026-05-20T15:00:00Z',
    updatedAt: '2026-05-20T15:00:00Z',
  },
  {
    id: '15',
    title: 'Call support person',
    description: 'Check in, share how you are feeling',
    completed: false,
    priority: 'high',
    dueDate: '2026-05-22',
    createdAt: '2026-05-20T16:00:00Z',
    updatedAt: '2026-05-20T16:00:00Z',
  },
];

/**
 * Seed mock tasks into the repository
 * Call this during app initialization or in development
 */
export const seedMockTasks = async (): Promise<void> => {
  const { taskLocalRepository } = await import('../services/taskLocalRepository');
  
  try {
    const existingTasks = await taskLocalRepository.getTasks();
    if (existingTasks.length === 0) {
      for (const task of mockTasks) {
        await taskLocalRepository.createTask({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
        });
      }
      console.log('Seeded', mockTasks.length, 'mock tasks');
    }
  } catch (error) {
    console.error('Error seeding mock tasks:', error);
  }
};

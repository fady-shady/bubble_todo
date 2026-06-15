import type { Task } from '../types';

/** ~20 starter thoughts so the field feels alive on first load. */
export const SEED_TASKS: Task[] = [
  {
    id: 'seed-marketing-deck',
    title: 'Refine Marketing Deck',
    notes: 'Tighten the narrative for the Q3 pitch. Lead with the customer story, then the numbers.',
    category: 'work',
    effort: 4,
    importance: 3,
    urgency: 2,
  },
  {
    id: 'seed-project-pitch',
    title: 'Finalize Project Pitch',
    notes: 'Last pass on the deck and talking points before Friday.',
    category: 'personal',
    effort: 5,
    importance: 3,
    urgency: 3,
  },
  {
    id: 'seed-presentation-slides',
    title: 'Prepare Presentation Slides',
    notes: 'Draft slides for the all-hands. Keep it visual.',
    category: 'university',
    effort: 3,
    importance: 3,
    urgency: 2,
  },
  {
    id: 'seed-feature-x',
    title: 'Develop Feature X',
    notes: 'Implement the new sync layer. Write tests as you go.',
    category: 'family',
    effort: 6,
    importance: 3,
    urgency: 2,
  },
  {
    id: 'seed-code-prs',
    title: 'Review Code PRs',
    notes: 'Three PRs waiting in the queue. Prioritize the auth fix.',
    category: 'health',
    effort: 2,
    importance: 3,
    urgency: 3,
  },
];

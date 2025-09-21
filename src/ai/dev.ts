import { config } from 'dotenv';
config();

import '@/ai/flows/generate-activity-ideas.ts';
import '@/ai/flows/generate-lesson-plan.ts';
import '@/ai/flows/summarize-day-for-parents.ts';
import '@/ai/flows/generate-tts.ts';

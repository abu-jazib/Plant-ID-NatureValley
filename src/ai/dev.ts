import { config } from 'dotenv';
config();

import '@/ai/flows/detect-disease-from-image.ts';
import '@/ai/flows/identify-plant-from-image.ts';
import '@/ai/flows/suggest-treatment-flow.ts';

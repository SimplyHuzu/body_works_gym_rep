// src/ai/flows/suggest-optimal-workout-times.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal workout times
 * based on the user's historical booking data and gym resource availability.
 *
 * - suggestOptimalWorkoutTimes - The main function to trigger the flow.
 * - SuggestOptimalWorkoutTimesInput - The input type for the flow.
 * - SuggestOptimalWorkoutTimesOutput - The output type for the flow.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getGymResources, getAvailableTimeSlots} from '@/services/gym-resource';

const SuggestOptimalWorkoutTimesInputSchema = z.object({
  userId: z.string().describe('The ID of the user requesting workout time suggestions.'),
});
export type SuggestOptimalWorkoutTimesInput = z.infer<
  typeof SuggestOptimalWorkoutTimesInputSchema
>;

const SuggestOptimalWorkoutTimesOutputSchema = z.object({
  suggestedTimes: z
    .array(
      z.object({
        resourceId: z.string().describe('The ID of the gym resource.'),
        startTime: z.string().describe('The suggested start time (ISO 8601 format).'),
        endTime: z.string().describe('The suggested end time (ISO 8601 format).'),
        reason: z.string().describe('The reason for suggesting this time slot.'),
      })
    )
    .describe('A list of suggested workout times.'),
});
export type SuggestOptimalWorkoutTimesOutput = z.infer<
  typeof SuggestOptimalWorkoutTimesOutputSchema
>;

export async function suggestOptimalWorkoutTimes(
  input: SuggestOptimalWorkoutTimesInput
): Promise<SuggestOptimalWorkoutTimesOutput> {
  return suggestOptimalWorkoutTimesFlow(input);
}

const fetchWorkoutDataTool = ai.defineTool({
  name: 'fetchWorkoutData',
  description:
    'Fetches the user workout history and availability of gym resources. Use this to generate workout suggestions.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user.'),
  }),
  outputSchema: z.object({
    workoutHistory: z
      .array(z.object({}))
      .describe('Historical booking data for the user.'),
    availableResources: z
      .array(z.object({resourceId: z.string(), date: z.string()}))
      .describe('Available gym resources.'),
  }),
  async handler(input) {
    // Mock data, should query real user data and resource availability.
    const workoutHistory = [];
    const gymResources = await getGymResources();
    const today = new Date();
    const availableResources = await Promise.all(
      gymResources.map(async resource => {
        const availableTimeSlots = await getAvailableTimeSlots(
          resource.id,
          today.toISOString().split('T')[0]
        );
        return {
          resourceId: resource.id,
          date: today.toISOString().split('T')[0],
          timeSlots: availableTimeSlots,
        };
      })
    );

    return {
      workoutHistory: workoutHistory,
      availableResources: availableResources,
    };
  },
});

const suggestOptimalWorkoutTimesPrompt = ai.definePrompt({
  name: 'suggestOptimalWorkoutTimesPrompt',
  input: {
    schema: z.object({
      userId: z.string().describe('The ID of the user requesting workout time suggestions.'),
    }),
  },
  output: {
    schema: SuggestOptimalWorkoutTimesOutputSchema,
  },
  tools: [fetchWorkoutDataTool],
  prompt: `Based on the user's workout history and gym resource availability, suggest optimal workout times.

    The user ID is: {{{userId}}}

    Consider the following factors:
    - User's past booking history to identify preferred workout times and resources.
    - Availability of gym resources to avoid crowded times.
    - Suggest workout times that align with the user's preferences and resource availability.

    Use the fetchWorkoutData tool to get the user's workout history and available gym resources.

    Format the output as a JSON object with a 'suggestedTimes' array. Each object in the array should include the resourceId, startTime, endTime, and a brief reason for the suggestion.
    `,
});

const suggestOptimalWorkoutTimesFlow = ai.defineFlow<
  typeof SuggestOptimalWorkoutTimesInputSchema,
  typeof SuggestOptimalWorkoutTimesOutputSchema
>(
  {
    name: 'suggestOptimalWorkoutTimesFlow',
    inputSchema: SuggestOptimalWorkoutTimesInputSchema,
    outputSchema: SuggestOptimalWorkoutTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalWorkoutTimesPrompt(input);
    return output!;
  }
);

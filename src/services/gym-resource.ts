/**
 * Represents a gym resource, such as equipment or a room.
 */
export interface GymResource {
  /**
   * The ID of the resource.
   */
  id: string;
  /**
   * The name of the resource.
   */
  name: string;
  /**
   * A description of the resource.
   */
  description?: string;
}

/**
 * Asynchronously retrieves a list of all gym resources.
 *
 * @returns A promise that resolves to an array of GymResource objects.
 */
export async function getGymResources(): Promise<GymResource[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: 'treadmill-1',
      name: 'Treadmill 1',
      description: 'A standard treadmill machine.',
    },
    {
      id: 'weights-1',
      name: 'Weights Area',
      description: 'Free weights and benches.',
    },
  ];
}

/**
 * Represents an available time slot for a gym resource.
 */
export interface TimeSlot {
  /**
   * The start time of the time slot (ISO 8601 format).
   */
  startTime: string;
  /**
   * The end time of the time slot (ISO 8601 format).
   */
  endTime: string;
  /**
   * Whether the time slot is available for booking.
   */
  isAvailable: boolean;
}

/**
 * Asynchronously retrieves available time slots for a given gym resource.
 *
 * @param resourceId The ID of the gym resource.
 * @param date The date for which to retrieve time slots (ISO 8601 format).
 * @returns A promise that resolves to an array of TimeSlot objects.
 */
export async function getAvailableTimeSlots(
  resourceId: string,
  date: string
): Promise<TimeSlot[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      startTime: '2024-03-15T09:00:00.000Z',
      endTime: '2024-03-15T10:00:00.000Z',
      isAvailable: true,
    },
    {
      startTime: '2024-03-15T10:00:00.000Z',
      endTime: '2024-03-15T11:00:00.000Z',
      isAvailable: false,
    },
  ];
}

/**
 * Asynchronously books a time slot for a given gym resource.
 *
 * @param resourceId The ID of the gym resource.
 * @param startTime The start time of the time slot (ISO 8601 format).
 * @param endTime The end time of the time slot (ISO 8601 format).
 * @param userId The ID of the user making the booking.
 * @returns A promise that resolves to a boolean indicating whether the booking was successful.
 */
export async function bookTimeSlot(
  resourceId: string,
  startTime: string,
  endTime: string,
  userId: string
): Promise<boolean> {
  // TODO: Implement this by calling an API.

  return true;
}

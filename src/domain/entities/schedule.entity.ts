// domain/entities/schedule.entity.ts
export type ScheduleDay = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Senin, 7=Minggu

export interface PsychologistSchedule {
  id: string;
  psychologist_id: string; // snake_case
  day_of_week: number;     // snake_case
  start_time: string;      // snake_case
  end_time: string;        // snake_case
  is_recurring: boolean;   // snake_case
  valid_from?: Date;
  valid_to?: Date;
}
export interface ICreateSchedulePayload {
  startDate: string | Date; // e.g., "2026-02-20"
  endDate: string | Date; // e.g., "2026-02-22"
  startTime: string; // e.g., "09:00" (HH:mm)
  endTime: string; // e.g., "17:00" (HH:mm)
}
export interface IUpdateSchedulePayload {
  startDate: string | Date; // e.g., "2026-02-20"
  endDate: string | Date; // e.g., "2026-02-22"
  startTime: string; // e.g., "09:00" (HH:mm)
  endTime: string; // e.g., "17:00" (HH:mm)
}

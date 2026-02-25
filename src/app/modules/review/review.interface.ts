export interface ICreateReview {
  rating: number;
  comment?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
}

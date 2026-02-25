export interface ICreateReview {
  rating: number;
  comment?: string;
  appointmentId: string;
  doctorId: string;
}

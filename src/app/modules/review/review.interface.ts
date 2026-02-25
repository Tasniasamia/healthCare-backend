export interface ICreateReview {
  rating: number;
  comment?: string;
  appointmentId: string;
  doctorId: string;
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
  appointmentId: string;
  doctorId: string;
}

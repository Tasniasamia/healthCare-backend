export interface IAdminFilterRequest {
  email?: string;
  isDeleted?: boolean;
}
export interface TUpdateAdminPayload {
  name?: string;
  email?: string;
  profilePhoto?: string;
  contactNumber?: string;
  userId:string
}

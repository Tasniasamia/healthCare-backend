export interface ISuperAdminFilterRequest {
    email?: string;
    isDeleted?: boolean;
  }
  export interface TUpdateSuperAdminPayload {
    name?: string;
    email?: string;
    profilePhoto?: string;
    contactNumber?: string;
    userId:string
  }
  
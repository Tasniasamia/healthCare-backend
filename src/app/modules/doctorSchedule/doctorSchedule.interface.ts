export interface ICreatedoctorSchedulePayload{
    scheduleId:string[];
 
}

export interface IUpdatedoctorSchedulePayload{
  scheduleId:{
    id:string,
    shouldDelete:boolean
  }[]
 
}
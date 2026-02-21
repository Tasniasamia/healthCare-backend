export const doctorScheduleSearchableFields=[
    'scheduleId','doctorId','isBooked','schedule.startDateTime','schedule.endDateTime','schedule.appointments.status','schedule.appointments.paymentStatus'
]
export const doctorSchedulefilterableFields=[
    'scheduleId','doctorId','isBooked','schedule.startDateTime','schedule.endDateTime','schedule.appointments.status','schedule.appointments.paymentStatus'
]

const createdoctorSchduleConfig:Record<string,unknown>={
return {
    includes:{}
}
}

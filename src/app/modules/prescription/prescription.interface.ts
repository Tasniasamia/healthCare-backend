// id           String   @id @default(uuid(7))
// followUpDate DateTime
// instructions String   @db.Text
// createdAt    DateTime @default(now())
// updatedAt    DateTime @updatedAt

// appointmentId String      @unique
// appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade, onUpdate: Cascade)

// patientId String
// patient   patient @relation(fields: [patientId], references: [id], onDelete: Cascade, onUpdate: Cascade)

// doctorId String
// doctor   doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade, onUpdate: Cascade)

// @@index([appointmentId])

export interface ICreateprescription{
    followUpDate:string,
    instructions:string,
    appointmentId:string,
    patientId:string

}

export interface IUpdatePrescription{
    followUpDate?:string,
    instructions?:string,


}
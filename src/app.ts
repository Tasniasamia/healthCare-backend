import  express ,{type Application, type Request, type Response} from "express";
import { prisma } from "./lib/prisma";

const app:Application=express()
app.get('/',(req:Request,res:Response)=>{
    res.send("Hello World");
})
app.post('/',async(req:Request,res:Response)=>{
const data=await prisma.speciality.create({
    data:{title:"Cardiologist"}
});
res.status(200).json({success:true,data,message:"created successfully"})
})
export default app;
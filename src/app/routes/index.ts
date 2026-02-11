import { Router } from "express";
import { specialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { adminRoutes } from "../modules/admin/admin.route";



const route=Router();

const allRoutes=[
    {
        path:'/speciality',
        handler:specialityRoute
    },
    {
        path:'/auth',
        handler:AuthRoutes
    },
    {
        path:'/user',
        handler:userRoutes
    },
    {
        path:'/doctor',
        handler:doctorRoutes
    },
    {
        path:'/admin',
        handler:adminRoutes
    }

]
allRoutes.forEach((i)=>route.use(i?.path,i?.handler))
export default route;
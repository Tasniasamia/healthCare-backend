import { Router } from "express";
import { specialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { superAdminRoutes } from "../modules/superAdmin/superAdmin.route";
import { scheduleRoutes } from "../modules/schedule/schedule.route";
import { doctorscheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";



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
    },
    {
        path:'/super-admin',
        handler:superAdminRoutes
    },
    {
        path:'/schedule',
        handler:scheduleRoutes
    },
    {
        path:'/doctor-schedule',
        handler:doctorscheduleRoutes
    }

]
allRoutes.forEach((i)=>route.use(i?.path,i?.handler))
export default route;
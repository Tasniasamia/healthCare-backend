import { Router } from "express";
import { specialityRoute } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.route";



const route=Router();

const allRoutes=[
    {
        path:'/speciality',
        handler:specialityRoute
    },
    {
        path:'/auth',
        handler:AuthRoutes
    }

]
allRoutes.forEach((i)=>route.use(i?.path,i?.handler))
export default route;
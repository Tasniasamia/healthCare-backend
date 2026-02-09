import { Router } from "express";
import { specialityRoute } from "../modules/speciality/speciality.route";



const route=Router();

const allRoutes=[
    {
        path:'/speciality',
        handler:specialityRoute
    }

]
allRoutes.forEach((i)=>route.use(i?.path,i?.handler))
export default route;
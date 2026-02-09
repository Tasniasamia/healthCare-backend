import type { Response } from "express"
export interface TSendResponse<T>{
    httpStatusCode:number,
    success:boolean,
    message:string,
    data:T
}
export const sendResponse=async<T>(res:Response,responseData:TSendResponse<T>)=>{
    const {httpStatusCode,...responses}= responseData;
    return res.status(httpStatusCode).json(
        responses
    )
}
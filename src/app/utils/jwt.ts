import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

const createToken=(payload:JwtPayload,jwtSecret:string,options:SignOptions)=>{
    return  jwt.sign(payload, jwtSecret, options);
}

const verifyToken=(jwtSecret:string,token:string)=>{
    try{
        const decoded= jwt.verify(token, jwtSecret);
        return decoded;
    }
    catch(error:any){
        throw error;
    }
}

const decodeToken=(token:string)=>{
    return jwt.decode(token);
}



export const jwtUtils={createToken,verifyToken,decodeToken}





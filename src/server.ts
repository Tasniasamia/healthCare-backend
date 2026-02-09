import app from "./app"
import { envVars } from "./config/env";


const main=async()=>{
    try{
    app.listen(process.env.PORT || 5050,()=>{
        console.log(`http://localhost:${envVars.PORT || 5000}`)
    })
} catch(error){
    console.log(error);
}
}

main();
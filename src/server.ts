import app from "./app"


const main=async()=>{
    try{
    app.listen(process.env.PORT || 5050,()=>{
        console.log(`http://localhost:${process.env.PORT || 5000}`)
    })
} catch(error){
    console.log(error);
}
}

main();
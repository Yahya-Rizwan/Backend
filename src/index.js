// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Established connection through PORT", process.env.PORT)
    })
})
.catch((e)=>{
    app.on("error",(e)=>{
        console.log("Error:" ,e)
    })
    console.log("MongoDb connection has failed", e)
})
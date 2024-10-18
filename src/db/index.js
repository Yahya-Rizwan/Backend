import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try{
         console.log(process.env.MONGODB_URI);
         const connectionInstance = await mongoose.connect("mongodb+srv://ryahya00:yahya123@youtube.2mpgn.mongodb.net/youtube")
         console.log(`\n MongoDb connected !! DB host ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("mongo db connection ERROR",error);
        process.exit(1)
    }
}

export default connectDB
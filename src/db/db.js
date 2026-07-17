import mongoose from "mongoose";

const connectDB =async ()=> {
    try{
       const connectionInstance= await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongoDB Connected");
    }
    catch(error){
        console.log("Error",error);
        throw error;
        
    }
}

export default connectDB;
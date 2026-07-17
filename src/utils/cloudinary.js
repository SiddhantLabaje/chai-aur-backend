import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

console.log(cloudinary.config()); 


const uploadOnCloudinary=async(localfilepath)=>{
    try{
        if(!localfilepath)return null
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        console.log("file is uploaded into cloudinary",
            response.url);
            return response;
    }
    catch (error) {
    console.log(error); 

    if (fs.existsSync(localfilepath)) {
        fs.unlinkSync(localfilepath);
    }

    throw error;
}
}

export {uploadOnCloudinary}
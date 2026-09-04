import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' // node js inbuilt for file system

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


    const uploadOnCloudinary = async(localfilepath) => {
        try{
            if(!localfilepath) return null
            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type: "auto"
            })
            // file has been uplaoded successfully
            console.log("File is uploaded Successfully on Cloudinary",response.url)
            return response
        }catch(error){
            fs.unlinkSync(localfilepath) // removed the locally saved file from server
            return null
        }
    }

// const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);

export {uploadOnCloudinary}
import multer from "multer"


export const filetypes = {
    image: ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/ico"],
    video: ["video/mp4", "video/quicktime", "video/mpeg"],
    audio: ["audio/mpeg", "audio/wav", "audio/aac"],
    document: ["application/pdf"],
}




//upload cloudinary
export const multerHost = (customeValidation = []) => {
  
    const storage = multer.diskStorage({})
    function fileFilter (req, file, cb) {
         // Accept images only
        if (customeValidation.includes(file.mimetype) ) { 
            cb(null,true)
        } else {
            cb(new Error('I don\'t have a clue!',false))
        }
      
      
      
      }
    
    const upload = multer({ storage,fileFilter })
    return upload
}
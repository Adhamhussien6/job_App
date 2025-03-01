import applicationmodel from "../../DB/models/apllication.model.js";
import jobmodel from "../../DB/models/job.model.js";
import cloudinary from "../../utils/cloudnairy/index.js";
import { asynchandler } from "../../utils/globalerrorhandling/index.js";


export const applyForJob = asynchandler(async (req, res, next) => {
    const { jobId } = req.body;
   
    const userId = req.user._id; 

   
    const job = await jobmodel.findById(jobId);
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }

     let userCv = null;
    
  
    if (req.file) {
        try {
            const uploadProfile = await cloudinary.uploader.upload(req.file.path, {  
                folder: "job_app/userCv",
            });
            userCv = { secure_url: uploadProfile.secure_url, public_id: uploadProfile.public_id };
        } catch (error) {
            return next(new Error("Error uploading CV", { cause: 500 }));
        }
    } else {
        return next(new Error("CV file is required", { cause: 400 }));
    }
   
    const existingApplication = await applicationmodel.findOne({ jobId, userId });
    if (existingApplication) {
        return next(new Error("You have already applied for this job", { cause: 400 }));
    }


    const application = await applicationmodel.create({ jobId, userId, userCv });
    // if (req.io) {
    //     job.companyId.HRs.forEach(hrId => {
    //         req.io.to(hrId.toString()).emit("newApplication", {
    //             message: `A new application has been submitted for ${job.jobTitle}`,
    //             jobTitle: job.jobTitle,
    //             companyName: job.companyId.companyName,
    //             applicantId: userId,
    //             applicationId: application._id
    //         });
    //     });
    // }

    return res.status(201).json({
        message: "Application submitted successfully",
        application,
    });
});
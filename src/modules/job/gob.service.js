
import applicationmodel from "../../DB/models/apllication.model.js";
import companymodel from "../../DB/models/company.model.js";
import jobmodel from "../../DB/models/job.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { pagination } from "../../utils/feature/pagination.js";
import { asynchandler } from "../../utils/globalerrorhandling/index.js";






export const addJob = asynchandler(async (req, res, next) => {
   
    const { companyId } = req.params;
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills ,softSkils} = req.body;

   
 
   
    const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true,isdeleted:false });
    if (!company) {
        return next(new Error("Company not found or not approved", { cause: 404 }));
    }

 
    const isOwner = company.createdBy.toString() === req.user._id.toString();
    const isHR = company.HRs.map(hr => hr.toString()).includes(req.user._id.toString());


    if (!isOwner && !isHR) {
        return next(new Error("You are not allowed to create a job for this company", { cause: 403 }));
    }

  
  
  
    const newJob = await jobmodel.create({
        jobTitle,
        jobDescription,
        jobLocation,
        workingTime,
        seniorityLevel,
        technicalSkills,
        softSkils,
        companyId,
        addedBy: req.user._id 
    });

    return res.status(201).json({ message: "Job added successfully", job: newJob })
})

export const updateJob = asynchandler(async (req, res, next) => {
    const { companyId, jobId } = req.params;
    const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true, isdeleted: false });
    if (!company) {
        return next(new Error("Company not found or not approved", { cause: 404 }));
    }
    const isOwner = company.createdBy.toString() === req.user._id.toString();
    if (!isOwner) {
        return next(new Error("You are not allowed to update the job for this company", { cause: 403 }));
    }

   
    const job = await jobmodel.findByIdAndUpdate(jobId,
        req.body,
        { new: true}
    )
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Job updated successfully", job })
})


export const    deleteJob = asynchandler(async (req, res, next) => {
    const { companyId, jobId } = req.params;
    const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true, isdeleted: false });
    if (!company) {
        return next(new Error("Company not found or not approved", { cause: 404 }));
    }
    const isOwner = company.createdBy.toString() === req.user._id.toString();
    if (!isOwner) {
        return next(new Error("You are not allowed to delete the job for this company", { cause: 403 }));
    }
    const job = await jobmodel.findByIdAndDelete(jobId);
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Job deleted successfully" })
})

export const getJobsForCompany = asynchandler(async (req, res, next) => {
    const { companyId } = req.params;
    const {  page, limit } = req.query;

    let company;


  
        company = await companymodel.findOne({_id:companyId, isdeleted: false, approvedByAdmin:true});
        if (!company ) {
            return next(new Error("Company not found or deleted", { cause: 404 }));
        }
    
    const jobs = await pagination({
        page, limit, model: jobmodel, populate: [{ path: "companyId", select: "companyName" }],
        filter: { companyId: company._id }
    });
   
    if (!jobs.data.length) {
        return next(new Error("No jobs found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Jobs fetched successfully", jobs:jobs.data,  pagination: {
       
        _page: jobs._page,
        totalCount:jobs.totalCount
      
    },});


});

export const getSpecificJob = asynchandler(async (req, res, next) => {
    const { companyId, jobId } = req.params;
    const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true, isdeleted: false });
    if (!company) {
        return next(new Error("Company not found or not approved", { cause: 404 }));
    }
    
    const job = await jobmodel.findById(jobId).populate("companyId", "companyName");
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Job fetched successfully", job });

   


});



//get all jobs in  a company by its name

export const getJobsByCompanyName = asynchandler(async (req, res, next) => { 
    const { name } = req.query;
    const company = await companymodel.findOne({ companyName: name, isdeleted: false, approvedByAdmin:true });
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    const jobs = await jobmodel.find({ companyId: company._id }).populate("companyId", "companyName");
    if (!jobs.length) {
        return next(new Error("No jobs found", { cause: 404 }));
    }
    return res.status(200).json({ message: "Jobs fetched successfully", jobs });
})




export const jobFilter = asynchandler(async (req, res, next) => {
    const { page, limit, workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;
    const filtrition = {};
    
    if (workingTime) filtrition.workingTime = workingTime;
    if (jobLocation) filtrition.jobLocation = jobLocation;
    if (seniorityLevel) filtrition.seniorityLevel = seniorityLevel;
    if (jobTitle) filtrition.jobTitle = new RegExp(jobTitle, 'i');
    if (technicalSkills && technicalSkills.length) filtrition.technicalSkills = { $all: technicalSkills.split(',') };
    
   
    const jobs = await pagination({
        page, limit, model: jobmodel, populate: [{ path: "companyId", select: "companyName" }],
        filter: filtrition
       
    });
 
    if (!jobs.data.length) {
        return next(new Error("No jobs found", { cause: 404 }));
    }
    return res.status(200).json({
        message: "Jobs fetched successfully", jobs: jobs.data, pagination: {
            _page : jobs._page,
            totalCount: jobs.totalCount
        
        
        }
    })

})


export const getApplicationsForJob = asynchandler(async (req, res, next) => {
    const { jobId,companyId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true,isdeleted:false });
    if (!company) {
        return next(new Error("Company not found or not approved", { cause: 404 }));
    }
   

    
    
    const job = await jobmodel.findById(jobId)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }

  
    const isOwner = company.createdBy.toString() === req.user._id.toString();
    const isHR = company.HRs.map(hr => hr.toString()).includes(req.user._id.toString());

    if (!isOwner && !isHR) {
        return next(new Error("You are not allowed to get application", { cause: 403 }));
    }


    const applications = await pagination({
        page, 
        limit, 
        model: applicationmodel, 
        populate: [
            { path: "userId", select: "fisrtName email phoneNumber" }, 
            { path: "jobId", select: "jobTitle companyId" } 
        ],
        filter: { jobId: job._id }
    });
    
 
   

    if (!applications.data.length) {
        return next(new Error("No applications found for this job", { cause: 404 }));
    }

    return res.status(200).json({
        message: "Applications fetched successfully",
        applications,
        pagination: {
            _page: parseInt(page),
            totalCount:applications.totalCount,
        },
    });
});





export const acceptOrRejectApplicant = asynchandler(async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body;



   
    const applications = await applicationmodel.findById(applicationId)
    .populate("userDetails", "firstName lastName email mobileNumber");

    if (!applications) {
        return next(new Error("Application not found", { cause: 404 }));
    }

   
    const job = await jobmodel.findById(applications.jobId).populate("company", "HRs");
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }

    const company = await companymodel.findById(job.companyId);
  

     const isHR = company.HRs.map(hr => hr.toString()).includes(req.user._id.toString());
   

    if (!isHR) {
        return next(new Error("You are not authorized to update this application", { cause: 403 }));
    }


    applications.status = status;
    await applications.save();

    const { firstName, lastName, email } = applications.userDetails;

  //got the form from chatgpt to be formal
        let subject, message;
        if (status === "accepted") {
            subject = "Congratulations! Your Job Application is Accepted ";
            message = `Dear ${firstName} ${lastName},<br><br>
                   We are pleased to inform you that your application has been accepted. Our HR team will contact you soon for the next steps.<br><br>
                   Best Regards,<br> ${company.companyName} Team.`;
        } else if (status === "rejected") {
            subject = "Job Application Update - Rejected ";
            message = `Dear ${firstName} ${lastName},<br><br>
                   Thank you for applying. Unfortunately, we have decided to move forward with other candidates.<br><br>
                   We appreciate your interest and encourage you to apply for future opportunities.<br><br>
                   Best Regards,<br> ${company.companyName} Team.`;
        }
    
   
    await sendEmail(email, subject, message);



    return res.status(200).json({
        message: `Application has been ${status} successfully.`,
        applications
    });
});



//delete job


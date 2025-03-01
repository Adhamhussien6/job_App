import companymodel from "../../DB/models/company.model.js";
import cloudinary from "../../utils/cloudnairy/index.js";
import { asynchandler } from "../../utils/globalerrorhandling/index.js";



export const addCompany = asynchandler(async (req, res, next) => {  
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;

  
  const existingCompany = await companymodel.findOne({
    $or: [{ companyName }, { companyEmail }]
  });

  if (existingCompany) {
    return next(new Error("Company name or email already exists", { cause: 400 }));
    }
    


     let logo = null;
    let coverPic = null;
    let legalAttachment=null
    
        if (req.files?.logo) {
            const uploadProfile = await cloudinary.uploader.upload(req.files.logo[0].path,{  folder: "job_app/company",});
            logo = { secure_url: uploadProfile.secure_url, public_id: uploadProfile.public_id };
        }
    
        if (req.files?.coverPic) {
            const uploadCover = await cloudinary.uploader.upload(req.files.coverPic[0].path,{  folder: "job_app/company",});
            coverPic = { secure_url: uploadCover.secure_url, public_id: uploadCover.public_id };
        }
        if (req.files?.legalAttachment) {
            const uploadCover = await cloudinary.uploader.upload(req.files.legalAttachment[0].path,{  folder: "job_app/company",});
            legalAttachment = { secure_url: uploadCover.secure_url, public_id: uploadCover.public_id };
        }
    

  const newCompany = await companymodel.create({
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
      createdBy: req.user._id, 
      logo,
      coverPic,
      legalAttachment
    
  });

  return res.status(201).json({ message: "Company added successfully", company: newCompany });


})

export const updateCompany = asynchandler(async (req, res, next) => {
   
        const { companyId } = req.params;
    
     
        const company = await companymodel.findOne({_id:companyId,approvedByAdmin:true});
        if (!company) {
            return next(new Error("Company not found or not approved yet", { cause: 404 }));
        }
    
      
        if (company.createdBy.toString() !== req.user._id.toString()) {
            return next(new Error("You are not allowed to update this company", { cause: 403 }));
        }
    
        const updateData = { ...req.body };
    
        if (req.files) {
            if (req.files.logo) {
                
                if (company.logo?.public_id) {
                    await cloudinary.uploader.destroy(company.logo.public_id);
                }
       
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo[0].path, {
                    folder: "job_app/companies/logos"
                });
                updateData.logo = { secure_url, public_id };
            }
    
            if (req.files.coverPic) {
            
                if (company.coverPic?.public_id) {
                    await cloudinary.uploader.destroy(company.coverPic.public_id);
                }
           
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
                    folder: "job_app/companies/covers"
                });
                updateData.coverPic = { secure_url, public_id };
            }
        }
    
    
       
        const Company = await companymodel.findByIdAndUpdate(
            companyId,
            { $set: updateData},
            { new: true }
        );
    
        return res.status(200).json({ message: "Company updated successfully", Company });
});
    
export const softDelete = asynchandler(async (req, res, next) => {
    
    const { companyId } = req.params;
    const company = await companymodel.findById(companyId );
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    if (req.user.role !== "admin" && company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error(" Only admins or company's owner can delete ", { cause: 403 }));
    }
    
   

    company.isdeleted = true;
    company.deletedAt = new Date();
    await company.save();

    
    return res.status(200).json({ message: "Company soft deleted successfully", company });
})

export const getCompanyWithJobs = asynchandler(async (req, res, next) => {
    const { companyId } = req.params;

   
    const company = await companymodel.findOne({ _id: companyId })
        .populate({
            path: "jobs",
            select: "jobTitle"
        });

  
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    return res.status(200).json({ message: "Success", company });
});

export const searchCompanyByName = asynchandler(async (req, res, next) => {
    const { name } = req.body; 

    if (!name) {
        return next(new Error("Company name is required", { cause: 400 }));
    }

   
    const companies = await companymodel.find({
    
        companyName: name,
        approvedByAdmin: true,
        isdeleted: false
    });

    if (!companies.length) {
        return next(new Error("No companies found", { cause: 404 }));
    }

    return res.status(200).json({ message: "Success", companies });
});

export const uploadLogo = asynchandler(async (req, res, next) => {
        const { companyId } = req.params;
        const company = await companymodel.findById(companyId );
        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }
        if ( company.createdBy.toString() !== req.user._id.toString()) {
            return next(new Error(" you arenot allowed", { cause: 403 }));
        }
        if (company.logo && company.logo?.public_id) {
            await cloudinary.uploader.destroy(company.logo.public_id);
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "job_app/users",
            }
            );
    
        const updateData = {
            logo: { secure_url, public_id }
        };
        
        const updatedCompany = await companymodel.findByIdAndUpdate(
            companyId,
            { $set: updateData },
            { new: true }
        );
        res.status(200).json({ message: "Logo uploaded successfully", company: updatedCompany });
})
    
export const uploadCoverPic = asynchandler(async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companymodel.findById(companyId );
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    if ( company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error(" you arenot allowed", { cause: 403 }));
    }
     if (company.coverPic && company.coverPic?.public_id) {
        await cloudinary.uploader.destroy(company.logo.public_id);
    }
     const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "job_app/users",
          }
        );
   
    const updateData = {
        coverPic: { secure_url, public_id }
    };
    
    const updatedCompany = await companymodel.findByIdAndUpdate(
        companyId,
        { $set: updateData },
        { new: true }
    );
    res.status(200).json({ message: "cover uploaded successfully", company: updatedCompany });
})

export const deleteLogo = asynchandler(async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companymodel.findById(companyId );
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    if ( company.createdBy.toString()!== req.user._id.toString()) {
        return next(new Error("you are not allowed", { cause: 403 }));
    }
    if (company.logo && company.logo?.public_id) {
        await cloudinary.uploader.destroy(company.logo.public_id);
    }
    const updateData = {
        logo: null
    };
    
    const updatedCompany = await companymodel.findByIdAndUpdate(
        companyId,
        { $set: updateData },
        { new: true }
    );
    res.status(200).json({ message: "Logo deleted successfully", company: updatedCompany });
})

export const deleteCoverPic = asynchandler(async (req, res, next) => { 
    const { companyId } = req.params;
    const company = await companymodel.findById(companyId );
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    if ( company.createdBy.toString()!== req.user._id.toString()) {
        return next(new Error("you are not allowed", { cause: 403 }));
    }
    if (company.coverPic && company.coverPic?.public_id) {
        await cloudinary.uploader.destroy(company.coverPic.public_id);
    }
    const updateData = {
        coverPic: null
    };
    
    const updatedCompany = await companymodel.findByIdAndUpdate(
        companyId,
        { $set: updateData },
        { new: true }
    );
    res.status(200).json({ message: "cover deleted successfully", company: updatedCompany });
})

export const addHR = asynchandler(async (req, res, next) => {
  
        const { companyId } = req.params;
        const { userId } = req.params;
    
      
     
    
       
        const company = await companymodel.findOne({ _id: companyId, approvedByAdmin: true,isdeleted:false });
        if (!company) {
            return next(new Error("Company not found or not approved", { cause: 404 }));
        }
    
      
        if (company.createdBy.toString() !== req.user._id.toString()) {
            return next(new Error("You are not allowed to add HR to this company", { cause: 403 }));
        }
    
   
        if (company.HRs.includes(userId)) {
            return next(new Error("User is already an HR for this company", { cause: 409 }));
        }
  
        company.HRs.push(userId);
        await company.save();
    
        return res.status(200).json({ message: "HR added successfully", company });
    });


//hard delete the company
export const hardDelete = asynchandler(async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companymodel.findById(companyId);
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    if ( company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error(" Only admins or company's owner can delete ", { cause: 403 }));
    }
        
    await company.deleteOne();
    return res.status(200).json({ message: "Company deleted successfully" });
})
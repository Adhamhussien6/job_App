import { Router } from "express";
import { addCompany, addHR, deleteCoverPic, deleteLogo, getCompanyWithJobs, hardDelete, searchCompanyByName, softDelete, updateCompany, uploadCoverPic, uploadLogo } from "./company.service.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { filetypes, multerHost } from "../../middleware/multer.js";
import { userRole } from "../../middleware/eNum.js";
import { validation } from "../../middleware/validation.js";
import { addCompanySchema, approveCompanySchema, searchCompanySchema, softDeleteSchema, updateCompanySchema, uploadLogoSchema } from "./company.validation.js";

const companyrouter = Router()

companyrouter.post("/addCompany",  multerHost([...filetypes.image,...filetypes.document]).fields([
    { name: "logo", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
    { name: "legalAttachment", maxCount: 1 },
]), authenticate,validation(addCompanySchema), addCompany)



companyrouter.patch("/updateCompany/:companyId", multerHost([...filetypes.image]).fields([
    { name: "logo", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
 
]), authenticate,validation(updateCompanySchema), updateCompany)

companyrouter.patch("/softDelete/:companyId", authenticate, validation(softDeleteSchema),softDelete)
companyrouter.get("/getCompanyWithJobs/:companyId", authenticate, validation(softDeleteSchema),getCompanyWithJobs);
companyrouter.get("/searchCompany", authenticate,validation(searchCompanySchema), searchCompanyByName);
companyrouter.patch("/uploadLogo/:companyId", multerHost(filetypes.image).single("logo"),authenticate,validation(uploadLogoSchema),uploadLogo)
companyrouter.patch("/uploadCover/:companyId", multerHost(filetypes.image).single("coverPic"),authenticate,validation(uploadLogoSchema),uploadCoverPic)
companyrouter.delete("/deleteLogo/:companyId",  validation(softDeleteSchema),authenticate,deleteLogo)
companyrouter.delete("/deleteCover/:companyId", validation(softDeleteSchema), authenticate, deleteCoverPic)
companyrouter.post("/addHRs/:companyId/:userId", authenticate, addHR)
companyrouter.delete("/deleteCompany/:companyId",authenticate,hardDelete)



export default companyrouter
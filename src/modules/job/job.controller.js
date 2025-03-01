import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { acceptOrRejectApplicant, addJob, deleteJob, getApplicationsForJob, getJobsByCompanyName, getJobsForCompany, getSpecificJob, jobFilter, updateJob } from "./gob.service.js";
import { validation } from "../../middleware/validation.js";
import { addJobSchema, applicationSchema, deleteJobSchema, getJobsByNameSchema, getJobsSchema, jobFilterSchema, StatusSchema, updateJobSchema } from "./job.validation.js";


const jobrouter = Router()
jobrouter.post("/addJob/:companyId",validation(addJobSchema),authenticate,addJob)
jobrouter.patch("/updateJob/:jobId/:companyId",validation(updateJobSchema),authenticate,updateJob)
jobrouter.delete("/deleteJob/:jobId/:companyId", validation(deleteJobSchema),authenticate, deleteJob)
jobrouter.get("/getJobs/:companyId",authenticate,validation(getJobsSchema),getJobsForCompany)
jobrouter.get("/getJobs/:companyId/:jobId",authenticate,validation(deleteJobSchema),getSpecificJob)
jobrouter.get("/getJobsByName",authenticate,validation(getJobsByNameSchema),getJobsByCompanyName)
jobrouter.get("/getfilter", authenticate,validation(jobFilterSchema),jobFilter)
jobrouter.get("/getapplication/:jobId/:companyId", authenticate,validation(applicationSchema), getApplicationsForJob)
jobrouter.patch("/acceptApply/:applicationId",authenticate,validation(StatusSchema),acceptOrRejectApplicant)


export default jobrouter
import { Router } from "express";
 import { applyForJob } from "./application.service.js";
 import { authenticate, authorization } from "../../middleware/auth.js";
 import { filetypes, multerHost } from "../../middleware/multer.js";
import { userRole } from "../../middleware/eNum.js";

const applicationrouter = Router()

 applicationrouter.post("/apply", multerHost(filetypes.document).single("userCv"),authenticate,authorization(userRole.user),applyForJob)

export default applicationrouter
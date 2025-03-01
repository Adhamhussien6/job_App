import { Router } from "express";
import { confirmEmail, deleteCoverPic, deleteProfilePic, forgotPassword, getLoginData, getLoginUswerAccountData, hardDelete, loginWithGmail, refreshToken, resetPassword, signin, signup, softDelete, updateCoverPic, updatePassword, updateProfile, updateProfilePic } from "./user.service.js";
import { filetypes, multerHost } from "../../middleware/multer.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { confirmEmailSchema, deletePictureSchema, forgotpasswordschema, getLoginInfoSchema, loginschema, refreshTokenSchema, resetpasswordschema, signupschema, softDeleteSchema, updatePasswordSchema, updateProfilePicture, updateProfileSchema } from "./user.validation.js";
import { userRole } from "../../middleware/eNum.js";

const userrouter = Router()

//userrouter.post("/signup",multerHost(filetypes.image).single("profilePicture"),signup)
userrouter.post("/signup",  multerHost(filetypes.image).fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPicture", maxCount: 1 }
]), validation(signupschema),signup)
  
userrouter.patch("/confirmEmail",validation(confirmEmailSchema),confirmEmail)
userrouter.post("/signin", validation(loginschema),signin)
userrouter.patch("/forgotPassword",validation(forgotpasswordschema),forgotPassword)
userrouter.patch("/resetPassword", validation(resetpasswordschema),resetPassword)
userrouter.get("/refreshToken", validation(refreshTokenSchema), refreshToken)
userrouter.patch("/updateProfile", validation(updateProfileSchema), authenticate, updateProfile)
userrouter.get("/getLoginInfo", validation(getLoginInfoSchema), authenticate, getLoginData)
userrouter.get("/getuserdata/:userId", validation(getLoginInfoSchema), authenticate, getLoginUswerAccountData)
userrouter.patch("/updatePassword", validation(updatePasswordSchema), authenticate, updatePassword)
userrouter.patch("/updateProfilePic", multerHost(filetypes.image).single("profilePicture"),validation(updateProfilePicture),authenticate,updateProfilePic)
userrouter.patch("/updateCoverPic", multerHost(filetypes.image).single("coverPicture"), validation(updateProfilePicture), authenticate, updateCoverPic)
userrouter.delete("/deleteProfilepic",validation(deletePictureSchema),authenticate,deleteProfilePic)
userrouter.delete("/deleteCoverpic",validation(deletePictureSchema),authenticate,deleteCoverPic)
userrouter.patch("/softDelete/:userId", validation(softDeleteSchema), authenticate,authorization(userRole.admin), softDelete)
userrouter.delete("/hardDelete/:userId", validation(softDeleteSchema), authenticate,authorization(userRole.admin), hardDelete)
userrouter.post("/loginWithGmail",loginWithGmail)

export default userrouter
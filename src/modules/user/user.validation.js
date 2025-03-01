import joi from 'joi';
import { genralrules } from '../../utils/generalrules/index.js';
import { enumGender, userRole } from '../../middleware/eNum.js';



export const signupschema = joi.object({
    firstName:joi.string().alphanum().min(3).max(50).required(),
    lastName:joi.string().alphanum().min(3).max(50).required(),
    email: genralrules.email.required(),
     password: genralrules.password.required(),
    cpassword:genralrules.password.valid(joi.ref("password")).required(),
    mobileNumber: joi.string().required(),
    gender: joi.string().valid(enumGender.female,enumGender.male).required(),
  
    DOB: joi.date().required(),
    role:joi.string().valid(userRole.user,userRole.admin).required(),
     file:genralrules.file,
})

export const confirmEmailSchema = joi.object({
    email: genralrules.email.required(),
    otp:joi.string().length(4).required(),
}).required()
    
export const loginschema = joi.object({
    email: genralrules.email.required(),
    password: genralrules.password.required(),
}).required()

export const forgotpasswordschema = joi.object({
    email: genralrules.email.required()
}).required()

export const resetpasswordschema = joi.object({
    email: genralrules.email.required(),
    newpassword: genralrules.password.required(),
    cpassword: genralrules.password.valid(joi.ref("newpassword")).required(),
    otp: joi.string().length(4).required(),
}).required()

export const refreshTokenSchema = joi.object({
    
        authorization: joi.string().required()
    
}).required()

export const updateProfileSchema = joi.object({
    firstName:joi.string().alphanum().min(3).max(50),
    lastName:joi.string().alphanum().min(3).max(50),
    
    gender: joi.string().valid(enumGender.female, enumGender.male),
    
    mobileNumber: joi.string(),
    //from chatgpt
    DOB: joi.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))) 
    .messages({
      "date.max": "You must be at least 18 years old",
    }),
    

}).required()

export const getLoginInfoSchema = joi.object({
    headers: joi.object({
        authorization: joi.string().required()
    }).unknown(true),
    userId:genralrules.id
    
});

export const updatePasswordSchema = joi.object({
    oldpassword: genralrules.password.required(),
    newpassword: genralrules.password.required(),
    cpassword: genralrules.password.valid(joi.ref("newpassword")).required(),
    headers: joi.object({
                authorization: joi.string().required()
             }).unknown(true)
})

export const updateProfilePicture = joi.object({
    body: joi.object({
        file: genralrules.file.required()
     }).unknown(true)


}).required()

export const deletePictureSchema = joi.object({
    headers: joi.object({
        authorization: joi.string().required()
    }).unknown(true)  
}).required()

export const softDeleteSchema = joi.object({
    headers: joi.object({
        authorization: joi.string().required()
    }).unknown(true),
    userId:genralrules.id.required(),
}).required()




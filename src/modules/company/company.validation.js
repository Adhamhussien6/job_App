
import joi from 'joi';
import { genralrules } from '../../utils/generalrules/index.js';

export const addCompanySchema = joi.object({
    companyName: joi.string().trim().min(3).max(50).required(),
    description:joi.string().alphanum().min(3).max(1000).required(),
    industry:joi.string().alphanum().min(3).max(1000).required(),
    address:joi.string().alphanum().min(3).max(1000).required(),
    companyEmail: genralrules.email.required(),

    numberOfEmployees: joi.number().required(),
   
})



export const approveCompanySchema = joi.object({
    companyId: genralrules.id.required(),
});




export const updateCompanySchema = joi.object({
    companyId: genralrules.id.required(), 
    companyName: joi.string().alphanum().min(3).max(50),
    description: joi.string().min(3).max(1000),
    industry: joi.string().min(3).max(1000),
    address: joi.string().min(3).max(1000),
    companyEmail: genralrules.email,
    numberOfEmployees: joi.number(),
    legalAttachment: joi.forbidden(), 
});



export const softDeleteSchema = joi.object({
    companyId: genralrules.id.required(), 
})



export const searchCompanySchema = joi.object({
    name: joi.string().min(2).max(100).required(), 
});




export const uploadLogoSchema = joi.object({
    companyId: genralrules.id.required(), 
   // logo: genralrules.file.required(), 
});


export const addHRScheme = joi.object({
    userId:genralrules.id.required(),
    companyId: genralrules.id.required(),
});


import Joi from 'joi';
import { genralrules } from '../../utils/generalrules/index.js';


export const addJobSchema = Joi.object({
    jobTitle: Joi.string().min(3).max(100).required(),
    jobLocation: Joi.string().min(3).max(100).required(),
    workingTime: Joi.string().valid("full_time", "part_time").required(),
    seniorityLevel: Joi.string().valid("fresh", "junior", "mid_level", "senior", "team_lead","cto").required(),
    jobDescription: Joi.string().min(10).max(1000).required(),
    technicalSkills: Joi.array().items(Joi.string().min(2).max(50)).required(),
    softSkils: Joi.array().items(Joi.string().min(2).max(50)).required(),

    companyId:genralrules.id.required()
});
export const updateJobSchema = Joi.object({
    jobTitle: Joi.string().min(3).max(100),
    jobLocation: Joi.string().min(3).max(100),
    workingTime: Joi.string().valid("full_time", "part_time"),
    seniorityLevel: Joi.string().valid("fresh", "junior", "mid_level", "senior", "team_lead","cto"),
    jobDescription: Joi.string().min(10).max(1000),
    technicalSkills: Joi.array().items(Joi.string().min(2).max(50)),
    softSkils: Joi.array().items(Joi.string().min(2).max(50)),

    companyId:genralrules.id,
    jobId:genralrules.id
}).min(1);//عشان يبقي لازم علي الاقل يعدل حاجة فيهم


export const deleteJobSchema = Joi.object({
    jobId: genralrules.id.required(),
    companyId:genralrules.id.required()
});

export const getJobsSchema = Joi.object({
    companyId:genralrules.id.required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
});

export const getJobsByNameSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
});

export const jobFilterSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    workingTime: Joi.string().valid("Full-time", "Part-time", "Remote").optional(),
    jobLocation: Joi.string().trim().optional(),
    seniorityLevel: Joi.string().trim().optional(),
    jobTitle: Joi.string().trim().optional(),
    technicalSkills: Joi.string().trim().optional(),
});

export const applicationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().valid("createdAt", "-createdAt").optional(),
    jobId: genralrules.id.required(),
    companyId:genralrules.id.required()
});

export const StatusSchema = Joi.object({
    status: Joi.string().valid("accepted", "rejected", "pending", "inconsideration", "viewed").required(),
    applicationId: genralrules.id.required()
})
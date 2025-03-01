import mongoose from 'mongoose';
import { jobLocation, seniorityLevel, workingTime } from '../../middleware/eNum.js';
import applicationmodel from './apllication.model.js';


const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true
    },
    jobLocation: {
        type: String,
        enum: Object.values(jobLocation),
        required: true
    },
    workingTime: {
        type: String,
        enum: Object.values(workingTime),
        required: true
        
    },

    seniorityLevel: {
        type: String,
        enum: Object.values(seniorityLevel),
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    technicalSkills: [{
        type: String,
       required: true
    }],
    softSkils: [{
        type: String,
        required: true
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        
        
    },
    closed: {
        type: Boolean,
        default: false
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        required: true
    }
    
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
   
})


jobSchema.virtual('company', {
    ref: 'company',
    localField: 'companyId',
    foreignField: '_id',
    justOne: true 
});

jobSchema.virtual("applications", {
    ref: "application",
    localField: "_id",
    foreignField: "jobId",
});
  

jobSchema.pre("findOneAndDelete", async function (next) {
    const jobId = this.getQuery()._id;
    
   
    await applicationmodel.deleteMany({ jobId });

    next();
});


const jobmodel = mongoose.model.job || mongoose.model("job", jobSchema)

export default jobmodel;
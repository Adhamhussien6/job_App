import mongoose from 'mongoose';
import { status } from '../../middleware/eNum.js';


const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userCv: {
        secure_url: String,
        public_id: String,
       
    },
    status: {
        type: String,
        enum:  Object.values(status),
        default: 'pending'
    }
   
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
   
})

applicationSchema.virtual("userDetails", {
    ref: "user",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
});
applicationSchema.virtual("companyDetails", {
    ref: "company",
    localField: "jobId",
    foreignField: "_id",
    justOne: true,
   // options: { populate: { path: "companyId", select: "companyName email ownerId" } },
  });


const applicationmodel = mongoose.model.application || mongoose.model("application", applicationSchema)

export default applicationmodel;
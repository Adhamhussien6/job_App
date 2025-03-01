import mongoose from 'mongoose';
import jobmodel from './job.model.js';


const companySchema = new mongoose.Schema({
    companyName: {
    type: String,
   // required: true,
    unique: true
    },
    description: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    numberOfEmployees: {
        type: Number,
        required: true,
        min: 11,
        max:20
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    logo: {
        secure_url: String,
        public_id: String
    },
    coverPic: {
        secure_url: String,
        public_id: String
    },
    HRs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    bannedAt: {
        type: Date,
       
    },
    isbanned: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
    },
    isdeleted: {
        type: Boolean,
        default: false
    },
    legalAttachment: {
        secure_url: String,
        public_id: String
    },
    approvedByAdmin: {
        type: Boolean,
        default: false
    }
   


   
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
   
})

companySchema.virtual("jobs", {
    ref: "job",
    localField: "_id",
    foreignField: "companyId"
});

companySchema.pre("deleteOne", async function (next) {
    const companyId = this.getQuery()._id;
    
   
    await jobmodel.deleteMany({ companyId });

    next();
})

const companymodel = mongoose.model.company || mongoose.model("company", companySchema)

export default companymodel;
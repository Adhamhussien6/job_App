import mongoose from 'mongoose';
import { codeType, enumGender, userRole } from '../../middleware/eNum.js';
import { Hash } from '../../utils/hash/hash.js';
import { encrypt } from '../../utils/encrypt/encrypt.js';
import { decrypt } from '../../utils/encrypt/decrypt.js';
import applicationmodel from './apllication.model.js';
import companymodel from './company.model.js';
import jobmodel from './job.model.js';
import chatmodel from './chat.model.js';


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20

    }, lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
       
        minlength: 8,
        trim: true
       
    },
    provider: {
        type: String,
        required: true,
        enum: ['system', 'google'],
        default:'system'
    },
    gender: {
        type: String,
        enum: Object.values(enumGender),
        required: true
    },
    DOB: {
        type: Date,
        required: true,
        validate: {
        validator: function(value) {
          const age = new Date().getFullYear() - value.getFullYear();
          return age > 18;
        },
        message: "User must be older than 18 years"
        }
    },
    mobileNumber: {
        type: String,
        required: true,
        
      
    },
    role: {
        type:String,
        enum: Object.values(userRole),
        default: userRole.user
    },
    isCorfimed: {
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
    bannedAt: {
        type: Date,
    },
    isbanned: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      
    },
    changeCredentialsTime: {
        type: Date,
        
    },
    profilePicture: {
        secure_url: String,
        public_id: String
    },
    coverPicture: {
        secure_url: String,
        public_id: String
    },
    Otp: [{
        code: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: Object.values(codeType),
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
        


    }]
    // otp: {
    //     type: String,
       
    // }


   
}, {
    timestamps: true,
   
})


userSchema.virtual("username").get(function() {
    return [this.firstName, this.lastName].join(" ");
});
  


userSchema.pre("save", async function (next, doc) {
   
    if (this.isModified("password")) {
        this.password=await Hash({key:this.password,SALT_ROUNDs:process.env.SALT_ROUND})

    }
    if (this.isModified("mobileNumber")) {
        this.mobileNumber = await encrypt({
          key: this.mobileNumber,
          SECRET_KEY: process.env.SECRET_KEY,
        });
      }
    
    
    next()
    
    

})




userSchema.post("findOne", async function (doc,next) {
    if (doc && doc.mobileNumber) {
        doc.mobileNumber = await decrypt({
            key: doc.mobileNumber,
            SECRET_KEY: process.env.SECRET_KEY,
        });
    }
});

userSchema.pre("deleteOne", async function (next) {
    const userId = this.getQuery()._id;
    
   
    await companymodel.deleteMany({ createdBy: userId });

 
    await jobmodel.deleteMany({ addedBy: userId });

    await applicationmodel.deleteMany({userId})

    
    await chatmodel.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }]
    });

    next();
});

  

const usermodel = mongoose.model.user || mongoose.model("user", userSchema)

export default usermodel;
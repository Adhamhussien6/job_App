
import usermodel from "../../DB/models/user.model.js";
import { decodedToken } from "../../middleware/auth.js";
import { tokenTypes, userRole } from "../../middleware/eNum.js";
import cloudinary from "../../utils/cloudnairy/index.js";
import { decrypt } from "../../utils/encrypt/decrypt.js";
import { encrypt } from "../../utils/encrypt/encrypt.js";

import { asynchandler } from "../../utils/globalerrorhandling/index.js";
import { compare } from "../../utils/hash/compare.js";
import { Hash } from "../../utils/hash/hash.js";
import { eventEmitter } from "../../utils/sendemail.events/index.js";
import { generatetoken } from "../../utils/token/generateToken.js";
import {OAuth2Client} from 'google-auth-library';


export const signup = asynchandler(async (req, res, next) => {
    const { firstName,lastName, email, password, mobileNumber, gender,DOB,role } = req.body;
    //check email
  
    
    const emailexist = await usermodel.findOne({ email: email })
    if (emailexist) {
      return next(new Error("Email already exists", { cause: 400 }));
    }


    let profilePicture = null;
    let coverPicture = null;

    if (req.files?.profilePicture) {
        const uploadProfile = await cloudinary.uploader.upload(req.files.profilePicture[0].path,{  folder: "job_app/users",});
        profilePicture = { secure_url: uploadProfile.secure_url, public_id: uploadProfile.public_id };
    }

    if (req.files?.coverPicture) {
        const uploadCover = await cloudinary.uploader.upload(req.files.coverPicture[0].path,{  folder: "job_app/users",});
        coverPicture = { secure_url: uploadCover.secure_url, public_id: uploadCover.public_id };
    }

    const newUser = await usermodel.create({
        firstName,
        lastName,
        email,
        
        password ,
        mobileNumber,
        gender,
        role,
        
         DOB,
        provider:"system",
        profilePicture,
        coverPicture
   
    })
  
    //send OTP
    eventEmitter.emit("confirmEmail", { email, id: newUser._id });
  
    return res
      .status(201)
      .json({ message: "User created successfully", newUser });
});
  
export const confirmEmail = asynchandler(async (req, res, next) => {
    const { email, otp } = req.body;
    //check email
    const user = await usermodel.findOne({ email, isCorfimed: false });
   
    if (!user) {
      return next(
        new Error("Email not exists or already confirmed", { cause: 404 })
      );
    }
    const otpfinder = user.Otp.find(finder => finder.type === "confirmEmail");

    if (!otpfinder) {
        return next(new Error("No OTP found for email confirmation", { cause: 400 }));
    }
    if (new Date() > otpfinder.expiresAt) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }
  
    //compare otp
    const matchotp = await compare({ key: otp, hashed: otpfinder.code });
  
    if (!matchotp) {
      return next(new Error("Invalid OTP", { cause: 400 }));
    }
  
    //update user
    await usermodel.updateOne(
      { email },
        { isCorfimed: true, $pull: { Otp: { type: "confirmEmail" } } },
      {new: true}
    );
  
    return res
      .status(200)
      .json({ message: "Email confirmed successfully", user });
})

export const signin = asynchandler(async (req, res, next) => {
    const { email, password } = req.body;
    //check email
    const user = await usermodel.findOne({ email, isCorfimed: true,provider:"system" });
    if (!user) {
      return next(
        new Error("Email not exists or not confirmed yet", { cause: 404 })
      );
    }
    if (user.provider !== "system") {
        return next(new Error("This email is registered using Google", { cause: 400 }));
    }
  
    //compare password
    const matchpassord = await compare({ key: password, hashed: user.password });
  
    if (!matchpassord) {
      return next(new Error("password is incorrect", { cause: 400 }));
    }
  
    //generate token
    const access_token = await generatetoken({
      payload: { email, id: user._id },
      SIGNATURE:
        user.role == userRole.user
          ? process.env.ACCESS_SIGNATURE_USER
          : process.env.ACCESS_SIGNATURE_ADMIN,
      option: { expiresIn: "1d" },
    });
  
    const refresh_token = await generatetoken({
      payload: { email, id: user._id },
      SIGNATURE:
        user.role == userRole.user
          ? process.env.REFRESH_SIGNATURE_USER
          : process.env.REFRESH_SIGNATURE_ADMIN,
      option: { expiresIn: "1w" },
    });
  
    return res.status(200).json({
      message: "done",
      token: {
        access_token,
        refresh_token,
      },
    });
  
})

export const forgotPassword = asynchandler(async(req, res, next)=> {
    const { email } = req.body;
  //check email
  const user = await usermodel.findOne({ email, isdeleted: false,isCorfimed:true });
  if (!user) {
    return next(new Error("Email not exists ", { cause: 404 }));
  }
  eventEmitter.emit("forgotPassword", { email });

  return res.status(201).json({ msg: "done" });
})

export const resetPassword = asynchandler(async (req, res, next) => { 
    const { email, otp, newpassword } = req.body;
  const user = await usermodel.findOne({ email, isdeleted: false ,isCorfimed:true});

  if (!user) {
    return next(new Error("email not exist", { cause: 404 }));
    }
    const otpfinder = user.Otp.find(
        finder => finder.type === "forgotPassword"
    );
    if (!otpfinder) {
        return next(new Error("Invalid or expired OTP", { cause: 400 }));
    }

   
    if (otpfinder.expiresAt < new Date()) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }

  const matchotp = await compare({ key: otp, hashed: otpfinder.code  });
  if (!matchotp) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  //hash password
  const hashedPassword = await Hash({
    key: newpassword,
    SALT_ROUNDs: process.env.SALT_ROUND,
  });

  //update user
  await usermodel.updateOne(
    { email },
    { password: hashedPassword, confirmed: true, $pull: { Otp: { type: "forgotPassword" } },changeCredentialsTime:new Date() }
  );

  return res.status(201).json({ msg: "done", user });

})

export const refreshToken = asynchandler(async (req, res, next) => { 
  const { authorization } = req.body;
  //const authorization = req.headers.authorization;

    const user = await decodedToken({
      authorization,
      tokenType: tokenTypes.refresh,
      next,
    });
  
    // generate new access token
    const access_token = await generatetoken({
      payload: { email: user.email, id: user._id },
      SIGNATURE:
        user.role == userRole.user
          ? process.env.ACCESS_SIGNATURE_USER
          : process.env.ACCESS_SIGNATURE_ADMIN,
      option: { expiresIn: "1d" },
    });
  
  
    return res.status(200).json({ message: "done", token: { access_token } });
})

export const updateProfile = asynchandler(async (req, res, next) => { 
  if (req.body.mobileNumber) {
    req.body.mobileNumber = await encrypt({
      key: req.body.mobileNumber,
      SECRET_KEY: process.env.SECRET_KEY,
    });
  }
 
  const user = await usermodel.updateOne({ _id: req.user._id }, req.body, {
    new: true,
  });
  return res
    .status(200)
    .json({ message: "Profile updated successfully", user });
});

export const getLoginData = asynchandler(async (req, res, next) => {
  const user = await usermodel.findOne({ _id: req.user.id });

    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    return res.status(200).json({ message: "Success", user });
})

export const getLoginUswerAccountData = asynchandler(async (req, res, next) => { 
  const { userId } = req.params
  const user = await usermodel.findOne({ _id: userId, isdeleted: false,isCorfimed:true });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
 
  return res.status(200).json({
    message: "Success",
    user: {
      userName:user.username,
      mobileNumber:user.mobileNumber, 
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture
    }
});
})

export const updatePassword = asynchandler(async (req, res, next) => {
  const { oldpassword, newpassword } = req.body;

  const matchpassord = await compare({
    key: oldpassword,
    hashed: req.user.password,
  });
  if (!matchpassord) {
    return next(new Error("Old password is incorrect", { cause: 400 }));
  }
  //hash password
  const hashedPassword = await Hash({
    key: newpassword,
    SALT_ROUNDs: process.env.SALT_ROUND,
  });
  //update user
  const user = await usermodel.findByIdAndUpdate(
    { _id: req.user._id },
    { password: hashedPassword, changeCredentialsTime: Date.now() },
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "Password updated successfully", user });
 
})

export const updateProfilePic = asynchandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded", { cause: 400 }));
  } 
  
  const user = await usermodel.findById(req.user.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }
 
 
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "job_app/users",
      }
    );
    req.body.profilePicture = { secure_url, public_id };
  
  
  const updatedUser = await usermodel.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true }
  );
 

return res.status(200).json({ message: "Profile picture updated successfully", updatedUser });
})

export const updateCoverPic = asynchandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded", { cause: 400 }));
  } 
  const user = await usermodel.findById(req.user.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.coverPicture && user.coverPicture.public_id) {
    await cloudinary.uploader.destroy(user.coverPicture.public_id);
  }
  

 
  
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "job_app/users",
      }
    );
    req.body.coverPicture = { secure_url, public_id };
  
  
  const updatedUser = await usermodel.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true }
  );
  if (!updatedUser) {
    return next(new Error("User not found", { cause: 404 }));
}

return res.status(200).json({ message: "cover picture updated successfully", updatedUser });
})

export const deleteProfilePic = asynchandler(async (req, res, next) => {
  const user = await usermodel.findById(req.user.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.profilePicture && user.profilePicture.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  } else {
    return res.status(200).json({ message: "No profile picture to delete" });
  }
  const updatedUser = await usermodel.findByIdAndUpdate(
    req.user.id,
    { profilePicture: null },
    { new: true }
  );
  if (!updatedUser) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return res.status(200).json({ message: "Profile picture deleted successfully", updatedUser });
})

export const deleteCoverPic = asynchandler(async (req, res, next) => { 
  const user = await usermodel.findById(req.user.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.coverPicture && user.coverPicture.public_id) {
    await cloudinary.uploader.destroy(user.coverPicture.public_id);
  } else {
    return res.status(200).json({ message: "No profile picture to delete" });
  }
  const updatedUser = await usermodel.findByIdAndUpdate(
    req.user.id,
    { coverPicture: null },
    { new: true }
  );
  if (!updatedUser) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return res.status(200).json({ message: "cover picture deleted successfully", updatedUser });
})

export const softDelete = asynchandler(async (req, res, next) => {

   
 
    const { userId } = req.params; 
    const user = await usermodel.findById(userId);
  
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }
  
    
    if (user.role === "admin") {
      return next(new Error("Admins cannot delete other admins", { cause: 403 }));
    }
  
   
    user.isdeleted = true;
    user.deletedAt = Date.now(); 
    await user.save();
  
    return res.status(200).json({
      message: "User soft deleted successfully"});
});
  
//login with gmail
export const loginWithGmail = asynchandler(async (req, res, next) => {
  const { idToken } = req.body;

const client = new OAuth2Client();
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,  
  });
  const payload = ticket.getPayload();
  return payload

}
  const { email, email_verified, picture, name } = await verify()
  let user = await usermodel.findOne({ email });
  if (!user) {
    user = await usermodel.create({
      name,
      email,
      isCorfimed: email_verified,
      profilePicture: picture,
      provider: "google",

      
    })

  } 
  if (user.provider != "google") { 
    return next(new Error("User already exists with a different provider", { cause: 409 }));

  }

  const access_token = await generatetoken({
    payload: { email, id: user._id },
    SIGNATURE:
      user.role == userRole.user
        ? process.env.ACCESS_SIGNATURE_USER
        : process.env.ACCESS_SIGNATURE_ADMIN,
    option: { expiresIn: "1d" },
  });

  return res.status(201).json({msg:"done",token:access_token})

})

//hard delete user
export const hardDelete = asynchandler(async (req, res, next) => {

   
   
    const { userId } = req.params; 
    const user = await usermodel.findById(userId);
  
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }
  
    
    if (user.role === "admin") {
      return next(new Error("Admins cannot delete other admins", { cause: 403 }));
    }
  
  //await usermodel.findByIdAndDelete(userId);
  await user.deleteOne()

  
    return res.status(200).json({
      message: "User hard deleted successfully"});
  });
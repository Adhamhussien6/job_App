import companymodel from "../../../DB/models/company.model.js";
import usermodel from "../../../DB/models/user.model.js";
import { authgraph } from "../../../middleware/auth.js";
import { userRole } from "../../../middleware/eNum.js";


export const getAllUsersAndCompanies = async (parent, args) => {
    const { authorization } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
    const users = await usermodel.find({})
    const company = await companymodel.find({})
       
    
    return {users, company}
    
}


export const banuser = async (parent, args) => { 
    const { authorization, userId } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
  
    const benneduser = await usermodel.findOne({_id:userId,  isbanned: false})
    if (!benneduser) {
      throw new Error("User not found or already banned.");
    }
    benneduser.isbanned = true
    benneduser.bannedAt=new Date
    await benneduser.save()
    return "done"

}




export const unbanuser = async (parent, args) => { 
    const { authorization, userId } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
  
    const benneduser = await usermodel.findOne({_id:userId,  isbanned: true})
    if (!benneduser) {
      throw new Error("User not found or not banned.");
    }
    benneduser.isbanned = false
    benneduser.bannedAt=null
    await benneduser.save()
    return "done"

}



export const banCompany = async (parent, args) => { 
    const { authorization, companyId } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
  
    const bennedCompany = await companymodel.findOne({_id:companyId,  isbanned: false})
    if (!bennedCompany) {
      throw new Error("User not found or already banned.");
    }
    bennedCompany.isbanned = true
    bennedCompany.bannedAt=new Date
    await bennedCompany.save()
    return "done"

}



export const unbanCompany = async (parent, args) => { 
    const { authorization, companyId } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
  
    const bennedCompany = await companymodel.findOne({_id:companyId,  isbanned: true})
    if (!bennedCompany) {
      throw new Error("User not found or not banned.");
    }
    bennedCompany.isbanned = false
    bennedCompany.bannedAt=null
    await bennedCompany.save()
    return "done"

}


export const approveCompany = async (parent, args) => { 
    const { authorization, companyId } = args
    const user = await authgraph({ authorization, accessrole: [userRole.admin] })
    if (!user) {
        throw new Error("Unauthorized.");
    }
    const company = await companymodel.findByIdAndUpdate(companyId, { $set: { approvedByAdmin: true } }, { new: true });
    if (!company) {
        throw new Error("Company not found");
    }
    return "Company approved successfully"
}
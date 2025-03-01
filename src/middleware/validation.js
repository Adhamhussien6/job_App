import { AppError } from "../utils/globalerrorhandling/index.js";
import { asynchandler } from "../utils/globalerrorhandling/index.js";



export const validation = (schema) => {
    return asynchandler(async(req, res, next) => {
      const inputdata = { ...req.body, ...req.query, ...req.params }
     
      const result = schema.validate(inputdata, { abortEarly: true })
      
      if (result?.error) {
       
        return next(new AppError(result,{cause:400}))
      }

        next();
      
    });
  };
  



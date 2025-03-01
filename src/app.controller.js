import connectionDB from "./DB/connectionDB.js";
import cors from "cors";
import { AppError, globalerrorhandling } from "./utils/globalerrorhandling/index.js";
import userrouter from "./modules/user/user.controller.js";
import jobrouter from "./modules/job/job.controller.js";
import companyrouter from "./modules/company/company.controller.js";
import applicationrouter from "./modules/application/application.controller.js";
import { rateLimit } from "express-rate-limit"
  import { createHandler } from 'graphql-http/lib/use/express';
  import { schema } from "./modules/graph.schema.js";
import chatrouter from "./modules/chat/chat.controller.js";


const limiter = rateLimit({
  limit: 20,
  windowMs: 2 * 60 * 1000, 
  message: "Too many requests from this IP, please try again in a minute.",
  statusCode: 400
})


const bootstrap = async (app, express) => {


  app.use(cors());
   app.use(limiter)

  app.use(express.json());

  await connectionDB()

  app.use("/user",userrouter)
  app.use("/job",jobrouter)
  app.use("/company",companyrouter)
  app.use("/application", applicationrouter)
  app.use("/chat", chatrouter)


 

  app.all('/graphql', createHandler({ schema:schema }));

    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Server is running" });
    });
  
    app.use("*", (req, res, next) => {
     
      return next(new AppError(`invalid url ${req.originalUrl}`,404))
    });
  
    app.use(globalerrorhandling);
    
}


export default bootstrap

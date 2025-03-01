import { Router } from "express";
import { getChatHistory } from "./chat.service.js";
import { authenticate } from "../../middleware/auth.js";


const chatrouter = Router()
chatrouter.get("/History/:userId",authenticate,getChatHistory)


export default chatrouter
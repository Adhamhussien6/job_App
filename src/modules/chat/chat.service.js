
import chatmodel from "../../DB/models/chat.model.js";
import { asynchandler } from "../../utils/globalerrorhandling/index.js";

export const getChatHistory = asynchandler(async (req, res, next) => {
    const { userId } = req.params; 
    const currentUserId = req.user._id;

  
    const chat = await chatmodel.findOne({
        $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
        ]
    }).populate("messages.senderId", "firstName lastName email");

    if (!chat) {
        return res.status(404).json({ message: "No chat history found." });
    }

    return res.status(200).json({
        message: "Chat history retrieved successfully",
        chat,
    });
});

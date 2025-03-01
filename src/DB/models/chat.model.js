import mongoose from 'mongoose';



const chatSchema = new mongoose.Schema({
    
    messages: [{
        message: {
            type: String,
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    }],
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true 
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }
}, {
    timestamps: true,
   
})




const chatmodel = mongoose.model.chat || mongoose.model("chat", chatSchema)

export default chatmodel;
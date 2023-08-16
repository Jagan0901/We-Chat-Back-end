import express from 'express';
import { auth } from '../middleware/auth.js';
import { getChatByChatId, updateChatsArray } from "../helper.js";
import { ObjectId } from 'mongodb';

const router = express.Router();

//To create messages
router.put("/send/:chatId",auth, async(req,res)=>{
    const {chatId} = req.params;
    const {userId,content} = req.body;
    if(!chatId ||!userId ||!content) return res.status(400).send({ error: "Invalid data passed into request" });
    const id = new ObjectId(chatId);
    const isChatExists = await getChatByChatId(id);
    const newMessage = {
      sender: userId,
      content: content,
      createdAt: new Date()
    };
    const chats = [...(isChatExists.chats),newMessage];
    const now = new Date();
    const updateChat = await updateChatsArray(id,chats,now);
    const fetchChatAgain = await getChatByChatId(id);
    res.send(fetchChatAgain);
});


//To fetch messages
router.get("/:chatId", auth, async(req,res)=>{
    const {chatId} = req.params;
    if(!chatId) return res.status(400).send({ error: "Invalid data passed into request" });
    const id = new ObjectId(chatId);
    const fetchChat = await getChatByChatId(id);
    res.send(fetchChat);
});






export const messagesRouter = router;
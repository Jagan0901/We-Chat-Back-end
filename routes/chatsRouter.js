import express from 'express';
import { auth } from '../middleware/auth.js';
import {checkUserExists, getChatsByUserIds, getUserDataById, create} from '../helper.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

//create one-one chat
router.post("/singleChat",auth, async(req,res)=>{
    const{loggedInUserId,userId} = req.body;

    const objectId = new ObjectId(loggedInUserId);
    const objectId1 = new ObjectId(userId);

    const isUserExists  = await checkUserExists(objectId);
    const isUser1Exists = await checkUserExists(objectId1);
    
    if(!isUserExists || !isUser1Exists){
      res.status(400).send({error:"Users not exists"});
      return;
    }

    const keyword = {
      $and: [
        { users: { $elemMatch: { _id: objectId } } },
        { users: { $elemMatch: { _id: objectId1 } } },
      ],
    };
    const isChatExists = await getChatsByUserIds(keyword);
    if(isChatExists){
        res.send(isChatExists);
        return;
    }else if(!isChatExists){
        
        const getLoggedInUserDetails = await getUserDataById(objectId);
        
        const getUserDetails = await getUserDataById(objectId1);
        let arr = [];

        const removePassword = 'password';
        delete getLoggedInUserDetails[removePassword];
        delete getUserDetails[removePassword];

        arr.push(getLoggedInUserDetails);
        arr.push(getUserDetails); 

        const data = {
          users: [...arr],
          chats: []
        }

        const chatCreation = await create(data);

        if(chatCreation){
        const getChat = await getChatsByUserIds(keyword);
        res.send(getChat);
        return;
        } else{
          res.status(400).send({error:"Unable to create a chat"})
          return;
        }
    }
});

export const chatsRouter = router;


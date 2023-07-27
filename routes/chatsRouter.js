import express from 'express';
import { auth } from '../middleware/auth.js';
import { getChatsByUserIds, getUserDataById, create} from '../helper.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

//create one-one chat
router.post("/singleChat",auth, async(req,res)=>{
    const{loggedInUserId,userId} = req.body;

    const objectId = new ObjectId(loggedInUserId);
    const objectId1 = new ObjectId(userId);
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
          res.status(400).send({error:"Some error occurs"})
          return;
        }
    }
});

export const chatsRouter = router;


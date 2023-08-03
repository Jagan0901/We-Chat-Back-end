import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  checkUserExists,
  getChatsByUserIds,
  getUserDataById,
  create,
  loggedInUserInvolved,
} from "../helper.js";
import { ObjectId } from 'mongodb';

const router = express.Router();

//create one-one chat
router.post("/singleChat",auth, async(req,res)=>{
    const{loggedInUserId,userId} = req.body;
    const isIdValid  = loggedInUserId.split('')
    const isId1Valid = userId.split('');

    if(isIdValid.length!==24 || isId1Valid.length!==24){
      res.status(400).send({error:"Invalid User Id. User Id must be a string of 12 bytes or a string of 24 hex characters or an integer"});
      return;
    }

    // console.log(isIdValid)

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
          chats: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

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


//get users that the loggedIn user part of
router.post("/getUsers",auth,async(req,res)=>{
  const { loggedInUserId } = req.body;
  const isIdValid = loggedInUserId.split("");

  if (isIdValid.length !== 24 ) {
    res
      .status(400)
      .send({
        error:
          "Invalid User Id. User Id must be a string of 12 bytes or a string of 24 hex characters or an integer",
      });
    return;
  }

  // console.log(isIdValid)

  const objectId = new ObjectId(loggedInUserId);

  const isUserExists = await checkUserExists(objectId);

  if (!isUserExists) {
    res.status(400).send({ error: "User not exists" });
    return;
  }

  const keyword = {
      users: { $elemMatch: { _id: objectId } } 
  };

  const getUsers = await loggedInUserInvolved(keyword);
  if(!getUsers){
    res.send({message:"Chats not created for this particular user."});
    return;
  }
  
  const usersArray = [];
  getUsers.forEach((item)=>{
    if(item.users[0]._id == loggedInUserId) usersArray.push(item.users[1]);
    else if(item.users[1]._id == loggedInUserId) usersArray.push(item.users[0]);
  })
  const result =  [...usersArray];
  const data = {
    _id:loggedInUserId,
    users:[...result] 
  }
  const dataThatUserPartOf = JSON.stringify(data);
  res.send(getUsers);
});

export const chatsRouter = router;



import { client } from "./index.js";
import bcrypt from 'bcrypt';


export async function getUserByMail(email){
    return await client
       .db("We-Chat")
       .collection("users")
       .findOne({email:email});
}

export async function genPassword(password){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

export async function createUser(name, email, hashedPassword, pic) {
  return await client
    .db("We-Chat")
    .collection("users")
    .insertOne({name:name, email: email, password:hashedPassword,pic:pic });
}

//Searching User


export async function searchingUser(keyword) {
  return await client
    .db("We-Chat")
    .collection("users")
    .find(keyword)
    // .findOne({ _id: { $ne: ObjectId(loginedUserId) } })
    .toArray();
}


//create on-one chat
//1.
export async function checkUserExists(objectId) {
  return await client
    .db("We-Chat")
    .collection("users")
    .findOne({ _id: objectId });
}

//2.
export async function getChatsByUserIds(keyword){
  return await client
    .db("We-Chat")
    .collection("chats")
    .findOne(keyword);
}

//3.
export async function getUserDataById(objectId){
  return await client
    .db("We-Chat")
    .collection("users")
    .findOne({ _id: objectId });
}

//4.
export async function create(data){
  return await client
    .db("We-Chat")
    .collection("chats")
    .insertOne(data);
}




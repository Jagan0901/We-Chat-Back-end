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
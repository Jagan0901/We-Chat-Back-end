import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByMail, genPassword, createUser } from '../helper.js';

const router = express.Router();

router.post("/signup", async(req,res)=>{
    var {name,email,password,pic} = req.body;
    if(name==="" || email==="" || password===""){
        res.status(400).send({error:"Please fill out the Details"});
        return;
    }
    //To set Email Pattern
  if (!/^[\w]{1,}[\w.+-]{0,}@[\w-]{2,}([.][a-zA-Z]{2,}|[.][\w-]{2,}[.][a-zA-Z]{2,})$/g.test(email)) {
    res.status(400).send({ error: "Invalid Email Pattern" });
    return;
  }
  const isUserExists = await getUserByMail(email);
  if(isUserExists){
    res.status(400).send({error:"Email already exists"});
    return;
  }

  //To set Password pattern
  if(!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(password)){
    res.status(400).send({error: "Invalid Password Pattern"});
    return;
  }
  const hashedPassword = await genPassword(password);
  if(pic===""){
    var pic ="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  }
  const create = await createUser(name,email,hashedPassword,pic);
  res.send({message:"Created Successfully"});
});

router.post("/login", async(req,res)=>{
  const { email, password } = req.body;
  const userFromDB = await getUserByMail(email);
  if (!userFromDB) {
    res.status(400).send({ error: "Invalid Email or Password" });
    return;
  }
  const storedDBPassword = userFromDB.password;
  //To compare entered password and DB password are same
  const isPasswordMatch = await bcrypt.compare(password,storedDBPassword);
  if(!isPasswordMatch){
    res.status(400).send({error: "Invalid Email or Password"});
    return;
  }
  const token =  jwt.sign({id:userFromDB._id}, process.env.SECRET_KEY)
  res.send({
  message:"Login Successfully",
  _id:userFromDB._id,
  name:userFromDB.name,
  email:userFromDB.email,
  pic:userFromDB.pic, 
  token: token
})
})


export const usersRouter = router;
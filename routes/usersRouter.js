import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByMail, genPassword, createUser, searchingUser} from '../helper.js';
import { auth } from './../middleware/auth.js';

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
});

//Search user
router.get("/user",auth,async(req,res)=>{
  const {loggedInUserId} = req.body;

  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],        
      }
    : {};
  
  const isUserExists = await searchingUser(keyword);
  const ignoringLoggedInUser = isUserExists.filter((e)=>e["_id"] != loggedInUserId);
  
  if(!isUserExists){
    res.status(400).send({error:"Some error occurs while getting the users"});
    return;
  }
  res.send(ignoringLoggedInUser);
});


export const usersRouter = router;
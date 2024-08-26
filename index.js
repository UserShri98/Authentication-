import express from 'express';
import path from 'path';
import mongoose  from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const app=express();


app.set("view engine" , "ejs");

app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database is connected successfully "))
.catch((e)=>console.log(e))

const UserSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

const User=mongoose.model("User", UserSchema)


const isAuthenticated= async (req,res,next)=>{
    const {token}=req.cookies;
   
    if(token){
     
        const decoded=jwt.verify(token, "hsuhsffehfeheh" )
     
        req.user=await User.findById(decoded._id)
      next()
    }else{
     res.render("login");
    }
}

app.get("/" , isAuthenticated, (req,res)=>{
    res.render("logout",{name:req.user.name})
   })

app.get("/register", (req,res)=>{
    res.render("register")
})

app.post("/login", async (req,res)=>{
    const {email,password}=req.body;
    let user= await User.findOne({email})

    if(!user) return res.redirect("/register");

    const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login", {email,message:"Incorrect password"})
     
       
     const token=jwt.sign({_id:user._id}, "hsuhsffehfeheh")
  

     res.cookie("token" ,token , {
         httpOnly:true,
         expires:new Date(Date.now()+60*1000)
     });
     res.redirect("/")
  

       

})

app.post("/register", async(req,res)=>{
     const {name,email,password}=req.body;


 let user= await User.findOne({email})
   if(user){
    return res.redirect("/login")

   }

   const hashPassword=await bcrypt.hash(password,10);   


   user= await User.create({
        name,
        email,
        password:hashPassword,
     })

     const token=jwt.sign({_id:user._id}, "hsuhsffehfeheh")
  

    res.cookie("token" ,token , {
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/")
})

app.get("/logout", (req,res)=>{
    res.cookie("token" , null, {
        httpOnly:true,
        expires:new Date(Date.now()),
    });
    res.redirect("/")
})

// app.listen(7006, ()=>{
//     console.log("App is listening");
// })

export default app;
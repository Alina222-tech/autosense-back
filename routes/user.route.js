const express=require("express")
const router=express.Router()
const {register,login,forgetpass,resetpass}=require("../controllers/user.controller.js")


router.post("/register",register)
router.post("/login",login)
router.post("/forget", forgetpass);
router.post("/reset/:token",resetpass);


module.exports=router
const express=require("express")

const router=express.Router()

const {addcar,
    allcars,
    onecar,
    deletecar,
getDealers}= require("../controllers/car.controller.js")

    router.post("/add",addcar)
    router.get("/all",allcars)
    router.get("/:id",onecar)
    router.delete("/:id",deletecar)
    router.get("/dealer",getDealers);

    module.exports=router
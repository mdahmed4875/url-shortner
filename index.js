const express=require("express");
const urlRoute=require("./routes/url");
const path=require("path");
const staticRouter=require("./routes/staticRouter");
const URL=require("./models/url");
const cookieParser=require('cookie-parser');
const userRoute=require("./routes/user");
const{connectToMongoDB}=require("./connect");
const {restrictToLoggedinUserOnly}=require('./middlewares/auth');
const app=express();
const port=8000;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use("/user",userRoute);
app.get("/test",async(req,res)=>{
    const allUrls=await URL.find({});
    return res.render("home",{
        urls:allUrls,

    })
})
connectToMongoDB("mongodb://localhost:27017/short-url")
.then(()=>console.log("mongodb is connected"));

app.use("/url",restrictToLoggedinUserOnly,urlRoute);
app.use("/",staticRouter)
app.get("/url/:shortId",async(req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate({
       shortId
    },{$push:{
        visitHistory:{
            timestamp:Date.now(),
        }
    }})
    res.redirect(entry.redirectURL);
});

app.listen(port,()=>console.log(`server started at ${port}`));
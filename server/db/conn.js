const mongoose = require("mongoose");

const DB = "mongodb://127.0.0.1:27017/Entretien"

mongoose.connect(DB,{
    
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=> console.log("Database connected")).catch((errr)=>{
    console.log(errr);
});
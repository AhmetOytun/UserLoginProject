const dotenv = require("dotenv");
dotenv.config({path:"./.env.development"});

const express = require("express");
const app = express();
const db = require("./db/db");
const router = require("./router/router");
const bodyParser = require("express").json;

app.use("/css",express.static("./frontend/css"));// setting css folder
app.use("/js",express.static("./frontend/js"));// setting js folder

app.use(bodyParser());// getting requests as json

app.listen(process.env.SERVER_PORT,()=>{// starting server
    console.log(`Server started at port:${process.env.SERVER_PORT}`);
})

db // mongodb connection
.then(res=>console.log("Successfully connected to mongodb"))
.catch(err=>console.error(err));

app.use(router);// routing

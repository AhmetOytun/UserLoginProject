const jwt = require("jsonwebtoken");

module.exports = function verify(req,res,next){// checking the header for the valid token
    const token = req.header("X-Auth-Token");

    if(!token){
        res.status(401).send("You dont have permission to access this page.");
    }else{
        try {
            decodedToken = jwt.verify(token,`${process.env.JWT_SECRET_STRING}`);
            req.decodedToken=decodedToken;
            next();
        } catch (error) {
            res.status(401).send("Wrong token.");
        }
    }
}

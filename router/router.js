const dotenv = require("dotenv");
dotenv.config({path:"./.env.development"});
const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../auth/auth");
const user = require("../usermodel/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const generator = require('generate-password');

router.post("/register",async (req,res)=>{
    const userRegister = await user.findOne({Username:req.body.Username});

    if(userRegister){// if user already exists
        res.status(409).send("User already exists in database.");
    }else{
        let hashedPassword=await bcrypt.hash(req.body.Password,10);

        const newUser = new user({// create new user
            "Username":req.body.Username,
            "Password":hashedPassword,
            "Name":req.body.Name,
            "Surname":req.body.Surname,
            "Email":req.body.Email,
            "Location":req.body.Location,
            "Age":req.body.Age,
            "Gender":req.body.Gender,
            "ProfilePicture":req.body.ProfilePicture
        });

        await newUser.save()// save new user to the database
        .then(res=>console.log("User has been successfully saved."))
        .catch(err=>console.error(err));

        res.send("Successfully registered.");
    }
});

router.post("/login", async (req,res)=>{
    const userLogin = await user.findOne({Username: req.body.Username});

    const isValid = await bcrypt.compare(req.body.Password,userLogin.Password)

    const token = jwt.sign({_id:userLogin._id}, `${process.env.JWT_SECRET_STRING}`, {
        expiresIn: '1h' // expires in 1 hour
         });
        

    if(!userLogin){// actually user doesn't exist in database
        res.status(404).send("Username or password is not correct");
    }else if(!isValid){
        res.send("Username or password is not correct");// actually password is not correct
    }else{
        res.header("X-Auth-Token", token).send("Successfully logged in");
    }
});

router.get("/userinfo",auth,async (req,res)=>{// get request to get all the info
    const userInfo = await user.findById(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    res.send(userInfo);
});

router.post("/edituserinfo/Name",auth,async (req,res)=>{// post request for changing the Name
    const editUserName = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserName.Name = req.body.newName;

    await editUserName.save()
    .then(res=>console.log("User Name has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserName);
});

router.post("/edituserinfo/Surname",auth,async (req,res)=>{// post request for changing the Surname
    const editUserSurname = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserSurname.Surname = req.body.newSurname;

    await editUserSurname.save()
    .then(res=>console.log("User Surname has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserSurname );
});

router.post("/edituserinfo/Email",auth,async (req,res)=>{// post request for changing the Email
    const editUserEmail = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserEmail.Email = req.body.newEmail;

    await editUserEmail.save()
    .then(res=>console.log("User Email has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserEmail );
});

router.post("/edituserinfo/Location",auth,async (req,res)=>{// post request for changing the location
    const editUserLocation = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserLocation.Location = req.body.newLocation;

    await editUserName.save()
    .then(res=>console.log("User Location has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserLocation);
});

router.post("/edituserinfo/Age",auth,async (req,res)=>{// post request for changing the Age
    const editUserAge = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserAge.Age = req.body.newAge;

    await editUserAge.save()
    .then(res=>console.log("User Age has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserAge);
});

router.post("/edituserinfo/Gender",auth,async (req,res)=>{// post request for changing the Gender
    const editUserGender = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserGender.Gender = req.body.newGender;

    await editUserGender.save()
    .then(res=>console.log("User Gender has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserGender);
});

router.post("/edituserinfo/ProfilePicture",auth,async (req,res)=>{// post request for changing the ProfilePicture
    const editUserProfilePicture = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));

    editUserProfilePicture.ProfilePicture = req.body.ProfilePicture;

    await editUserProfilePicture.save()

    .then(res=>console.log("User ProfilePicture has been successfully changed."))
    .catch(err=>console.error(err));

    res.send(editUserProfilePicture);
});

router.post("/changepassword",auth,async (req,res)=>{// changes password
    const changePassword = await user.findByIdAndUpdate(req.decodedToken._id)
    .catch(err=>res.status(404).send(err));
    
    const isValid = await bcrypt.compare(req.body.Password,changePassword.Password);

    if(isValid){
        let newHashedPassword=await bcrypt.hash(req.body.newPassword,10);

        changePassword.Password = newHashedPassword;

        await changePassword.save();

        res.send("Password has been successfully changed");
    }else{
        res.status(401).send("Passwords should match");
    }
});

router.post("/forgotpassword",auth,async (req,res)=>{// sends mail for authantication
    const forgotPassword = await user.findByIdAndUpdate(req.decodedToken._id)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_MAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const generatedPassword = generator.generate({
    length: 10,
    numbers: true
    });

    const mailOptions = {
        from: process.env.GMAIL_MAIL,
        to: forgotPassword.Email,
        subject: 'Password',
        text: `Your new password is ${generatedPassword}`
    };

    forgotPassword.Password = await bcrypt.hash(generatedPassword,10);

    await forgotPassword.save();

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.send("Mail has been successfully sent.");
});

router.delete("/deleteuser",auth,async (req,res)=>{// deletes user
    const deleteUser = await user.findOneAndDelete(req.decodedToken._id);

    if(!deleteUser){
       res.status(404).send("User doesn't exist on database");
    }else{
        res.send(deleteUser);
    }
});

router.get("/",(req,res)=>{
    res.send("Hello server!");
})


module.exports=router;
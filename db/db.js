const mongoose = require("mongoose");

async function connectToDB(){// connecting to the database
    mongoose.connect(process.env.DB_URI);
}

module.exports=connectToDB();
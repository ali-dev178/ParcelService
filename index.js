const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

// setup express
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));

// setup for mongo db
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (error) => {
    if(error) throw error;
    console.log("MongoDB connection established");
});

// set routes
app.use("/users", require("./routes/userRouter"));
const express = require("express");
const path = require("path");
const app = express();

const GreenInfo = require("./models/greenInfo");

//DEPENDENCIES
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const passport = require("passport");

const port = Number(process.env.PORT) || 3000;

//DATABASE
if(!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. See server/.env.example");
}
mongoose.connect(process.env.MONGODB_URI).catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
});

const db = mongoose.connection;

//AUTHENTICATION & PASSPORT SESSION (PRE-ROUTERS)
app.use(expressSession({
    secret: process.env.SESSION_SECRET_PASSCODE,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//ROUTERS
const apiCompaniesRouter = require("./routes/api_companies");
const tokenApiCompaniesRouter = require("./routes/token_api_companies");
const apiEmployeesRouter = require("./routes/api_employees");
const tokenApiEmployees = require("./routes/token_api_employees");

app.use(cors());
app.use(express.json({
    limit: "50mb"
}));

app.use("/logos", (req, res, next) => {
    res.setHeader("Content-Security-Policy", "sandbox");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
}, express.static(path.join(__dirname, "greenride_cloud_storage/logos")));
app.use("/contents", express.static(path.join(__dirname, "greenride_cloud_storage/contents")));

app.use("/apiCompanies", apiCompaniesRouter);
app.use("/tokenApiCompanies", tokenApiCompaniesRouter);
app.use("/apiEmployees", apiEmployeesRouter);
app.use("/tokenApiEmployees", tokenApiEmployees);

db.once("open", () => {
    console.log("SERVER: MongoDB/Mongoose successfully connected");

    app.listen(port, async () => {
        const greenInfoDoc = await GreenInfo.findOne();
        if(!greenInfoDoc) await GreenInfo.create({});

        console.log(`SERVER: listening on port ${port}`);
    });
});
require("dotenv").config();
var path = require("path");

var middleware = require("./routes/api");
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.EXPRESS_PORT || 3000;

const app = express();
app.use(compression());
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: process.env.NODE_ENV === "production" ? process.env.ORIGIN : "http://localhost:3001",
    })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/build")));

app.use((req, res, next) => {
    console.log("req.originalUrl :>> ", req.originalUrl);
    next();
});

//app.use("/api", middleware);

app.use("*", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.sendFile(path.join(__dirname, "/build/index.html"));
    }
});

app.listen(port, (req, res) => {
    console.info("Express is listening on port", port);
    console.info("#################################");
});

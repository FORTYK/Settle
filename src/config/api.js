import axios from "axios";
require("dotenv").config();

let api = axios.create({
    baseURL: process.env.API,
});

export default api;

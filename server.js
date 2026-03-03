import dotenv from "dotenv";
import express from "express";

dotenv.config("./.env");

const app = express();
const port = process.env.PORT || 8001;

app.listen(PORT => {
    console.log(`App is listening on the port ${port}`)
})
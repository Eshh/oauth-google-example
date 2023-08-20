const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const https = require("https");
const path = require("path");
require("dotenv").config();

const app = express();
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};
app.use(helmet());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true;
  !isLoggedIn ? res.status(401).json({ error: "Please login" }) : next();
}

app.get("/auth/google", (req, res) => {});
app.get("/auth/google/callback", (req, res) => {});
app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Your personal secret value is 42!");
});

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

https
  .createServer(
    { cert: fs.readFileSync("cert.pem"), key: fs.readFileSync("key.pem") },
    app
  )
  .listen(3000, () => console.log("server started"));

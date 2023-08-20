const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const https = require("http");
const path = require("path");

const app = express();
app.use(helmet());

function checkLoggedIn(req, res, next) {
  next();
}

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Your personal secret value is 42!");
});

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

https.createServer(app).listen(3000, () => console.log("server started"));

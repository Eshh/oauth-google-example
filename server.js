const cookieSession = require("cookie-session");
const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const https = require("https");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const path = require("path");
require("dotenv").config();

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};
const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((obj, done) => done(null, obj));

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  done(null, profile);
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = express();

app.use(helmet());

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  !isLoggedIn ? res.status(401).json({ error: "Please login" }) : next();
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    successRedirect: "/",
    session: true,
  }),
  (req, res) => console.log("google called us")
);
app.get("/auth/failure", (req, res) =>
  res.status(401).send("Failed to authorize")
);
app.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

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

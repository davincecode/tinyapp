const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(1);

app.use(morgan("combined"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

/* homepage */
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

/* create a shortURL */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/* generated shortURL page */
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

/* delete added shortURL */
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

/* edit added shortURL */
app.post("/urls/:short_id", (req, res) => {
  const shortID = req.params.short_id;
  console.log("data sent from user", req.body);
  const newLink = req.body.longURL;
  urls[shortID].longURL = newLink;
  res.redirect(`/urls/`);
});

/* login */
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});

const {
  authenticateUser,
  fetchUserInfo,
  createUser,
  generateRandomStr,
} = require("./helpers/userHelper");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

const app = express();

/* Database files */
const { urlDatabase } = require("./data/urlData");
const { users } = require("./data/userData");

/* middleware */
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */

/* homepage */
app.get("/", (req, res) => {
  const userInfo = fetchUserInfo(users, req.cookies.email);
  const templateVars = { email: userInfo.email };

  return res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

/* create new shortURL */
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

/* generated shortURL page */
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

/* redirect shortURL to longURL */
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomStr();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

/* delete added shortURL */
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

/* edit added shortURL */
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

/* update URL */
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.newURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

/* register get */
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("register", templateVars);
});

/* register post */
app.post("/register", (req, res) => {
  const { error, data } = createUser(users, req.body);

  if (error) {
    console.log(error);
    res.redirect("/register");
  }

  res.cookie("email", data.email);

  res.redirect("/urls");
});

/* login page */
app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("login", templateVars);
});

/* login auth */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const { error, data } = authenticateUser(users, email, password);

  if (error) {
    console.log(error);
    return res.redirect("/login");
  }

  res.cookie("email", email);
  res.redirect(`/urls`);
});

/* Logout */
app.post("/logout", (req, res) => {
  // const templateVars = {
  //   username: req.cookies["username"],
  // };
  res.clearCookie("email");
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});

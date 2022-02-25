const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/* Database */
const { users } = require("./data/userData");
const { urlDatabase } = require("./data/urlData");

/* Functions */
const {
  getUserByEmail,
  fetchUserUrl,
  generateRandomStr,
} = require("./helpers/userHelper");

/* Middleware */
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
app.use(cookieSession({ name: "session", secret: "secret-password-session" }));

/* Routes */

/* Homepage */
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/* Main index page for auth user */
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.status(403).send("please LOG-IN or REGISTER to use TinyApp!");
    return;
  }

  const user = users[userID];
  if (!user) {
    res.status(403).send("please LOG-IN or REGISTER to use TinyApp!");
    return;
  }

  let urls = fetchUserUrl(userID, urlDatabase);
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});

/* Create new shortURL page */
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.status(403).send("please LOG-IN or REGISTER to use TinyApp!");
    return;
  }

  const user = users[userID];
  if (!user) {
    res.redirect(`/login`);
    return;
  }

  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

/* Generate shortURL page for auth users */
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.status(403).send("please LOG-IN or REGISTER to use TinyApp!");
    return;
  }

  const user = users[userID];
  if (!user) {
    res.send("please LOG-IN or REGISTER to use TinyApp!");
    return;
  }

  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[shortURL];
  if (!urlRecord) {
    res.send("this short URL does not exist!");
    return;
  }

  if (urlRecord.userID !== userID) {
    res.send("this URL does not belong to you!");
    return;
  }

  const longURL = urlRecord.longURL;
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

/* Redirect shortURL to longURL */
app.get("/u/:shortURL", (req, res) => {
  const urlRecord = urlDatabase[req.params.shortURL];
  if (!urlRecord) {
    res.send("this short URL does not exist");
    return;
  }

  res.redirect(urlRecord.longURL);
});

app.post("/urls", (req, res) => {
  let { longURL } = req.body;

  if (!longURL.startsWith("http")) {
    longURL = `http://${longURL}`;
  }

  const userID = req.session.user_id;
  const genShortURL = generateRandomStr();
  urlDatabase[genShortURL] = { longURL, userID };
  res.redirect(`/urls/${genShortURL}`);
});

/* Delete added shortURL for auth user */
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const { shortURL } = req.params;
  if (userID !== urlDatabase[shortURL].userID) {
    res.sendStatus(404);
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

/* Edit added shortURL */
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  let { longURL } = req.body;
  const { shortURL } = req.params;

  if (userID !== urlDatabase[shortURL].userID) {
    res.status(404).send("You do not have permission to edit this link");
    return;
  }
  if (!longURL.startsWith("http")) {
    longURL = `http://${longURL}`;
  }

  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});

/* Register get */
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const templateVars = {
      user: null,
    };
    res.render("register", templateVars);
    return;
  }

  res.redirect("/urls");
});

/* Register post */
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email === "" || password === "") {
    res.status(400).send("please check your email or password");
    return;
  }

  if (!getUserByEmail(users, email)) {
    const userID = generateRandomStr();
    req.session.user_id = userID;
    users[userID] = { userID, email, password };
    res.redirect(`/urls`);
    return;
  }

  res.send("this email already exists!");
  return;
});

/* Login page */
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const templateVars = {
      user: null,
    };
    res.render("login", templateVars);
    return;
  }

  res.redirect("/urls");
});

/* Login auth */
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(403).send("wrong credentials");
    return;
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    res.status(403).send("invalid credentials");
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("invalid credentials");
    return;
  }

  req.session.user_id = user.userID;
  res.redirect(`/urls`);
});

/* Logout */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

/* database */
const { users, urlDatabase } = require("./data/userDatabase");

/* funcitons */
const {
  fetchUserInfo,
  fetchUserUrl,
  generateRandomStr,
} = require("./helpers/userHelper");

/* middleware */
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
app.use(cookieSession({ name: "session", secret: "secret-password-session" }));
app.set("view engine", "ejs");

/* Routes */

/* homepage */
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/* url main index page for auth user */
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

/* create new shortURL page */
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send(
        "You must provide an email and a password to register for an account."
      );
  }
  if (fetchUserInfo(email, users)) {
    return res
      .status(400)
      .send("An account has already been created with this email address.");
  }
  const userID = `u_${generateRandomStr()}`;
  const user = {
    userID,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  users[userID] = user;
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

// /* login page */
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

/* login auth */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).send("wrong credentials");
    return;
  }

  const user = fetchUserInfo(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
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

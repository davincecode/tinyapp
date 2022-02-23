const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

const app = express();

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomStr = () => (Math.random() + 1).toString(36).substring(7);

/* middleware */
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */

/* homepage */
const fetchUserInfo = (userDB, email) => {
  let userInfo = undefined;

  if (userDB[email]) {
    userInfo = userDB[email];
  } else {
    userInfo = {};
  }
};

const authenticateUser = (userDB, email, password) => {
  if (!userDB[email]) {
    return { error: "bad email", data: null };
  }

  if (userDB[email].password !== password) {
    return { error: "bad password", data: null };
  }

  return { error: null, data: userDB[email] };
};

app.get("/", (req, res) => {
  const userInfo = fetchUserInfo(users, req.cookies.email);
  const templateVars = { username: username };
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

const createUser = (userDB, userInfo) => {
  const { email, password } = userInfo;

  if (!email || !password) {
    return { error: "One of the fields is invalid", data: null };
  }

  if (users[email]) {
    return { error: "account already exist", data: null };
  }
  const newUser = { email, password };
  userDB[email] = newUser;

  return { error: null, data: newUser };
};

/* register post */
app.post("/register", (req, res) => {
  const { error, data } = createUser(users, req.body);

  if (error) {
    console.log(error);
    return res.redirect("/register");
  }
  res.cookie("email", email);

  return res.redirect("/urls");
});

/* Login */
app.post("/login", (req, res) => {
  // const username = req.body.username;
  const { email, password } = req.body;

  const { error, data } = authenticateUser(users, email, password);

  if (!users[email]) {
    console.log("bad email");
    return res.redirect("/");

    if (users[email].password === password) {
      console.log("bad password");
      return res.redirect("/");
    }
    return res.redirect("/");
  }

  res.cookie("username", username);
  res.redirect(`/urls`);
});

/* Logout */
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});

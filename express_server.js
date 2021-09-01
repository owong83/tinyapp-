const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function emailTaken(userSubmittedEmail) {
  for (user in users) {
    if (users[user].email === userSubmittedEmail) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let userURL = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURL[url] = urlDatabase[url];
    }
  }
  return userURL;
}

// root path send "Hello"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// urlDatabase in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// hello path send "Hello World"
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// urls path to render urls_index
app.get("/urls", (req, res) => {
  const userID = req.cookies["user"];
  const urls = urlsForUser(userID);

  const templateVars = {
    urls,
    user: users[req.cookies["user"]],
  };
  res.render("urls_index", templateVars);
});

// render NEW URL form
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user"]] };
  res.render("urls_new", templateVars);
});

// POST NEW form on urls path
app.post("/urls", (req, res) => {
  const shortURL = req.params.shortURL;
  const userSubmittedLongURL = req.body.longURL;
  const generatedShortURL = generateRandomString();
  urlDatabase[generatedShortURL] = userSubmittedLongURL;
  res.redirect(`/urls/${generatedShortURL}`);
});

// shortURL site
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[req.cookies["user"]] };
  res.render("urls_show", templateVars);
});

//
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// added DELETE function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user"]) {
    console.log(req.cookies["user"]);
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

// added EDIT function
app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies["user"]) {
    console.log(req.cookies["user"]);
    const shortURL = req.params.shortURL;
    const userSubmittedLongURL = req.body.longURL;
    urlDatabase[shortURL] = userSubmittedLongURL;
  }
  res.redirect("/urls");
});

// added logout function
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
});

// track with cookies
app.post("/login", (req, res) => {
  if (!emailTaken(req.body.email)) {
    res.send(403);
  } else {
    for (user in users) {
      const currentEmail = users[user].email;
      if (users[user].email === req.body.email) {
        if (users[user].password !== req.body.password) {
          res.send(403);
        } else {
          res.cookie("user", user);
          res.redirect("/urls");
        }
      }
    }
  }
});

// GET registration
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]],
  };
  res.render("urls_register", templateVars);
});

// POST registration
app.post("/register", (req, res) => {
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
  };
  if (req.body.email === "" || req.body.password === "") {
    res.send(400);
  } else if (emailTaken(req.body.email)) {
    res.send(400);
  } else {
    users[user.id] = user;
    res.cookie("user", user.id);
    res.redirect("/urls");
  }
});

// GET login paths
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user"]],
  };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

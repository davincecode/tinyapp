const authenticateUser = (userDB, email, password) => {
  if (!userDB[email]) {
    return { error: "bad email", data: null };
  }

  if (userDB[email].password !== password) {
    return { error: "bad password", data: null };
  }

  return { error: null, data: userDB[email] };
};

const fetchUserInfo = (userDB, email) => {
  let userInfo = undefined;
  if (userDB[email]) {
    userInfo = userDB[email];
  } else {
    userInfo = {};
  }
};

const createUser = (id, database) => {
  let userUrls = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }

  return userUrls;
};

const generateRandomStr = () => (Math.random() + 1).toString(36).substring(7);

module.exports = {
  authenticateUser,
  fetchUserInfo,
  createUser,
  generateRandomStr,
};

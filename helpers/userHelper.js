/* Fetch user by email */
const fetchUserInfo = (email, database) => {
  let user = {};

  for (let key in database) {
    if (database[key].email === email) {
      user = database[key];
      return user;
    }
  }

  return null;
};

/* Returns user's urls */
const fetchUserUrl = (userID, urlDatabase) => {
  let userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userUrls[key] = urlDatabase[key];
    }
  }

  return userUrls;
};

const generateRandomStr = () => (Math.random() + 1).toString(36).substring(7);

module.exports = {
  fetchUserInfo,
  fetchUserUrl,
  generateRandomStr,
};

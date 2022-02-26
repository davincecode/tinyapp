/* Fetch user by email */
const fetchUserInfo = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].userID;
    }
  }
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

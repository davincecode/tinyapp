/* fetch emails from user */
const fetchUserInfo = (email, database) => {
  console.log("credentials", email, database);
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].userID;
    }
  }
};

/* user urls */
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

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

const createUser = (userDB, userInfo) => {
  const { email, password } = userInfo;

  if (!email || !password) {
    return { error: "One of the fields is invalid", data: null };
  }

  if (userDB[email]) {
    return { error: "account already exist", data: null };
  }

  const newUser = { email, password };
  userDB[email] = newUser;
  console.log(newUser);
  return { error: null, data: newUser };
};

const generateRandomStr = () => (Math.random() + 1).toString(36).substring(7);

module.exports = {
  authenticateUser,
  fetchUserInfo,
  createUser,
  generateRandomStr,
};

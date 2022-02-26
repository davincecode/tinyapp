const { assert } = require("chai");

const { fetchUserInfo } = require("../helpers/userHelper");

const testUsers = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.sorihan.com", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  a2f747: { longURL: "https://www.enze.com", userID: "userRandomID" },
  "3f0037": { longURL: "https://www.yahoo.ca", userID: "userRandomID" },
};

describe("fetchUserInfo", function () {
  it("should return a user with valid email", function () {
    const user = fetchUserInfo("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it("should return a undefined with an invalid email", () => {
    const user = fetchUserInfo(testUsers, "cooluser@example.com").id;
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

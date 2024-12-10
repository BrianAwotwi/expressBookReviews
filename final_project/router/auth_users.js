const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require("express-session");

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  console.log("Login route accessed");
  console.log("Request body:", req.body);

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });

    req.session.authorization = { accessToken, username };
    console.log("User successfully logged in:", username);
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.body.review;
  const isbn = req.params.isbn;
  const username = req.body.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!Array.isArray(books[isbn].reviews)) {
    books[isbn].reviews = [];
  }

  const existingReview = books[isbn].reviews.find(
    (r) => r.username === username
  );

  if (existingReview) {
    existingReview.text = review;
    return res.status(200).json({
      message: "Review updated successfully",
      reviews: books[isbn].reviews,
    });
  }

  books[isbn].reviews.push({ username, text: review });

  return res.status(200).json({
    message: "Review added successfully",
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.body.username; // Assuming username is sent in the request body
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!Array.isArray(books[isbn].reviews)) {
    return res.status(404).json({ message: "No reviews to delete" });
  }

  const reviewIndex = books[isbn].reviews.findIndex(
    (review) => review.username === username
  );

  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  books[isbn].reviews.splice(reviewIndex, 1);

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      console.log(users);
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Fetch all books without Axios
public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});

// Fetch all books with Axios
public_users.get("/axios/books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching books via Axios:", error.message);
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Fetch book by ISBN without Axios
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Fetch book by ISBN with Axios
public_users.get("/axios/isbn/:isbn", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/api/books");
    const books = response.data;
    const isbn = req.params.isbn;

    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error("Error fetching book by ISBN via Axios:", error.message);
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});

// Fetch books by author withour Axios
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let result = [];

  for (let id in books) {
    if (books[id].author === author) {
      result.push(books[id]);
    }
  }

  if (result.length > 0) {
    res.send(result);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Fetch book by author with Axios
public_users.get("/axios/author/:author", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    const books = response.data;
    const author = req.params.author;

    const matchingBooks = [];

    for (let id in books) {
      if (books[id].author === author) {
        matchingBooks.push(books[id]);
      }
    }

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    console.error("Error fetching books by author via Axios:", error.message);
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let result = [];

  for (let id in books) {
    if (books[id].title === title) {
      result.push(books[id]);
    }
  }

  if (result.length > 0) {
    res.send(result);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// Fetch book by title with Axios
public_users.get("/axios/title/:title", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    const books = response.data;
    const title = req.params.title;

    const matchingBooks = [];

    for (let id in books) {
      if (books[id].title === title) {
        matchingBooks.push(books[id]);
      }
    }

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res
        .status(404)
        .json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error("Error fetching books by title via Axios:", error.message);
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;

const express = require("express");

const server = express();

const userdb = require("./data/helpers/userDb.js"); // Common JS
const postdb = require("./data/helpers/postDb.js");

// important middleware
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

// Middleware
// This is what we need to parse our data!
server.use(express.json());
// cors for use with react
server.use(cors());
// morgan for logging - short for less info?
server.use(morgan("short"));
// helmet for basic security
server.use(helmet());

server.get("/", (req, res) => {
  res.send(`sanity check! hey jonathan`);
});

// get all users
server.get("/api/users", (req, res) => {
  userdb
    .get()
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("Hey, we are having some issue getting those users");
    });
});

//get specific user
server.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  userdb
    .get(id)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("Hey, we are having some issue getting those users");
    });
});

// add in new user
server.post("/api/users", upperCase, (req, res) => {
  const { name } = req.body;
  // same as const name = req.body.name;
  // first, check if client is sending in an object with a username

  if (!name || name.length > 128) {
    res.status(404).json("Put in a name, buddy!");
  } else {
    userdb
      .insert({
        name
      })
      .then(user => {
        res.status(200).send(user);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json("Hey, a little issue getting that user in!");
      });
  }
});

// delete a user
server.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  userdb.get(id).then(user => {
    if (user) {
      userdb
        .remove(id)
        .then(count =>
          res.status(200).json({ count, message: "Great job, its removed!" })
        );
    } else {
      res.status(404).json({ message: "The user does not exist!" });
    }
  });
});

server.put("/api/users/:id", upperCase, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.length > 128) {
    res
      .status(404)
      .json("Put in a name, buddy! And make sure its under 128 characters!");
  }
  userdb.get(id).then(user => {
    if (user) {
      userdb
        .update(id, req.body)
        .then(response =>
          res
            .status(200)
            .json({ response, message: "yo, i think we good son!" })
        )
        .catch(err => res.status(500).json(err));
    } else {
      res
        .status(404)
        .json({ message: "The user with the specified ID does not exist." });
    }
  });
});

function upperCase(req, res, next) {
  const { name } = req.body;

  if (name) {
    req.body.name = name.toUpperCase();
    next();
  } else {
    res.status(500).json("yo yo yo, send in a legit name to uppercase.");
  }
}

module.exports = server;

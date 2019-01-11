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

/////========= User Endpoints ==============//////

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
    res
      .status(404)
      .json("Put in a name, buddy! And its got to be shorter than 128 chars!");
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

// get user's posts
server.get("/api/users/:id/posts", (req, res) => {
  const { id } = req.params;
  userdb
    .getUserPosts(id)
    .then(userposts => {
      res.status(200).send(userposts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("Hey, we are having some issue getting those users");
    });
});

/////========= Post Endpoints ==============//////

// get all posts
server.get("/api/posts", (req, res) => {
  postdb
    .get()
    .then(posts => {
      res.status(200).send(posts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("Hey, we are having some issue getting those users");
    });
});

//get specific post
server.get("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  postdb
    .get(id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("Hey, we are having some issue getting that post");
    });
});

// post a new post
server.post("/api/posts", (req, res) => {
  const { userId, text } = req.body;

  // first, check if client is sending in an object with a username
  if (!userId || !text) {
    res
      .status(404)
      .json(
        "Please put in a valid user id and/or put in some text for the post!"
      );
  } else {
    // i hate my lifeeeeee
    userdb
      .get(userId)

      .then(user => {
        if (user) {
          postdb
            .insert({
              userId,
              text
            })
            .then(user => {
              res.status(200).send(user);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json("Hey, a little issue getting that user in!");
            });
        } else {
          res.status(451).json({
            message: "The user with the specified ID does not exist."
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json("Sorry man, that user does not seem to exist!");
      });
  }
});

// delete a post (this should prove to be easy - FAMOUS LAST WORDS)

server.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postdb.get(id);

    if (post) {
      let count = await postdb.remove(id); // wow, that's cool. inadvertently, we remove the post to get that count value
      console.log(post);
      res.status(200).json({ count, message: "Great job, its removed!" });
    } else {
      res.status(404).json("Sorry man, that post does not exist!");
    }
  } catch {
    res.status(500).json("for some reason, everything goes to this catch.");
  }
});

// modify a particular post
server.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text) {
    res.status(404).json("Put in a valid id! And or some text!");
  }
  postdb.get(id).then(post => {
    if (post) {
      postdb
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

/////========== Middleware for uppercasing name ============/////
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

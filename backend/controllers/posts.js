// Importe le fichier de config de la connexion à la bdd
const dbConfig = require("../config/db");
const db = dbConfig.getDB();

// gestion des fichiers
const fs = require("fs");

// const { promisify } = require("util");
// const pipeline = promisify(require("stream").pipeline);
// const { uploadErrors } = require("../utils/errors.utils");

// ajout d'un post
exports.createPost = (req, res, next) => {
  // si aucune image n'a été fournie par l'utilisateur, le post ne comporte pas d'image, on anoute donc un champs null
  let pictureUrl = null;
  if (req.file != null) {
    pictureUrl = req.file.filename;
  }
  let body = { ...req.body, picture: pictureUrl, createdDate: new Date() };
  const reqCreatePostSql = "INSERT INTO posts SET ?";
  db.query(reqCreatePostSql, [body], (err, result) => {
    if (!result) {
      res.status(404).json({ err });
      throw err;
    } else {
      res.status(201).json(result);
    }
  });
};

// lecture de tout les posts
exports.getAllPosts = (req, res, next) => {
  const reqGetAllSql = "SELECT * FROM posts ORDER BY createdDate DESC";
  db.query(reqGetAllSql, (err, result) => {
    if (!result || result.length === 0) {
      res.status(200).json({ err, message: "Aucun post disponible" });
    } else {
      res.status(201).json(result);
    }
  });
};

// lecture d'un post en particulier
exports.getOnePost = (req, res, next) => {
  const reqGetOneSql = `SELECT * FROM posts WHERE id = ${req.params.id} ORDER BY createdDate DESC`;
  db.query(reqGetOneSql, (err, result) => {
    if (!result || result.length === 0) {
      res.status(200).json({ err, message: "Post inexistant" });
    } else {
      res.status(201).json(result);
    }
  });
};

// modification d'un post existant
exports.updatePost = (req, res, next) => {
  console.log(req.body);
  const reqUpdateSql = `UPDATE posts SET description = "${req.body.description}" WHERE id = ${req.params.id}`;
  db.query(reqUpdateSql, (err, result) => {
    if (!result) {
      res.status(200).json({ err });
    } else {
      res.status(201).json(result);
    }
  });
};

// suppression d'un post existant
exports.deletePost = (req, res, next) => {
  const reqGetPostSql = `SELECT * FROM posts WHERE id = "${req.params.id}"`;
  db.query(reqGetPostSql, (err, result) => {
    if (!result) {
      res.status(200).json({ err });
    } else {
      // supprime la potentielle image des fichiers
      console.log(result[0].picture);
      if (result[0].picture != null) {
        fs.unlink(`../frontend/src/assets/posts/${result[0].picture}`, () => {
          if (err) console.log(err); 
          // supprime le post de la bdd
          const reqSql = `DELETE FROM posts WHERE id = "${req.params.id}"`;
          db.query(reqSql, (err, result) => {
            if (!result) {
              res.status(200).json({ err });
            } else {
              res.status(201).json(result);
            }
          }); 
        });
      }
    }
  });
};

exports.getPostLikes = (req, res, next) => {
  // Récupère la liste des likes associé au post en question
  const reqGetLikesSql = `SELECT * FROM likes WHERE postId = ${req.params.postId}`;
  db.query(reqGetLikesSql, (err, result) => {
    if (!result) {
      res.status(200).json({ err });
    } else {
      res.status(200).json(result);
    }
  });
};

// like ou unlike d'un post existant
exports.likeUnlikePost = (req, res, next) => {
  console.log(req.body.likerId);
  // Récupère la liste des likes associé au post en question
  const reqGetLikesSql = `SELECT * FROM likes WHERE postId = ${req.params.postId} AND userId = ${req.body.userId}`;
  db.query(reqGetLikesSql, (err, result) => {
    console.log(result);
    if (result.length != 0) {
      // Dans ce cas, le post a déjà été liké. On va donc entreprendre le unlike
      console.log("le post a déjà été liké");
      const reqUnlikeSql = `DELETE FROM likes WHERE postId = ${req.params.postId} AND userId = ${req.body.userId}`;
      db.query(reqUnlikeSql, (err, result) => {
        if (!result) {
          res.status(200).json({ err });
        } else {
          res.status(200).json(result);
        }
      });
    } else {
      // Dans ce cas, le post n'a pas déjà été liké. On va donc entreprendre le like
      console.log("le post n'a pas déjà été liké");
      const reqLikeSql = `INSERT INTO likes (postId, userId) VALUES (${req.params.postId}, ${req.body.userId})`;
      db.query(reqLikeSql, (err, result) => {
        if (!result) {
          res.status(200).json({ err });
        } else {
          res.status(200).json(result);
        }
      });
    }
  });
};

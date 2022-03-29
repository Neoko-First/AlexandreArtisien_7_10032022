const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// bibliothèque permettant ici de valider la strcuture du l'email
const validator = require("validator");

// Importe le fichier de config de la connexion à la bdd
const dbConfig = require("../config/db");

// Appel de .env pour utiliser les variables d'environnement (npm install dotenv --save)
require("dotenv").config();

// controlleur d'inscription d'un utilisateur
exports.signup = async (req, res, next) => {
  try {
    // verrifie la structure de l'email
    if (validator.isEmail(req.body.email)) {
      const { password: password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const user = {
        ...req.body,
        password: encryptedPassword,
        active: 1,
        picture: "random-user.png",
        super: 0,
      };

      const sql = "INSERT INTO user SET ?";
      const db = dbConfig.getDB();
      db.query(sql, [user], (err, result) => {
        if (!result) {
          res.status(200).json({
            errors: {
              email: "Email déjà utilisé",
              password: "",
            },
          });
        } else {
          res.status(201).json({ message: "Inscription réussie !" });
        }
      });
    } else {
      res.status(200).json({
        errors: {
          email: "Veuillez entrer un email valide.",
          password: "",
        },
      });
    }
  } catch (err) {
    res.status(200).json({
      errors: {
        email: "",
        password: "Echec de l'inscription",
      },
    });
  }
};

// controlleur de connexion d'un utilisateur
exports.login = async (req, res, next) => {
  try {
    // récupère les infos envoyées par le back
    const { email, password: clearPassword } = req.body;
    // recherche l'adresse mail dans la BDD
    const reqSql = `SELECT * FROM user WHERE email = ?`;
    const db = dbConfig.getDB();
    db.query(reqSql, [email], async (err, result) => {
      if (err) {
        res.status(404).json({ err });
      }
      // Si la BDD répond positivement
      if (result[0]) {
        // récupère la réponse de la BDD
        const { id: id, password: hashedPassword } = result[0];

        // compare le mot de passe entré et le mot de passe présent dans la ligne (hashé)
        const match = await bcrypt.compare(clearPassword, hashedPassword);

        if (match) {
          // Age maximum du token/cookie
          const maxAge = 3 * 24 * 60 * 60 * 1000;
          // fonction pour crée un token
          const createToken = (id) => {
            return jwt.sign({ id }, process.env.TOKEN_SECRET, {
              expiresIn: maxAge,
            });
          };

          // création du token
          const token = createToken(id);

          // mise en place du cookie
          res.cookie("jwt", token, {
            // sécurité du cookie (consultable uniquement par notre serveur)
            httpOnly: true,
            maxAge: maxAge,
          });
          // renvoi l'id en console (à retirer en prod)
          res.status(200).json({ user: result[0].id });
        }
        // si la connexion echoue :
      } else if (!result[0]) {
        // on renvoie un statut 200 MAIS contenant un objet error qui permet d'afficher les erreurs dans le front
        res.status(200).json({
          errors: {
            email: "Email inconnu",
            password: "",
          },
        });
      }
    });
  } catch (err) {
    res.status(200).json({
      errors: {
        email: "",
        password: "Echec de la connexion",
      },
    });
  }
};

// controlleur de déconnexion d'un utilisateur
exports.logout = async (req, res, next) => {
  // crée un cookie vide qui se supprime instantanément
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

// controller de recup de tout les users
exports.getAllUsers = async (req, res, next) => {
  const reqSql =
    "SELECT id, first_name, last_name, active, picture, bio, super FROM user";
  const db = dbConfig.getDB();
  db.query(reqSql, async (err, result) => {
    if (err) {
      res.status(404).json({ err });
      throw err;
    }
    res.status(201).json(result);
  });
};

// controller de recup d'un user
exports.getOneUser = async (req, res, next) => {
  const reqSql =
    "SELECT id, first_name, last_name, active, picture, bio, super FROM user WHERE id = ?";
  const db = dbConfig.getDB();
  db.query(reqSql, [req.params.id], async (err, result) => {
    if (err) {
      res.status(404).json({ err });
      throw err;
    }
    // si aucun user ne correspond à l'id demandé
    if (result.length === 0) {
      res.status(404).json({ err: "Utilisateur inconnu." });
      throw err;
    }
    res.status(201).json(result[0]);
  });
};

// controller de modification d'un user
exports.updateUser = async (req, res, next) => {
  // Verrifie si l'utilisateur demandé existe
  const reqVerrifSql =
    "SELECT id, first_name, last_name, active, picture, bio, super FROM user WHERE id = ?";
  const db = dbConfig.getDB();
  db.query(reqVerrifSql, [req.params.id], async (err, result) => {
    if (err) {
      res.status(404).json({ err });
      throw err;
    }
    // si aucun user ne correspond à l'id demandé
    if (result.length === 0) {
      res.status(404).json({ err: "Utilisateur inconnu." });
      throw err;
    }
  });

  // Si la modification de la bio est demandée
  if (req.body.newBio) {
    const newBio = req.body.newBio;
    const reqUpdateBioSql = `UPDATE user SET bio = "${newBio}" WHERE id = ${req.params.id};`;
    db.query(reqUpdateBioSql, async (err, result) => {
      if (err) {
        res.status(404).json({ err });
        throw err;
      }
      if (result) {
        res.status(200).json(result);
      }
      // res.status(201).json({ message: "Modification effectuée" });
    });
  }

  // Si la modification du prenom et du nom est demandée
  if (req.body.newFirstname && req.body.newLastname) {
    const { newFirstname, newLastname } = req.body;
    const reqUpdateNameSql = `UPDATE user SET first_name = "${newFirstname}", last_name = "${newLastname}" WHERE id = ${req.params.id};`;
    db.query(reqUpdateNameSql, async (err, result) => {
      if (err) {
        res.status(404).json({ err });
        throw err;
      }
      if (result) {
        res.status(200).json(result);
      }
      // res.status(201).json({ message: "Modification effectuée" });
    });
  }
};

// controller de désactivation d'un user
exports.disableUser = async (req, res, next) => {
  const reqDisableUserSql = `UPDATE user SET active = 0 WHERE id = ${req.params.id};`;
  const db = dbConfig.getDB();
  db.query(reqDisableUserSql, async (err, result) => {
    if (err) {
      res.status(404).json({ err });
      throw err;
    }
    if (result) {
      res.status(200).json(result);
    }
  });
};

// importe le module multer une fois installé (npm install --save multer)
const multer = require("multer");

// dictionnaire de type MIME
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// configuration, qui contient la logique nécessaire pour indiquer à multer où enregistrer les fichiers entrants
const storage = multer.diskStorage({
  // indique à multer d'enregistrer les fichiers dans le dossier images
  destination: (req, file, callback) => {
    if (file.fieldname === "post_image") { 
      callback(null, "../frontend/src/assets/posts");
    } else if (file.fieldname === "profil_image") {
      callback(null, "../frontend/src/assets/profil");
    }
  },
  // indique à multer d'utiliser le nom d'origine, de remplacer les espaces par des underscores et d'ajouter un timestamp Date.now() comme nom de fichier
  filename: (req, file, callback) => {
    // En fonction de la provenance de l'image (de profil ou de post), les traitements ne vont pas être les mêmes
    // if (file.fieldname === "post_image") {
    //   const extension = MIME_TYPES[file.mimetype];
    //   callback(null, Date.now() + "." + extension);
    // } else if (file.fieldname === "profil_image") {
    //   console.log(req.body.name);
    //   // utilisation ensuite de la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée
    //   const extension = MIME_TYPES[file.mimetype];
    //   // pocède à l'enregistrement
    //   callback(null, req.body.name + "." + extension);
    // }

    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);

    // En fonction de la provenance de l'image (de profil ou de post), les traitements ne vont pas être les mêmes
    // if (file.fieldname === "post_image") {
    //   // utilisation ensuite de la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée
    //   const extension = MIME_TYPES[file.mimetype];
    //   // pocède à l'enregistrement
    //   callback(null, Date.now() + "." + extension);

    //   console.log(extension);
    // } else if (file.fieldname === "profil_image") {
    //   // utilisation ensuite de la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée
    //   const extension = MIME_TYPES[file.mimetype];
    //   console.log(extension);
    //   // pocède à l'enregistrement
    //   callback(null, req.body.name.split(" ").join('_') + "." + extension);

    // }
  },
});

const upload = multer({ storage: storage });

// exporte multer une fois configuré. Lui indique que nous génerons uniquement les téléchargements de fichiers image
module.exports = upload;

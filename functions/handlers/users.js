const { admin, db } = require("../util/admin");

const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails
} = require("../util/validators");

exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    profession: request.body.profession
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return response.status(400).json(errors);

  const noImg = "no-image.png";

  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return response.status(400).json({ email: "this email in use" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profession: newUser.profession,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
        }/o/${noImg}?alt=media`
      };
      return db.doc(`/users/${userId}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email is already in use" });
      } else {
        return response
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.login = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return response.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return response.json({ token });
    })
    .catch(err => {
      console.error(err);
      return response
        .status(403)
        .json({ general: "Wrong credentials, please try again " });
    });
};

exports.addUserDetails = (request, response) => {
  let userDetails = reduceUserDetails(request.body);

  db.doc(`/users/${request.user.userId}`)
    .update(userDetails)
    .then(() => {
      return response.json({ message: "Details added successfully" });
    })
    .catch(err => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.getAuthenticatedUser = (request, response) => {
  let userData = {};
  db.doc(`/users/${request.user.userId}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return response.json(userData);
      }
    })
    .catch(err => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.uploadImage = (request, response) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: request.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return response.status(400).json({ error: "Wrong file type submited" });
    }

    const imageExtension = filename.split(".").pop();
    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket(`${config.storageBucket}`)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
        }/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${request.user.userId}`).update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: "Image uploaded successfully" });
      })
      .catch(err => {
        console.error(err);
        return response.status(500).json({ error: err.code });
      });
  });
  busboy.end(request.rawBody);
};

exports.getObservers = (request, response) => {
  db.collection("users")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let observers = [];
      data.forEach(doc => {
        if (request.user.userId !== doc.id) {
          observers.push({
            userId: doc.id,
            ...doc.data()
          });
        }
      });

      return response.json(observers);
    })
    .catch(err => console.error(err));
};

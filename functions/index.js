const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { db } = require("./util/admin");

const {
  getAllProjects,
  postOneProject,
  getProject,
  commentOnDiagram,
  deleteProject,
  diagramProject,
  editProjectDetails,
  deleteDiagram,
  saveDiagram,
  getDiagram
} = require("./handlers/projects");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getObservers,
  signupWithGoogle,
  passwordReset,
  markNotificationsRead
} = require("./handlers/users");

//Project routes
app.get("/projects", FBAuth, getAllProjects);
app.post("/project", FBAuth, postOneProject);
app.get("/project/:projectId", FBAuth, getProject);
app.post(
  "/project/:projectId/diagram/:diagramId/comment",
  FBAuth,
  commentOnDiagram
);
app.delete("/project/:projectId", FBAuth, deleteProject);
app.post("/project/:projectId/diagram", FBAuth, diagramProject);
app.post("/project/edit", FBAuth, editProjectDetails);
app.delete("/project/:projectId/diagram/:diagramId", FBAuth, deleteDiagram);
app.post("/project/:projectId/diagram/:diagramId", FBAuth, saveDiagram);
app.get("/diagram/:diagramId", FBAuth, getDiagram);

//Users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/observers", FBAuth, getObservers);
app.post("/signup/google", signupWithGoogle);
app.post("/passwordReset", passwordReset);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

//trigger to create notification when to create a comment
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/diagrams/${snapshot.data().diagramId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().diagramUserId !== snapshot.data().userId) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().diagramUserId,
            sender: snapshot.data().firstNameUser,
            type: "comment",
            read: false,
            diagramId: doc.id,
            projectId: snapshot.data().projectId
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

//trigger to create notification when to create a new project
exports.createNotificationOnProject = functions.firestore
  .document("projects/{id}")
  .onCreate(snapshot => {
    db.doc(`/projects/${snapshot.id}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().observers.length > 0) {
          doc.data().observers.forEach(observer => {
            return db.collection("notifications").add({
              createdAt: new Date().toISOString(),
              recipient: observer,
              sender: snapshot.data().firstNameUser,
              type: "observer",
              read: false,
              projectId: doc.id
            });
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

//trigger to change the userImage in all projects
exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has change");
      const batch = db.batch();
      return db
        .collection("projects")
        .where("userId", "==", change.before.data().userId)
        .get()
        .then(data => {
          data.forEach(doc => {
            const project = db.doc(`/projects/${doc.id}`);
            batch.update(project, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

//trigger to delete all information asociate with one project
exports.onProjectDelete = functions.firestore
  .document("/projects/{projectId}")
  .onDelete((snapshot, context) => {
    const projectId = context.params.projectId;
    const batch = db.batch();
    return db
      .collection("diagrams")
      .where("projectId", "==", projectId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/diagrams/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => {
        console.error(err);
      });
  });

//trigger to delete all information asociate with one diagram
exports.onDiagramDelete = functions.firestore
  .document("/diagrams/{diagramId}")
  .onDelete((snapshot, context) => {
    const diagramId = context.params.diagramId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("diagramId", "==", diagramId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => {
        console.error(err);
      });
  });

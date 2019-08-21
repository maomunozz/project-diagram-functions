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
  signupWithGoogle
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

exports.api = functions.https.onRequest(app);

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

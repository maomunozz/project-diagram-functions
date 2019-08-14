const { db } = require("../util/admin");
const {
  validateCreateProject,
  reduceProjectDetails,
  validateCreateDiagram
} = require("../util/validators");

exports.getAllProjects = (request, response) => {
  db.collection("projects")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let projects = [];
      data.forEach(doc => {
        projects.push({
          projectId: doc.id,
          ...doc.data()
        });
      });
      return response.json(projects);
    })
    .catch(err => console.error(err));
};

exports.postOneProject = (request, response) => {
  const newProject = {
    title: request.body.title,
    description: request.body.description,
    objective: request.body.objective,
    projectUserId: request.user.userId,
    observers: request.body.observers,
    userImage: request.user.imageUrl,
    firstNameUser: request.user.firstNameUser,
    lastNameUser: request.user.lastNameUser,
    createdAt: new Date().toISOString(),
    commentCount: 0
  };

  const { valid, errors } = validateCreateProject(newProject);

  if (!valid) return response.status(400).json(errors);

  db.collection("projects")
    .add(newProject)
    .then(doc => {
      const resProject = newProject;
      resProject.projectId = doc.id;
      response.json(resProject);
    })
    .catch(err => {
      response.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

exports.getProject = (request, response) => {
  let projectData = {};
  db.doc(`/projects/${request.params.projectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Project not found" });
      }
      projectData = doc.data();
      projectData.projectId = doc.id;
      return (
        db
          //.collection("comments")
          .collection("diagrams")
          .orderBy("createdAt", "desc")
          .where("projectId", "==", request.params.projectId)
          .get()
      );
    })
    .then(data => {
      //projectData.comments = [];
      projectData.diagrams = [];
      data.forEach(doc => {
        //projectData.comments.push(doc.data());
        let diagram = doc.data();
        diagram.diagramId = doc.id;
        projectData.diagrams.push(diagram);
      });
      //return response.json({ projectData });
      return (
        db
          //.collection("diagrams")
          .collection("comments")
          .orderBy("createdAt", "desc")
          .where("projectId", "==", request.params.projectId)
          .get()
      );
    })
    .then(data => {
      //projectData.diagrams = [];
      projectData.comments = [];
      data.forEach(doc => {
        //projectData.diagrams.push(doc.data());
        projectData.comments.push(doc.data());
      });
      return response.json(projectData);
    })
    .catch(err => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

exports.commentOnProject = (request, response) => {
  if (request.body.body.trim() === "") {
    return response.status(400).json({ comment: "Must not be empty" });
  }

  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    projectId: request.params.projectId,
    userId: request.user.userId,
    userImage: request.user.imageUrl
  };

  db.doc(`/projects/${request.params.projectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Project not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      response.json(newComment);
    })
    .catch(err => {
      console.log(err);
      response.status(500).json({ error: "Someting went wrong" });
    });
};

exports.diagramProject = (request, response) => {
  const newDiagram = {
    diagram: request.body.diagram,
    diagramName: request.body.diagramName,
    type: request.body.type,
    createdAt: new Date().toISOString(),
    projectId: request.params.projectId
  };

  const { valid, errors } = validateCreateDiagram(newDiagram);

  if (!valid) return response.status(400).json(errors);

  db.doc(`/projects/${request.params.projectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Project not found" });
      }
    })
    .then(() => {
      return db.collection("diagrams").add(newDiagram);
    })
    .then(() => {
      response.json(newDiagram);
    })
    .catch(err => {
      console.log(err);
      response.status(500).json({ error: "Someting went wrong" });
    });
};

exports.deleteProject = (request, response) => {
  const document = db.doc(`/projects/${request.params.projectId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Project not found" });
      }
      if (doc.data().projectUserId !== request.user.userId) {
        return response.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      response.json({ message: "Project deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.editProjectDetails = (request, response) => {
  let projectDetailsRequest = {
    title: request.body.title,
    description: request.body.description,
    objective: request.body.objective
  };

  let projectDetails = reduceProjectDetails(projectDetailsRequest);
  const document = db.doc(`/projects/${request.body.projectId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Project not found" });
      }
      if (doc.data().projectUserId !== request.user.userId) {
        return response.status(403).json({ error: "Unauthorized" });
      } else {
        return document.update(projectDetails);
      }
    })
    .then(() => {
      response.json({ message: "Details added successfully" });
    })
    .catch(err => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx) ? true : false;
};

const isEmpty = string => {
  return string.trim() === "" ? true : false;
};

exports.validateSignupData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";

  if (isEmpty(data.firstName)) errors.firstName = "Must not be empty";
  if (isEmpty(data.lastName)) errors.lastName = "Must not be empty";
  if (isEmpty(data.profession)) errors.profession = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (isEmpty(data.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateCreateProject = data => {
  let errors = {};

  if (isEmpty(data.title)) errors.title = "Must not be empty";
  if (isEmpty(data.description)) errors.description = "Must not be empty";
  if (isEmpty(data.objective)) errors.objective = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.profession.trim()))
    userDetails.profession = data.profession;
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;
  if (!isEmpty(data.firstName.trim())) userDetails.firstName = data.firstName;
  if (!isEmpty(data.lastName.trim())) userDetails.lastName = data.lastName;

  return userDetails;
};

exports.reduceProjectDetails = data => {
  let projectDetails = {};

  if (!isEmpty(data.title.trim())) projectDetails.title = data.title;
  if (!isEmpty(data.description.trim()))
    projectDetails.description = data.description;
  if (!isEmpty(data.objective.trim()))
    projectDetails.objective = data.objective;

  return projectDetails;
};

exports.validateCreateDiagram = data => {
  let errors = {};

  if (isEmpty(data.diagramName)) errors.diagramName = "Must not be empty";
  if (isEmpty(data.type)) errors.type = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validatePasswordResetData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

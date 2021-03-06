function getActiveUser() {
  return sessionStorage.getItem('current_user');
}

function setActiveUser(username) {
  sessionStorage.setItem('current_user', username);
}

function setUserEmail(email) {
  sessionStorage.setItem('user_email', email);
}

function setEmailHash(email_hash) {
  sessionStorage.setItem("email_hash", email_hash);
}

function removeActiveUser() {
  sessionStorage.removeItem('current_user');
}

function removeUserEmail() {
  sessionStorage.removeItem('user_email');
}

function removeEmailHash() {
  sessionStorage.removeItem('email_hash');
}

module.exports = {
  getActiveUser,
  setActiveUser,
  setEmailHash,
  setUserEmail,
}

// auth.js
// Ce fichier sert à gérer la connexion de l’utilisateur

// On enregistre le token quand l'utilisateur se connecte
export function saveToken(jwt) {
  localStorage.setItem("jwt", jwt);
}

// On récupère le token si l'utilisateur est déjà connecté
export function getToken() {
  return localStorage.getItem("jwt");
}

// On supprime le token quand l'utilisateur se déconnecte
export function removeToken() {
  localStorage.removeItem("jwt");
}

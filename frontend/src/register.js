import { useState } from "react";
import "./register.css";

const API_BASE = "http://localhost:1337";

export default function Register({ goLogin, onRegistered }) {

  // ce que la personne tape
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // messages à l'écran
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // pour bloquer le bouton pendant la requête
  const [loading, setLoading] = useState(false);


  // quand on clique sur créer un compte
  async function handleSubmit(e) {

    e.preventDefault();

    // si un champ est vide
    if (!username || !email || !password) {
      setError("Remplis tous les champs.");
      setSuccess("");
      return;
    }

    try {

      setLoading(true);
      setError("");
      setSuccess("");

      // inscription à Strapi
      const res = await fetch(`${API_BASE}/api/auth/local/register`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),

      });

      const data = await res.json();

      // si Strapi renvoie une erreur
      if (!res.ok) {

        const message =
          data?.error?.message || "Inscription impossible";

        throw new Error(message);

      }

      // si tout est bon
      setSuccess("Compte créé avec succès !");

      // on vide les champs
      setUsername("");
      setEmail("");
      setPassword("");

      // petite pause puis retour au login
      setTimeout(() => {
        onRegistered();
      }, 1200);

    } catch (err) {

      // messages plus clairs
      if (err.message === "Failed to fetch") {
        setError("Strapi n'est pas lancé.");
      }

      else if (
        err.message.includes("already taken") ||
        err.message.includes("already exists") ||
        err.message.includes("Email or Username are already taken")
      ) {
        setError("Cet email ou ce nom d'utilisateur existe déjà.");
      }

      else {
        setError("Erreur lors de l'inscription.");
      }

      setSuccess("");

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="auth-page">

      <div className="auth-card">

        <h2>Créer un compte</h2>

        <p className="auth-subtitle">
          Rejoins SupTaskFlow
        </p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit}>

          <div>
            <label>Nom d'utilisateur</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nom d'utilisateur"
            />
          </div>

          <div>
            <label>E-mail</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-mail"
            />
          </div>

          <div>
            <label>Mot de passe</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mot de passe"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>

        </form>

        <div className="auth-link">
          <button onClick={goLogin}>
            Déjà un compte ? Connexion
          </button>
        </div>

      </div>

    </div>

  );

}
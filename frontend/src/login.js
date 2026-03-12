import { useState } from "react";
import "./Login.css";

const API_BASE = "http://localhost:1337";

export default function Login({ onLogin, goRegister }) {

  // ce que la personne tape dans les champs
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // message si ça ne marche pas
  const [error, setError] = useState("");

  // pour éviter de cliquer 20 fois sur le bouton
  const [loading, setLoading] = useState(false);


  // quand on clique sur "se connecter"
  async function handleSubmit(e) {

    e.preventDefault();

    // si un champ est vide
    if (!identifier || !password) {
      setError("Remplis les deux champs.");
      return;
    }

    try {

      setLoading(true);
      setError("");

      // connexion à Strapi
      const res = await fetch(`${API_BASE}/api/auth/local`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Strapi attend identifier + password
        body: JSON.stringify({
          identifier,
          password,
        }),

      });

      const data = await res.json();

      // si la connexion ne marche pas
      if (!res.ok) {

        const message =
          data?.error?.message || "Connexion impossible";

        throw new Error(message);

      }

      // si tout est ok → on récupère le token
      onLogin(data.jwt);

    } catch (err) {

      // messages plus clairs
      if (err.message === "Failed to fetch") {
        setError("Strapi n'est pas lancé.");
      }

      else if (err.message.includes("Invalid identifier or password")) {
        setError("Email ou mot de passe incorrect.");
      }

      else {
        setError("Erreur de connexion.");
      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="login-container">

      <h1>Connexion</h1>

      <p className="subtitle">
        Bon retour sur SupTaskFlow
      </p>

      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <div>

          <label>Email ou nom d'utilisateur</label>

          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="email ou username"
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

          {loading ? "Connexion..." : "Se connecter"}

        </button>

      </form>

      <button
        className="register-btn"
        onClick={goRegister}
      >
        Créer un compte
      </button>

    </div>

  );

}
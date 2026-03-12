export default function ForgotPassword({ goLogin }) {
  return (
    <div style={{ padding: 40, maxWidth: 420 }}>
      <h2>Mot de passe oublié</h2>

      <p>
        Pour l’instant, l’envoi d’email n’est pas activé sur Strapi.
        <br />
        (On pourra l’ajouter plus tard si besoin.)
      </p>

      <button onClick={goLogin}>Retour connexion</button>
    </div>
  );
}

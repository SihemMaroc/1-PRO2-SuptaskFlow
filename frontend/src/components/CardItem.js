// composant qui affiche une carte
// on reçoit la carte et la fonction pour supprimer

export default function CardItem({ card, onDelete }) {

  // récupération des données de la carte
  // Strapi peut mettre les infos dans attributes
  const title = card.title || card.attributes?.title || "Sans titre";
  const description = card.description || card.attributes?.description || "";
  const dueDate = card.dueDate || card.attributes?.dueDate || null;

  return (
    <div
      style={{
        border: "1px solid #999",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        background: "white",
      }}
    >

      {/* titre + bouton supprimer */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <strong>{title}</strong>

        {/* quand on clique on appelle la fonction delete */}
        <button onClick={() => onDelete(card)}>
          Supprimer
        </button>
      </div>

      {/* description si elle existe */}
      {description && (
        <p style={{ margin: "8px 0 0" }}>
          {description}
        </p>
      )}

      {/* date d'échéance */}
      {dueDate && (
        <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 12 }}>
          Échéance : {new Date(dueDate).toLocaleDateString("fr-FR")}
        </p>
      )}

    </div>
  );
}
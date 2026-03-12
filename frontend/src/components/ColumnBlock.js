import CardItem from "./CardItem";

// URL du backend Strapi
const API_BASE = "http://localhost:1337";


// fonction pour récupérer les données simples
// Strapi met souvent les données dans attributes
function toFlat(entity) {
  if (!entity) return null;
  return entity.attributes ? { id: entity.id, ...entity.attributes } : entity;
}


// fonction pour transformer les relations Strapi en tableau
function relToArray(rel) {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel;
  if (Array.isArray(rel.data)) return rel.data;
  return [];
}


export default function ColumnBlock({ token, column, onReload }) {

  // on récupère la colonne
  const col = toFlat(column);

  // récupération des cartes de la colonne
  const cards = relToArray(col.cards)
    .map(toFlat)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));


  // fonction pour créer une carte
  async function addCard() {

    const title = prompt("Titre de la carte ?");
    if (!title) return;

    try {

      const res = await fetch(`${API_BASE}/api/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: title,
            order: cards.length,
            column: col.id,
          },
        }),
      });

      if (!res.ok) throw new Error("Erreur création carte");

      // on recharge les données
      onReload();

    } catch (e) {
      alert("Impossible d'ajouter la carte");
    }
  }


  // fonction pour supprimer une carte
  async function deleteCard(card) {

    const cardFlat = toFlat(card);

    const ok = window.confirm("Supprimer cette carte ?");
    if (!ok) return;

    try {

      const res = await fetch(`${API_BASE}/api/cards/${cardFlat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur suppression");

      // recharge les cartes
      onReload();

    } catch (e) {
      alert("Impossible de supprimer la carte");
    }
  }


  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 12,
        padding: 12,
        width: 280,
        minHeight: 250,
        background: "#fafafa",
      }}
    >

      {/* titre de la colonne + bouton ajouter carte */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <h3 style={{ margin: 0 }}>
          {col.title}
        </h3>

        <button onClick={addCard}>
          + Carte
        </button>
      </div>


      {/* affichage des cartes */}
      <div style={{ marginTop: 12 }}>

        {cards.length === 0 ? (
          <p style={{ opacity: 0.7 }}>
            Aucune carte
          </p>
        ) : (

          cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onDelete={deleteCard}
            />
          ))

        )}

      </div>

    </div>
  );
}
import { useCallback, useEffect, useMemo, useState } from "react";
import Login from "./login.js";
import Register from "./register.js";
import "./App.css";

const API_BASE = "http://localhost:1337";

// petit helper pour récupérer le documentId si Strapi le renvoie
function getDocId(item) {
  return item?.documentId || item?.attributes?.documentId || null;
}

export default function App() {
  // je garde le token dans le navigateur
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ici je choisis entre login et register
  const [page, setPage] = useState("login");

  // liste de tous les boards
  const [boards, setBoards] = useState([]);

  // board sélectionné
  const [selectedBoardId, setSelectedBoardId] = useState(null);

  // états simples pour l'écran
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // charger les boards depuis Strapi
  const loadBoards = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/boards?populate[columns][populate]=cards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur loadBoards :", txt);
        throw new Error();
      }

      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : [];

      setBoards(list);

      // si le board existe encore je le garde
      // sinon je prends le premier
      if (list.length > 0) {
        setSelectedBoardId((oldId) => {
          const existe = list.some((b) => Number(b.id) === Number(oldId));
          return existe ? oldId : list[0].id;
        });
      } else {
        setSelectedBoardId(null);
      }
    } catch {
      setError("Impossible de charger les boards");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // créer un board
  async function createBoard() {
    const title = prompt("Nom du board ?");
    if (!title) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: { title },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur create board :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur création board");
    }
  }

  // supprimer le board sélectionné
  async function deleteBoard() {
    if (!selectedBoardId) return;

    const ok = window.confirm("Supprimer ce board ?");
    if (!ok) return;

    try {
      setError("");

      // je retrouve le board actuel
      const board = boards.find(
        (b) => Number(b.id) === Number(selectedBoardId)
      );
      if (!board) return;

      const boardDocumentId = getDocId(board);

      const columns =
        board.attributes?.columns?.data ||
        board.columns?.data ||
        board.columns ||
        [];

      // je supprime d'abord toutes les cartes
      for (const col of columns) {
        const cards =
          col.attributes?.cards?.data ||
          col.cards?.data ||
          col.cards ||
          [];

        for (const card of cards) {
          const cardDocumentId = getDocId(card);

          await fetch(`${API_BASE}/api/cards/${cardDocumentId || card.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

      // ensuite je supprime les colonnes
      for (const col of columns) {
        const columnDocumentId = getDocId(col);

        await fetch(`${API_BASE}/api/columns/${columnDocumentId || col.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // puis je supprime le board
      const res = await fetch(
        `${API_BASE}/api/boards/${boardDocumentId || selectedBoardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur delete board :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur suppression board");
    }
  }

  // créer une colonne
  async function createColumn() {
    if (!selectedBoardId) return;

    const title = prompt("Nom de la colonne ?");
    if (!title) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            order: 0,
            board: selectedBoardId,
          },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur create column :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur création colonne");
    }
  }

  // supprimer une colonne
  async function deleteColumn(columnId) {
    const ok = window.confirm("Supprimer cette colonne ?");
    if (!ok) return;

    try {
      setError("");

      // je retrouve le board actuel
      const board = boards.find(
        (b) => Number(b.id) === Number(selectedBoardId)
      );

      const columns =
        board?.attributes?.columns?.data ||
        board?.columns?.data ||
        board?.columns ||
        [];

      // je retrouve la bonne colonne
      const currentColumn = columns.find(
        (col) => Number(col.id) === Number(columnId)
      );

      if (!currentColumn) {
        setError("Colonne introuvable");
        return;
      }

      // je récupère les cartes de cette colonne
      const cards =
        currentColumn.attributes?.cards?.data ||
        currentColumn.cards?.data ||
        currentColumn.cards ||
        [];

      // je supprime d'abord les cartes
      for (const card of cards) {
        const cardDocumentId = getDocId(card);

        await fetch(`${API_BASE}/api/cards/${cardDocumentId || card.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // ensuite je supprime la colonne
      const columnDocumentId = getDocId(currentColumn);

      const res = await fetch(
        `${API_BASE}/api/columns/${columnDocumentId || columnId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur delete column :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur suppression colonne");
    }
  }

  // renommer une colonne
  async function renameColumn(col) {
    const newTitle = prompt(
      "Nouveau nom de la colonne :",
      col.attributes?.title || col.title || ""
    );

    if (newTitle === null) return;
    if (!newTitle.trim()) return;

    try {
      setError("");

      const columnDocumentId = getDocId(col);

      const res = await fetch(
        `${API_BASE}/api/columns/${columnDocumentId || col.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              title: newTitle.trim(),
              order: col.attributes?.order ?? col.order ?? 0,
              board:
                col.attributes?.board?.data?.id ||
                col.board?.data?.id ||
                col.board?.id ||
                selectedBoardId,
            },
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur rename column :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur renommage colonne");
    }
  }

  // créer une carte dans une colonne
  async function createCard(columnId) {
    const title = prompt("Titre de la carte ?");
    if (!title) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            column: columnId,
            order: 0,
          },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur create card :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur création carte");
    }
  }

  // supprimer une carte
  async function deleteCard(cardId) {
    const ok = window.confirm("Supprimer cette carte ?");
    if (!ok) return;

    try {
      setError("");

      // je retrouve la carte complète pour récupérer son documentId
      let currentCard = null;

      for (const board of boards) {
        const columns =
          board.attributes?.columns?.data ||
          board.columns?.data ||
          board.columns ||
          [];

        for (const col of columns) {
          const cards =
            col.attributes?.cards?.data ||
            col.cards?.data ||
            col.cards ||
            [];

          const found = cards.find((c) => Number(c.id) === Number(cardId));
          if (found) {
            currentCard = found;
            break;
          }
        }

        if (currentCard) break;
      }

      const cardDocumentId = getDocId(currentCard);

      const res = await fetch(
        `${API_BASE}/api/cards/${cardDocumentId || cardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur delete card :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur suppression carte");
    }
  }

  // modifier une carte
  async function editCard(card) {
    // je demande le nouveau titre
    const newTitle = prompt("Nouveau titre :", card.title || "");
    if (newTitle === null) return;

    // je demande la nouvelle description
    const newDescription = prompt("Description :", card.description || "");
    if (newDescription === null) return;

    // je demande la date
    const newDueDate = prompt(
      "Date échéance (YYYY-MM-DD) :",
      card.dueDate || ""
    );
    if (newDueDate === null) return;

    try {
      setError("");

      const cardDocumentId = card.documentId || getDocId(card);

      const res = await fetch(
        `${API_BASE}/api/cards/${cardDocumentId || card.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              title: newTitle,
              description: newDescription,
              // si vide je mets null
              dueDate: newDueDate === "" ? null : newDueDate,
            },
          }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.log("Erreur edit card :", txt);
        throw new Error();
      }

      await loadBoards();
    } catch {
      setError("Erreur de modification de la carte");
    }
  }

  // quand je me connecte je charge les boards
  useEffect(() => {
    if (!token) return;
    loadBoards();
  }, [token, loadBoards]);

  // retrouver le board sélectionné
  const selectedBoard = useMemo(() => {
    return boards.find((b) => Number(b.id) === Number(selectedBoardId));
  }, [boards, selectedBoardId]);

  // déconnexion
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setBoards([]);
    setSelectedBoardId(null);
    setPage("login");
  }

  // si pas connecté j'affiche login ou register
  if (!token) {
    if (page === "login") {
      return (
        <Login
          onLogin={(newToken) => {
            localStorage.setItem("token", newToken);
            setToken(newToken);
          }}
          goRegister={() => setPage("register")}
        />
      );
    }

    return (
      <Register
        goLogin={() => setPage("login")}
        onRegistered={() => setPage("login")}
      />
    );
  }

  // juste l'état chargement
  if (loading) return <p>Chargement...</p>;

  // récupérer les colonnes du board
  const columns =
    selectedBoard?.attributes?.columns?.data ||
    selectedBoard?.columns?.data ||
    selectedBoard?.columns ||
    [];

  return (
    <div className="app">
      <div className="header">
        <h1>SupTaskFlow</h1>

        <div className="toolbar">
          <label>Boards :</label>

          <select
            value={selectedBoardId || ""}
            onChange={(e) => setSelectedBoardId(Number(e.target.value))}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.attributes?.title || b.title || "Sans titre"}
              </option>
            ))}
          </select>

          <button className="btn-add" onClick={createBoard}>
            Nouveau tableau
          </button>

          {/* si j'ai au moins un board je peux afficher ces boutons */}
          {boards.length > 0 && (
            <>
              <button className="btn-delete" onClick={deleteBoard}>
                Supprimer le tableau
              </button>

              <button className="btn-add" onClick={createColumn}>
                Ajouter une colonne
              </button>
            </>
          )}

          <button className="btn-logout" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <hr />

      <div className="columns">
        {boards.length === 0 ? (
          <p>Aucun tableau. Crée-en un nouveau.</p>
        ) : columns.length === 0 ? (
          <p>Aucune colonne</p>
        ) : (
          columns.map((col) => {
            const rawCards =
              col.attributes?.cards?.data ||
              col.cards?.data ||
              col.cards ||
              [];

            const cards = rawCards.map((card) =>
              card.attributes
                ? {
                    id: card.id,
                    documentId: card.documentId,
                    ...card.attributes,
                  }
                : card
            );

            const colTitle = col.attributes?.title || col.title || "Colonne";

            return (
              <div
                key={col.id}
                className={`column ${
                  colTitle === "TO DO" || colTitle === "FAIRE"
                    ? "todo"
                    : colTitle === "DOING" || colTitle === "EN COURS"
                    ? "doing"
                    : colTitle === "DONE" || colTitle === "FAIT"
                    ? "done"
                    : ""
                }`}
              >
                <h2>{colTitle}</h2>

                <button className="btn-add" onClick={() => createCard(col.id)}>
                  Ajouter carte
                </button>

                <button className="btn-edit" onClick={() => renameColumn(col)}>
                  Renommer colonne
                </button>

                <button
                  className="btn-delete"
                  onClick={() => deleteColumn(col.id)}
                >
                  Supprimer la colonne
                </button>

                {cards.length === 0 ? (
                  <p>Aucune carte</p>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className="card">
                      <p>{card.title || "Sans titre"}</p>

                      <button
                        className="btn-edit"
                        onClick={() => editCard(card)}
                      >
                        Modifier carte
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => deleteCard(card.id)}
                      >
                        Supprimer carte
                      </button>

                      {card.description && <p>{card.description}</p>}

                      {card.dueDate && (
                        <span className="due-date">📅 {card.dueDate}</span>
                      )}
                    </div>
                  ))
                )}

                <hr />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
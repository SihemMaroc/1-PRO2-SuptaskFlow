import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DragDropCard({ card, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({
    id: `card-${card.id}`,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: transform ? 0.8 : 1,
    border: isOver ? "2px dashed #4f46e5" : "none",
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div {...attributes} {...listeners}>
        <p>{card.title || "Sans titre"}</p>
      </div>

      <button className="btn-edit" onClick={onEdit}>
        Modifier carte
      </button>

      <button className="btn-delete" onClick={onDelete}>
        Supprimer carte
      </button>

      {card.description && <p>{card.description}</p>}

      {card.dueDate && <span className="due-date">📅 {card.dueDate}</span>}
    </div>
  );
}

export default DragDropCard;
import { useDraggable } from "@dnd-kit/core";
import { Icon } from "./Icon";
import { icons } from "../constants";
import type { SidebarItemData } from "../types";

// ─── SidebarItem ──────────────────────────────────────────────────────────────
interface SidebarItemProps {
  item: SidebarItemData;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { fromSidebar: true, type: item.type, label: item.label },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 5,
        cursor: "grab",
        color: isDragging ? "#3b9eff" : "#9ba8bf",
        background: isDragging ? "#1e2535" : "transparent",
        fontSize: 13,
        userSelect: "none",
        transition: "all 0.15s",
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = "#1a2233";
        e.currentTarget.style.color = "#c9d1e0";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = isDragging ? "#1e2535" : "transparent";
        e.currentTarget.style.color = isDragging ? "#3b9eff" : "#9ba8bf";
      }}
    >
      <Icon d={icons[item.icon]} size={14} />
      {item.label}
    </div>
  );
}
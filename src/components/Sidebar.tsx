// ─── Sidebar.tsx ──────────────────────────────────────────────────────────────
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { SidebarItemData } from "../types";
import { SIDEBAR_GROUPS, icons } from "../constants";
import { Icon } from "./primitives";

// ── SidebarItem — một field type có thể kéo ra canvas ─────────────────────────
function SidebarItem({ item }: { item: SidebarItemData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { kind: "sidebar", type: item.type, label: item.label },
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
        color: isDragging ? "#3b9eff" : "#475569",
        background: isDragging ? "#e2e8f0" : "transparent",
        fontSize: 13,
        userSelect: "none",
        transition: "all 0.15s",
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = "#f0f4f8";
        e.currentTarget.style.color = "#1e293b";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = isDragging ? "#e2e8f0" : "transparent";
        e.currentTarget.style.color = isDragging ? "#3b9eff" : "#475569";
      }}
    >
      <Icon d={icons[item.icon]} size={14} />
      {item.label}
    </div>
  );
}

// ── ComponentSidebar — panel trái chứa danh sách field types ──────────────────
export function ComponentSidebar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const filteredGroups = SIDEBAR_GROUPS
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ width: 150, background: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
      <div style={{ padding: "10px 10px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e8edf3", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 10px" }}>
          <Icon d={icons.search} size={13} />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search"
            style={{ background: "transparent", border: "none", color: "#1e293b", fontSize: 13, outline: "none", width: "100%" }}
          />
        </div>
      </div>
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <div style={{ padding: "10px 10px 4px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {group.label}
          </div>
          {group.items.map((item) => (
            <SidebarItem key={item.type} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
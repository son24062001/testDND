import { Icon } from "./Icon";
import { SidebarItem } from "./SidebarItem";
import { icons, SIDEBAR_GROUPS } from "../constants";
import type { SidebarGroup } from "../types";

// ─── ComponentSidebar ─────────────────────────────────────────────────────────
interface ComponentSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ComponentSidebar({ search, onSearchChange }: ComponentSidebarProps) {
  const filteredGroups: SidebarGroup[] = SIDEBAR_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      style={{
        width: 200,
        background: "#0e1525",
        borderRight: "1px solid #1a2235",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      {/* Search bar */}
      <div style={{ padding: "10px 10px 6px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#1a2235",
            border: "1px solid #1e2d42",
            borderRadius: 6,
            padding: "6px 10px",
          }}
        >
          <Icon d={icons.search} size={13} />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search"
            style={{
              background: "transparent",
              border: "none",
              color: "#c9d1e0",
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Groups */}
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <div
            style={{
              padding: "10px 10px 4px",
              fontSize: 11,
              color: "#4a5568",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
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
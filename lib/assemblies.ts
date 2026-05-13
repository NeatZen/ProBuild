import type { LineItem } from "./estimateTypes";

export type AssemblyLineSeed = Omit<LineItem, "id" | "kitId" | "kitName">;

export type AssemblyDefinition = {
  id: string;
  name: string;
  description: string;
  lines: AssemblyLineSeed[];
};

/** Assemblies expand to multiple linked lines (shared kitId) with editable quantities. */
export const ASSEMBLIES: AssemblyDefinition[] = [
  {
    id: "kit-drywall-room",
    name: "Drywall room pack",
    description: "Hang, tape, mud, sand for one typical 12×12 room (qty = rooms).",
    lines: [
      {
        description: "Drywall board (supply)",
        category: "Materials",
        quantity: 12,
        unit: "sheet",
        unitCost: 0,
      },
      {
        description: "Joint compound & tape",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Hang & finish labor",
        category: "Labor",
        quantity: 1,
        unit: "room",
        unitCost: 0,
      },
    ],
  },
  {
    id: "kit-bath-vanity-swap",
    name: "Bath vanity swap",
    description: "Remove/replace vanity, reconnect stops, caulk.",
    lines: [
      {
        description: "Vanity demo & disposal",
        category: "Labor",
        quantity: 1,
        unit: "ea",
        unitCost: 0,
      },
      {
        description: "Vanity & top (supply)",
        category: "Materials",
        quantity: 1,
        unit: "ea",
        unitCost: 0,
      },
      {
        description: "Plumbing reconnect",
        category: "Subcontractor",
        quantity: 1,
        unit: "ea",
        unitCost: 0,
      },
    ],
  },
  {
    id: "kit-concrete-pad",
    name: "Concrete pad (small)",
    description: "Form, pour, finish for a small equipment pad (qty = pads).",
    lines: [
      {
        description: "Forming & prep",
        category: "Labor",
        quantity: 1,
        unit: "pad",
        unitCost: 0,
      },
      {
        description: "Concrete (material)",
        category: "Materials",
        quantity: 4,
        unit: "CY",
        unitCost: 0,
      },
      {
        description: "Pour & finish labor",
        category: "Labor",
        quantity: 1,
        unit: "pad",
        unitCost: 0,
      },
    ],
  },
];

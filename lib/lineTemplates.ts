import type { LineItem, LineType } from "./estimateTypes";

export type LineTemplateLineSeed = Pick<
  LineItem,
  "description" | "category" | "quantity" | "unit" | "unitCost"
> & { lineType?: LineType };

export type LineTemplate = {
  id: string;
  name: string;
  description: string;
  lines: LineTemplateLineSeed[];
};

export const LINE_TEMPLATES: LineTemplate[] = [
  {
    id: "demo-kitchen",
    name: "Kitchen remodel (starter)",
    description: "Rough placeholder lines for a mid-range kitchen refresh.",
    lines: [
      {
        description: "Demolition & haul-off",
        category: "Labor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Cabinets (supply)",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Countertops (supply & install)",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Electrical rough & finish",
        category: "Subcontractor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Plumbing rough & finish",
        category: "Subcontractor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
    ],
  },
  {
    id: "demo-bath",
    name: "Bath refresh (starter)",
    description: "Placeholder lines for a typical hall bath update.",
    lines: [
      {
        description: "Demo, disposal, protection",
        category: "Labor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Vanity & top",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Tile materials (floor/wall)",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Tile install labor",
        category: "Labor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
    ],
  },
  {
    id: "demo-framing",
    name: "Framing & drywall (shell)",
    description: "Shell package placeholders.",
    lines: [
      {
        description: "Framing labor",
        category: "Labor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Lumber & hardware",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Drywall hang & finish",
        category: "Labor",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
      {
        description: "Drywall board",
        category: "Materials",
        quantity: 1,
        unit: "ls",
        unitCost: 0,
      },
    ],
  },
];

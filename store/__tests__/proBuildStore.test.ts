import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultAppPersist } from "@/lib/persistence";
import { useProBuildStore } from "@/store/proBuildStore";

describe("useProBuildStore", () => {
  beforeEach(() => {
    const seed = createDefaultAppPersist();
    useProBuildStore.setState({
      estimates: seed.estimates,
      activeEstimateId: seed.activeEstimateId,
      settings: seed.settings,
      ui: { lineFilter: "", collapsedLineIds: [] },
      saveStatus: "idle",
      saveErrorMessage: null,
      hydrated: true,
    });
  });

  it("addLine appends a row", () => {
    const before = useProBuildStore.getState().estimates[0].lines.length;
    useProBuildStore.getState().addLine();
    const after = useProBuildStore.getState().estimates[0].lines.length;
    expect(after).toBe(before + 1);
  });
});

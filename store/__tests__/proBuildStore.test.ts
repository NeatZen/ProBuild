import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultAppPersist } from "@/lib/persistence";
import { defaultBranding, defaultUiState } from "@/lib/appTypes";
import { useProBuildStore } from "@/store/proBuildStore";

describe("useProBuildStore", () => {
  beforeEach(() => {
    const seed = createDefaultAppPersist();
    useProBuildStore.setState({
      estimates: seed.estimates,
      activeEstimateId: seed.activeEstimateId,
      revisionsByEstimateId: seed.revisionsByEstimateId ?? {},
      settings: seed.settings,
      ui: { ...defaultUiState },
      branding: seed.branding ? { ...defaultBranding, ...seed.branding } : { ...defaultBranding },
      savedLineLibrary: seed.savedLineLibrary ?? [],
      undoStack: [],
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

  it("setOnboardingComplete updates ui flag", () => {
    useProBuildStore.getState().setOnboardingComplete(false);
    expect(useProBuildStore.getState().ui.onboardingComplete).toBe(false);
    useProBuildStore.getState().setOnboardingComplete(true);
    expect(useProBuildStore.getState().ui.onboardingComplete).toBe(true);
  });
});

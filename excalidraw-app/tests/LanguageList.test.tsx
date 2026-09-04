import { defaultLang } from "@excalidraw/excalidraw/i18n";
import { UI } from "@excalidraw/excalidraw/tests/helpers/ui";
import {
  screen,
  fireEvent,
  waitFor,
  render,
} from "@excalidraw/excalidraw/tests/test-utils";
import { vi } from "vitest";

import ExcalidrawApp from "../App";

// Keep app tests independent of Firebase credentials supplied by the runtime.
vi.mock("../auth/useDrawsyAuth", () => ({
  useDrawsyAuth: () => ({
    status: "anonymous",
    user: null,
    error: null,
    isBusy: false,
    signIn: async () => undefined,
    signOut: async () => undefined,
    getIdToken: async () => {
      throw new Error("Authentication is required.");
    },
  }),
}));

describe("Test app language menu", () => {
  it("rerenders UI on language change", async () => {
    await render(<ExcalidrawApp />);

    // select rectangle tool to show properties menu
    UI.clickTool("rectangle");
    // english lang should display `thin` label
    expect(screen.queryByTitle(/thin/i)).not.toBeNull();
    fireEvent.click(document.querySelector(".dropdown-menu-button")!);

    const languageMenu = screen.getByRole("menuitem", { name: /^Language/ });
    languageMenu.focus();
    fireEvent.keyDown(languageMenu, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("menuitem", { name: "Deutsch" }));
    // switching to german, `thin` label should no longer exist
    await waitFor(() => expect(screen.queryByTitle(/thin/i)).toBeNull());
    // reset language
    fireEvent.click(document.querySelector(".dropdown-menu-button")!);
    const reopenedLanguageMenu = screen.getByRole("menuitem", {
      name: /^Language/,
    });
    reopenedLanguageMenu.focus();
    fireEvent.keyDown(reopenedLanguageMenu, { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("menuitem", { name: defaultLang.label }));
    // switching back to English
    await waitFor(() => expect(screen.queryByTitle(/thin/i)).not.toBeNull());
  });
});

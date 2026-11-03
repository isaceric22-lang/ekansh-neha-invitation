import type { AppDef } from "./app-nav";
import SafariPage from "./SafariPage";

/**
 * Shared app definition so the invitation can be launched from anywhere in the
 * phone — the home-screen widget, a folder item, or a link inside another app.
 */
export const INVITATION_APP: AppDef = {
  key: "invitation",
  iconSrc: "/icons/safari.png",
  render: () => <SafariPage />,
  hideIcon: true,
};

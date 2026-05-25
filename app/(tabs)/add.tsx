// This tab is handled by the layout - it opens a modal instead
// The actual UI is in the BottomTabAddButton component

import { Redirect } from "expo-router";

export default function AddTabPlaceholder() {
  // Redirect to the modal - this screen should never be directly visible
  return <Redirect href="/modals/add-modal" />;
}

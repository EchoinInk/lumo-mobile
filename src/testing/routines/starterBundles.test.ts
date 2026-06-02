import { starterRoutineBundles } from "@/features/routines";
import { assertEqual } from "../testUtils";

export function testStarterRoutineBundlesProvideExpandedOptions(): void {
  assertEqual(
    starterRoutineBundles.length > 3,
    true,
    "routine bundles should offer more than three options",
  );
}

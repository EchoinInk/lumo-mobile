import { createRoutineBundleApplyGuard } from "@/features/routines";
import { assertEqual } from "../testUtils";

export function testRoutineBundleGuardBlocksDuplicateStarts(): void {
  const guard = createRoutineBundleApplyGuard();

  assertEqual(guard.begin("starter"), true, "first bundle start should be allowed");
  assertEqual(
    guard.begin("starter"),
    false,
    "second bundle start should be blocked while locked",
  );
}

export function testRoutineBundleGuardCanReleaseAfterFailure(): void {
  const guard = createRoutineBundleApplyGuard();

  guard.begin("starter");
  guard.release("starter");

  assertEqual(
    guard.begin("starter"),
    true,
    "released bundle should be available after failure",
  );
}

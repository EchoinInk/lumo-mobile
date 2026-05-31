import {
  areAllFeaturesEnabled,
  getDisabledFeatures,
  getEnabledFeatures,
  isAnyFeatureEnabled,
  isFeatureEnabled,
  isFeatureFlagKey,
  requireFeature,
} from "@/config/features/featureFlags";
import {
  getRolloutConfig,
  isFeatureRolledOut,
} from "@/config/features/rollout";
import {
  getExperimentVariant,
  isExperimentActive,
} from "@/config/features/experiments";
import { assert, assertEqual } from "../testUtils";

export function testIsFeatureEnabledReturnsConfiguredValues(): void {
  assertEqual(isFeatureEnabled("focusMode"), true, "stable flags should enable");
  assertEqual(
    isFeatureEnabled("aiPlanningAssistant"),
    false,
    "experimental flags should fail closed",
  );
}

export function testFeatureFlagHelpersHandleUnknownKeysSafely(): void {
  assertEqual(
    isFeatureFlagKey("not-a-real-flag"),
    false,
    "unknown flags should not pass the type guard",
  );
  assertEqual(
    getEnabledFeatures().includes("focusMode"),
    true,
    "enabled list should include enabled flags",
  );
  assertEqual(
    getDisabledFeatures().includes("aiPlanningAssistant"),
    true,
    "disabled list should include disabled flags",
  );
}

export function testRequireFeatureThrowsForDisabledFlags(): void {
  let threw = false;

  try {
    requireFeature("aiPlanningAssistant");
  } catch {
    threw = true;
  }

  assert(threw, "requireFeature should throw for disabled flags");
}

export function testGroupedFeatureChecksAreSafe(): void {
  assertEqual(
    isAnyFeatureEnabled(["aiPlanningAssistant", "focusMode"]),
    true,
    "any-feature checks should return true when one flag is enabled",
  );
  assertEqual(
    areAllFeaturesEnabled(["focusMode", "calmModeV2"]),
    true,
    "all-feature checks should return true for enabled groups",
  );
}

export function testRolloutConfigReturnsSafeDefaults(): void {
  assertEqual(
    getRolloutConfig("unknown-feature"),
    null,
    "unknown rollout config should return null",
  );
  assertEqual(
    isFeatureRolledOut("unknown-feature", "user-1"),
    false,
    "unknown rollout should fail closed",
  );
  assertEqual(
    isFeatureRolledOut("focusMode"),
    true,
    "all rollout should be enabled",
  );
}

export function testRolloutAssignmentIsDeterministic(): void {
  const first = isFeatureRolledOut("syncRecovery", "stable-user");
  const second = isFeatureRolledOut("syncRecovery", "stable-user");

  assertEqual(first, second, "percentage rollout should be deterministic");
}

export function testInactiveExperimentsReturnControl(): void {
  assertEqual(
    isExperimentActive("onboardingFlowV2"),
    false,
    "inactive experiments should report inactive",
  );
  assertEqual(
    getExperimentVariant("onboardingFlowV2", "user-1"),
    "control",
    "inactive experiments should return control",
  );
}

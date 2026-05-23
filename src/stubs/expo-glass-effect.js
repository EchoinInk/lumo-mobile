// Web stub for expo-glass-effect — this package has no web implementation.
// expo-router references it internally; stub all exports so web bundling succeeds.
const { View } = require("react-native");

exports.GlassView = View;
exports.GlassContainer = View;
exports.isLiquidGlassAvailable = function () { return false; };
exports.isGlassEffectAPIAvailable = function () { return false; };

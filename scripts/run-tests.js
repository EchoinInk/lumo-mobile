const fs = require("fs");
const Module = require("module");
const path = require("path");
const ts = require("typescript");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");

global.__DEV__ = true;

function createLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

global.localStorage = global.localStorage ?? createLocalStorage();
global.window = global.window ?? { localStorage: global.localStorage };
global.crypto =
  global.crypto ??
  {
    randomUUID: () =>
      `test-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2)}`,
  };

const reactNativeMock = {
  Platform: { OS: "web", select: (values) => values.web ?? values.default },
  StyleSheet: { create: (styles) => styles, flatten: (style) => style },
};

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request === "react-native") {
    return path.join(rootDir, "scripts", "__mocks__", "react-native.js");
  }

  if (request.startsWith("@/src/")) {
    return originalResolveFilename.call(
      this,
      path.join(srcDir, request.slice("@/src/".length)),
      parent,
      isMain,
      options,
    );
  }

  if (request.startsWith("@/")) {
    return originalResolveFilename.call(
      this,
      path.join(srcDir, request.slice("@/".length)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.cache[path.join(rootDir, "scripts", "__mocks__", "react-native.js")] = {
  id: "react-native",
  filename: path.join(rootDir, "scripts", "__mocks__", "react-native.js"),
  loaded: true,
  exports: reactNativeMock,
};

require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

require.extensions[".tsx"] = require.extensions[".ts"];

function collectTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTestFiles(entryPath);
    }
    return entry.name.endsWith(".test.ts") ? [entryPath] : [];
  });
}

async function run() {
  const testRoot = path.join(srcDir, "testing");
  const testFiles = collectTestFiles(testRoot).sort();
  let passed = 0;
  let failed = 0;

  for (const testFile of testFiles) {
    const moduleExports = require(testFile);
    const tests = Object.entries(moduleExports).filter(
      ([name, value]) => name.startsWith("test") && typeof value === "function",
    );

    for (const [name, testFn] of tests) {
      try {
        await testFn();
        passed += 1;
        console.log(`✓ ${path.relative(rootDir, testFile)} :: ${name}`);
      } catch (error) {
        failed += 1;
        console.error(`✕ ${path.relative(rootDir, testFile)} :: ${name}`);
        console.error(error);
      }
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

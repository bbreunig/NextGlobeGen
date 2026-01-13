import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG, mergeConfigs } from "next-globe-gen/config";

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need an absolute path for originDir in shared package so that
// message loading of shared messages works correctly in applications
const sharedThis = { originDir: path.resolve(__dirname, "./messages") };

const defaultLoader = DEFAULT_CONFIG.messages.loadMessageEntries;
const defaultWriter = DEFAULT_CONFIG.messages.writeMessageEntries;

/**
 * Shared i18n configuration used in multiple applications.
 */
export const sharedI18nConfig = mergeConfigs(DEFAULT_CONFIG, {
  locales: ["en", "de"],
  defaultLocale: "de",
  routes: {
    originDir: "./_app",
    localizedDir: "./app/(i18n)",
  },
  messages: {
    originDir: "./messages",
    // Key extraction dirs specific to applications
    keyExtractionDirs: ["./_app", "./components"],
    // Allow pruning unused keys in applications, but keep shared package keys
    pruneUnusedKeys: true,
    // Keep shared package keys to allow cross-package key usage
    whitelistedKeys: [/^shared\./],
    /**
     * Applications need to load messages from both the application and the shared package.
     */
    async loadMessageEntries(locale) {
      // This binding is necessary to preserve correct `this` context
      const loadAppMessageEntries = defaultLoader.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const loadSharedMessageEntries = defaultLoader.bind(sharedThis);
      const appMessageEntries = await loadAppMessageEntries(locale);
      const sharedMessageEntries = await loadSharedMessageEntries(locale);
      return [...appMessageEntries, ...sharedMessageEntries];
    },
    /**
     * Applications need to write messages to both the application and the shared package message files.
     * Since the applications might use shared package keys, we need to split the entries here
     * so that shared package keys are not accidentally written to the application message files.
     */
    async writeMessageEntries(locale, entries) {
      const { sharedEntries = [], appEntries = [] } = Object.groupBy(
        entries,
        (entry) => {
          if (entry.key.startsWith("shared.")) return "sharedEntries";
          return "appEntries";
        },
      );
      // This binding is necessary to preserve correct `this` context
      const writeAppMessageEntries = defaultWriter.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const writeSharedMessageEntries = defaultWriter.bind(sharedThis);
      await writeAppMessageEntries(locale, appEntries);
      await writeSharedMessageEntries(locale, sharedEntries);
    },
  },
});

/**
 * Configuration for i18n in the frontend package.
 *
 * This is used only to generate correct types for the frontend package.
 * This way components in shared package can use translations with correct types.
 */
const config = mergeConfigs(sharedI18nConfig, {
  messages: {
    // Use default loader for the shared frontend package
    loadMessageEntries: defaultLoader,
    // Use default writer for the shared frontend package
    writeMessageEntries: defaultWriter,
    // Key extraction dirs specific to the frontend package
    keyExtractionDirs: ["./components", "./hooks", "./lib"],
  },
});

export default config;

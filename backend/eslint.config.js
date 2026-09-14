module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        // Node globals
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        // Jest globals
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly"
      }
    },
    rules: {
      // Set some common rules to warnings so they don't break the pipeline immediately
      // while you clean up the codebase
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];

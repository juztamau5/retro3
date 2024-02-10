process.env.ESBK_TSCONFIG_PATH = './packages/tests/tsconfig.json'

module.exports = {
  "node-option": [
    "loader=tsx",
    "no-warnings",
    "conditions=retro3:tsx"
  ],
  "timeout": 30000
}

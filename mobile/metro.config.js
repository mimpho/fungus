// metro.config.js
// Extends Metro's reach to the monorepo root so that `shared/` (one level up)
// can be imported from mobile code with relative paths like ../../shared/...
//
// Without this, Metro only watches the `mobile/` directory and cannot resolve
// modules outside of it.

const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const repoRoot    = path.resolve(projectRoot, '..')   // fungus/

const config = getDefaultConfig(projectRoot)

// 1. Watch the repo root so Metro picks up changes in shared/
config.watchFolders = [repoRoot]

// 2. Tell the resolver to look in both the project's node_modules AND the
//    repo root's node_modules (avoids duplicate-module issues).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(repoRoot, 'node_modules'),
]

module.exports = config

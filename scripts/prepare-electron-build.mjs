#!/usr/bin/env node

/**
 * Prepare standalone directory for Electron packaging
 * Copies the Next.js standalone output to a temp directory
 * that electron-builder can properly include
 */

import {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    rmSync,
    statSync,
} from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const rootDir = join(__dirname, "..")

/**
 * Copy directory recursively, converting symlinks to regular files/directories.
 * This is needed because cpSync with dereference:true does NOT convert symlinks.
 * macOS codesign fails if bundle contains symlinks pointing outside the bundle.
 */
function copyDereferenced(src, dst) {
    const lstat = lstatSync(src)

    if (lstat.isSymbolicLink()) {
        // Follow symlink and check what it points to
        const stat = statSync(src)
        if (stat.isDirectory()) {
            // Symlink to directory: recursively copy the directory contents
            mkdirSync(dst, { recursive: true })
            for (const entry of readdirSync(src)) {
                copyDereferenced(join(src, entry), join(dst, entry))
            }
        } else {
            // Symlink to file: copy the actual file content
            mkdirSync(join(dst, ".."), { recursive: true })
            copyFileSync(src, dst)
        }
    } else if (lstat.isDirectory()) {
        mkdirSync(dst, { recursive: true })
        for (const entry of readdirSync(src)) {
            copyDereferenced(join(src, entry), join(dst, entry))
        }
    } else {
        mkdirSync(join(dst, ".."), { recursive: true })
        copyFileSync(src, dst)
    }
}

const standaloneDir = join(rootDir, ".next", "standalone")
const staticDir = join(rootDir, ".next", "static")
const targetDir = join(rootDir, "electron-standalone")

console.log("Preparing Electron build...")

// Clean target directory
if (existsSync(targetDir)) {
    console.log("Cleaning previous build...")
    rmSync(targetDir, { recursive: true })
}

// Create target directory
mkdirSync(targetDir, { recursive: true })

// Next.js standalone structure:
// .next/standalone/
//   ├── canvas-A-I-O/     (app source)
//   │   ├── server.js      ← The actual server entry point
//   │   ├── package.json
//   │   ├── .next/         (build output)
//   │   └── ...
//   └── node_modules/      (server dependencies)
//
// We need to FLATTEN this so server.js is at the root:
// electron-standalone/
//   ├── server.js
//   ├── package.json
//   ├── .next/
//   ├── public/
//   └── node_modules/

console.log("Copying app files from canvas-A-I-O/...")
const appDir = join(standaloneDir, "canvas-A-I-O")
if (existsSync(appDir)) {
    // Copy everything EXCEPT node_modules from canvas-A-I-O
    for (const entry of readdirSync(appDir)) {
        if (entry === "node_modules") continue // Skip app node_modules
        const srcPath = join(appDir, entry)
        const dstPath = join(targetDir, entry)
        copyDereferenced(srcPath, dstPath)
    }
}

// Copy server node_modules (dependencies for server.js)
console.log("Copying server node_modules...")
const serverNodeModules = join(standaloneDir, "node_modules")
if (existsSync(serverNodeModules)) {
    copyDereferenced(serverNodeModules, join(targetDir, "node_modules"))
}

// Copy static files
console.log("Copying static files...")
const targetStaticDir = join(targetDir, ".next", "static")
copyDereferenced(staticDir, targetStaticDir)

// Copy public folder (required for favicon-white.svg and other assets)
console.log("Copying public folder...")
const publicDir = join(rootDir, "public")
const targetPublicDir = join(targetDir, "public")
if (existsSync(publicDir)) {
    copyDereferenced(publicDir, targetPublicDir)
}

console.log("Done! Files prepared in electron-standalone/")

// Remove node_modules from standalone to prevent module resolution conflicts
// The server node_modules are still needed for Next.js server to run
// But we remove unnecessary packages to reduce size
const nodeModulesDir = join(targetDir, "node_modules")
if (existsSync(nodeModulesDir)) {
    console.log("Removing unnecessary packages from node_modules...")

    // Keep only essential runtime dependencies
    // Remove development dependencies, test files, etc.
    const packagesToRemove = [
        join(nodeModulesDir, ".bin"),
        join(nodeModulesDir, ".cache"),
    ]

    for (const pkgPath of packagesToRemove) {
        if (existsSync(pkgPath)) {
            rmSync(pkgPath, { recursive: true, force: true })
        }
    }

    console.log("Node modules optimized")
}

// Remove unnecessary cache directories to reduce bundle size
const cacheDirs = [
    join(targetDir, ".next", "cache"),
    join(targetDir, ".next", "server"),
]
for (const dir of cacheDirs) {
    if (existsSync(dir)) {
        console.log(`Removing cache directory: ${dir}`)
        rmSync(dir, { recursive: true, force: true })
    }
}

// Remove unnecessary source directories from standalone app
// These are not needed at runtime and significantly increase bundle size
const unnecessaryDirs = [
    join(targetDir, "docs"),
    join(targetDir, "scripts"),
    join(targetDir, "electron"),
    join(targetDir, "plans"),
    join(targetDir, "tests"),
    join(targetDir, "release"), // Previous build artifacts
]
for (const dir of unnecessaryDirs) {
    if (existsSync(dir)) {
        console.log(`Removing unnecessary directory: ${dir}`)
        rmSync(dir, { recursive: true, force: true })
    }
}

console.log("Build preparation complete! Size optimized.")
console.log(`Server.js should be at: ${join(targetDir, "server.js")}`)

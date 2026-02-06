/**
 * electron-builder afterPack hook
 * Ad-hoc signs macOS apps for offline draw.io bundle compatibility
 *
 * Note: node_modules are NO LONGER copied to standalone to prevent
 * module resolution conflicts (e.g., "Cannot find module 'zod'" error).
 * The prepare-electron-build.mjs script now removes node_modules from
 * electron-standalone before packaging.
 */

const path = require("path")
const { execSync } = require("child_process")

module.exports = async (context) => {
    // Ad-hoc sign macOS apps to fix signature issues with bundled draw.io files
    if (context.packager.platform.name === "mac") {
        const appOutDir = context.appOutDir
        const appPath = path.join(
            appOutDir,
            `${context.packager.appInfo.productFilename}.app`,
        )
        console.log(`[afterPack] Ad-hoc signing macOS app: ${appPath}`)
        try {
            execSync(`codesign --force --deep --sign - "${appPath}"`, {
                stdio: "inherit",
            })
            console.log("[afterPack] Ad-hoc signing completed successfully")
        } catch (error) {
            console.error("[afterPack] Ad-hoc signing failed:", error.message)
            throw error
        }
    }

    console.log("[afterPack] Packaging complete")
}

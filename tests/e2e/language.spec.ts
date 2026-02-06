import {
    expect,
    getChatInput,
    getIframe,
    openSettings,
    test,
} from "./lib/fixtures"

test.describe("Language Switching", () => {
    test("loads English by default", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        const chatInput = getChatInput(page)
        await expect(chatInput).toBeVisible({ timeout: 10000 })

        await expect(page.locator('button:has-text("Send")')).toBeVisible()
    })

    test("can switch to Japanese", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await test.step("switch language to Japanese", async () => {
            await page.evaluate(() => {
                localStorage.setItem("canvas-a-i-o-locale", "ja")
            })
            await page.goto("/ja", { waitUntil: "networkidle" })
            await getIframe(page).waitFor({ state: "visible", timeout: 30000 })
        })

        await test.step("verify UI is in Japanese", async () => {
            await expect(page.locator('button:has-text("送信")')).toBeVisible({
                timeout: 10000,
            })
        })
    })

    test("can switch to Chinese", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await test.step("switch language to Chinese", async () => {
            await page.evaluate(() => {
                localStorage.setItem("canvas-a-i-o-locale", "zh")
            })
            await page.goto("/zh", { waitUntil: "networkidle" })
            await getIframe(page).waitFor({ state: "visible", timeout: 30000 })
        })

        await test.step("verify UI is in Chinese", async () => {
            await expect(page.locator('button:has-text("发送")')).toBeVisible({
                timeout: 10000,
            })
        })
    })

    test("language persists after reload", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await test.step("switch to Japanese", async () => {
            await page.evaluate(() => {
                localStorage.setItem("canvas-a-i-o-locale", "ja")
            })
            await page.goto("/ja", { waitUntil: "networkidle" })
            await getIframe(page).waitFor({ state: "visible", timeout: 30000 })
        })

        await test.step("verify Japanese before reload", async () => {
            await expect(page.locator('button:has-text("送信")')).toBeVisible({
                timeout: 10000,
            })
        })

        await test.step("reload and verify Japanese persists", async () => {
            await page.reload({ waitUntil: "networkidle" })
            await getIframe(page).waitFor({ state: "visible", timeout: 30000 })
            await expect(page.locator('button:has-text("送信")')).toBeVisible({
                timeout: 10000,
            })
        })
    })

    test("settings dialog shows language selector", async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await openSettings(page)
        const languageSelector = page.locator("#language-select")
        await expect(languageSelector).toBeVisible({ timeout: 5000 })
        await expect(languageSelector).toHaveText(/English/)
    })

    test("Japanese locale URL works", async ({ page }) => {
        await page.goto("/ja", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await expect(page.locator('button:has-text("送信")')).toBeVisible({
            timeout: 10000,
        })
    })

    test("Chinese locale URL works", async ({ page }) => {
        await page.goto("/zh", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await expect(page.locator('button:has-text("发送")')).toBeVisible({
            timeout: 10000,
        })
    })
})

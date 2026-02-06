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

        await test.step("open settings and select Japanese", async () => {
            await openSettings(page)
            const languageSelector = page.locator("#language-select")
            await languageSelector.waitFor({ state: "visible", timeout: 5000 })
            await languageSelector.click()
            const jaOption = page.locator(
                '[data-slot="select-item"]:has-text("日本語")',
            )
            await jaOption.waitFor({ state: "visible", timeout: 5000 })
            await jaOption.click()
            await page.waitForURL(/\/ja/, { timeout: 10000 })
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

        await test.step("open settings and select Chinese", async () => {
            await openSettings(page)
            const languageSelector = page.locator("#language-select")
            await languageSelector.waitFor({ state: "visible", timeout: 5000 })
            await languageSelector.click()
            const zhOption = page.locator(
                '[data-slot="select-item"]:has-text("中文")',
            )
            await zhOption.waitFor({ state: "visible", timeout: 5000 })
            await zhOption.click()
            await page.waitForURL(/\/zh/, { timeout: 10000 })
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
            await openSettings(page)
            const languageSelector = page.locator("#language-select")
            await languageSelector.waitFor({ state: "visible", timeout: 5000 })
            await languageSelector.click()
            const jaOption = page.locator(
                '[data-slot="select-item"]:has-text("日本語")',
            )
            await jaOption.waitFor({ state: "visible", timeout: 5000 })
            await jaOption.click()
            await page.waitForURL(/\/ja/, { timeout: 10000 })
            await page.keyboard.press("Escape")
        })

        await test.step("verify Japanese before reload", async () => {
            await expect(page.locator('button:has-text("送信")')).toBeVisible({
                timeout: 10000,
            })
        })

        await test.step("reload and verify Japanese persists", async () => {
            await page.reload({ waitUntil: "networkidle" })
            await getIframe(page).waitFor({ state: "visible", timeout: 30000 })
            await page.waitForLoadState("networkidle")
            await expect(page.locator('button:has-text("送信")')).toBeVisible({
                timeout: 10000,
            })
        })
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

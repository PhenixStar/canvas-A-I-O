// Centralized localStorage keys for quota tracking and settings
// Chat data is now stored in IndexedDB via session-storage.ts

export const STORAGE_KEYS = {
    // Quota tracking
    requestCount: "canvas-a-i-o-request-count",
    requestDate: "canvas-a-i-o-request-date",
    tokenCount: "canvas-a-i-o-token-count",
    tokenDate: "canvas-a-i-o-token-date",
    tpmCount: "canvas-a-i-o-tpm-count",
    tpmMinute: "canvas-a-i-o-tpm-minute",

    // Settings
    accessCode: "canvas-a-i-o-access-code",
    accessCodeRequired: "canvas-a-i-o-access-code-required",
    aiProvider: "canvas-a-i-o-ai-provider",
    aiBaseUrl: "canvas-a-i-o-ai-base-url",
    aiApiKey: "canvas-a-i-o-ai-api-key",
    aiModel: "canvas-a-i-o-ai-model",

    // Multi-model configuration
    modelConfigs: "canvas-a-i-o-model-configs",
    selectedModelId: "canvas-a-i-o-selected-model-id",

    // Chat input preferences
    sendShortcut: "canvas-a-i-o-send-shortcut",

    // Diagram validation
    vlmValidationEnabled: "canvas-a-i-o-vlm-validation-enabled",
} as const

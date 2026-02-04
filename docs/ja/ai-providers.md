# AIãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã®è¨­å®š

ã“ã®ã‚¬ã‚¤ãƒ‰ã§ã¯ã€canvas-a-i-o ã§ã•ã¾ã–ã¾ãª AI ãƒ¢ãƒ‡ãƒ«ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã‚’è¨­å®šã™ã‚‹æ–¹æ³•ã«ã¤ã„ã¦èª¬æ˜Žã—ã¾ã™ã€‚

## ã‚¯ã‚¤ãƒƒã‚¯ã‚¹ã‚¿ãƒ¼ãƒˆ

1. `.env.example` ã‚’ `.env.local` ã«ã‚³ãƒ”ãƒ¼ã—ã¾ã™
2. é¸æŠžã—ãŸãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã® API ã‚­ãƒ¼ã‚’è¨­å®šã—ã¾ã™
3. `AI_MODEL` ã‚’å¸Œæœ›ã®ãƒ¢ãƒ‡ãƒ«ã«è¨­å®šã—ã¾ã™
4. `npm run dev` ã‚’å®Ÿè¡Œã—ã¾ã™

## å¯¾å¿œãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼

### Doubao (ByteDance Volcengine)

> **ç„¡æ–™ãƒˆãƒ¼ã‚¯ãƒ³**: [Volcengine ARK ãƒ—ãƒ©ãƒƒãƒˆãƒ•ã‚©ãƒ¼ãƒ ](https://www.volcengine.com/activity/newyear-referral?utm_campaign=doubao&utm_content=aidrawio&utm_medium=github&utm_source=coopensrc&utm_term=project)ã«ç™»éŒ²ã™ã‚‹ã¨ã€ã™ã¹ã¦ã®ãƒ¢ãƒ‡ãƒ«ã§ä½¿ãˆã‚‹50ä¸‡ãƒˆãƒ¼ã‚¯ãƒ³ãŒç„¡æ–™ã§å…¥æ‰‹ã§ãã¾ã™ï¼

```bash
DOUBAO_API_KEY=your_api_key
AI_MODEL=doubao-seed-1-8-251215  # ã¾ãŸã¯ä»–ã® Doubao ãƒ¢ãƒ‡ãƒ«
```

### Google Gemini

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
AI_MODEL=gemini-2.0-flash
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
GOOGLE_BASE_URL=https://your-custom-endpoint
```

### OpenAI

```bash
OPENAI_API_KEY=your_api_key
AI_MODEL=gpt-4o
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆï¼ˆOpenAI äº’æ›ã‚µãƒ¼ãƒ“ã‚¹ç”¨ï¼‰:

```bash
OPENAI_BASE_URL=https://your-custom-endpoint/v1
```

### Anthropic

```bash
ANTHROPIC_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-5-20250514
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
ANTHROPIC_BASE_URL=https://your-custom-endpoint
```

### DeepSeek

```bash
DEEPSEEK_API_KEY=your_api_key
AI_MODEL=deepseek-chat
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
DEEPSEEK_BASE_URL=https://your-custom-endpoint
```

### SiliconFlow (OpenAI äº’æ›)

```bash
SILICONFLOW_API_KEY=your_api_key
AI_MODEL=deepseek-ai/DeepSeek-V3  # ä¾‹; ä»»æ„ã® SiliconFlow ãƒ¢ãƒ‡ãƒ« ID ã‚’ä½¿ç”¨
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆï¼ˆãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã¯æŽ¨å¥¨ãƒ‰ãƒ¡ã‚¤ãƒ³ï¼‰:

```bash
SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1  # ã¾ãŸã¯ https://api.siliconflow.cn/v1
```

### SGLang

```bash
SGLANG_API_KEY=your_api_key
AI_MODEL=your_model_id
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
SGLANG_BASE_URL=https://your-custom-endpoint/v1
```

### Azure OpenAI

```bash
AZURE_API_KEY=your_api_key
AZURE_RESOURCE_NAME=your-resource-name  # å¿…é ˆ: Azure ãƒªã‚½ãƒ¼ã‚¹å
AI_MODEL=your-deployment-name
```

ã¾ãŸã¯ãƒªã‚½ãƒ¼ã‚¹åã®ä»£ã‚ã‚Šã«ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆã‚’ä½¿ç”¨:

```bash
AZURE_API_KEY=your_api_key
AZURE_BASE_URL=https://your-resource.openai.azure.com  # AZURE_RESOURCE_NAME ã®ä»£æ›¿
AI_MODEL=your-deployment-name
```

ä»»æ„ã®æŽ¨è«–è¨­å®š:

```bash
AZURE_REASONING_EFFORT=low      # ä»»æ„: low, medium, high
AZURE_REASONING_SUMMARY=detailed  # ä»»æ„: none, brief, detailed
```

### AWS Bedrock

```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AI_MODEL=anthropic.claude-sonnet-4-5-20250514-v1:0
```

æ³¨: AWS ä¸Šï¼ˆIAM ãƒ­ãƒ¼ãƒ«ã‚’æŒã¤ Lambda ã‚„ EC2ï¼‰ã§ã¯ã€èªè¨¼æƒ…å ±ã¯ IAM ãƒ­ãƒ¼ãƒ«ã‹ã‚‰è‡ªå‹•çš„ã«å–å¾—ã•ã‚Œã¾ã™ã€‚

### OpenRouter

```bash
OPENROUTER_API_KEY=your_api_key
AI_MODEL=anthropic/claude-sonnet-4
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
OPENROUTER_BASE_URL=https://your-custom-endpoint
```

### Ollama (ãƒ­ãƒ¼ã‚«ãƒ«)

```bash
AI_PROVIDER=ollama
AI_MODEL=llama3.2
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ  URL:

```bash
OLLAMA_BASE_URL=http://localhost:11434
```

### ModelScope

```bash
MODELSCOPE_API_KEY=your_api_key
AI_MODEL=Qwen/Qwen3-235B-A22B-Instruct-2507
```

ä»»æ„ã®ã‚«ã‚¹ã‚¿ãƒ ã‚¨ãƒ³ãƒ‰ãƒã‚¤ãƒ³ãƒˆ:

```bash
MODELSCOPE_BASE_URL=https://your-custom-endpoint
```

### Vercel AI Gateway

Vercel AI Gateway ã¯ã€å˜ä¸€ã® API ã‚­ãƒ¼ã§è¤‡æ•°ã® AI ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã¸ã®çµ±åˆã‚¢ã‚¯ã‚»ã‚¹ã‚’æä¾›ã—ã¾ã™ã€‚ã“ã‚Œã«ã‚ˆã‚Šèªè¨¼ãŒç°¡ç´ åŒ–ã•ã‚Œã€è¤‡æ•°ã® API ã‚­ãƒ¼ã‚’ç®¡ç†ã™ã‚‹ã“ã¨ãªããƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã‚’åˆ‡ã‚Šæ›¿ãˆã‚‹ã“ã¨ãŒã§ãã¾ã™ã€‚

**åŸºæœ¬çš„ãªä½¿ç”¨æ³• (Vercel ãƒ›ã‚¹ãƒˆã® Gateway):**

```bash
AI_GATEWAY_API_KEY=your_gateway_api_key
AI_MODEL=openai/gpt-4o
```

**ã‚«ã‚¹ã‚¿ãƒ  Gateway URL (ãƒ­ãƒ¼ã‚«ãƒ«é–‹ç™ºã¾ãŸã¯ã‚»ãƒ«ãƒ•ãƒ›ã‚¹ãƒˆ Gateway ç”¨):**

```bash
AI_GATEWAY_API_KEY=your_custom_api_key
AI_GATEWAY_BASE_URL=https://your-custom-gateway.com/v1/ai
AI_MODEL=openai/gpt-4o
```

ãƒ¢ãƒ‡ãƒ«å½¢å¼ã¯ `provider/model` æ§‹æ–‡ã‚’ä½¿ç”¨ã—ã¾ã™:

-   `openai/gpt-4o` - OpenAI GPT-4o
-   `anthropic/claude-sonnet-4-5` - Anthropic Claude Sonnet 4.5
-   `google/gemini-2.0-flash` - Google Gemini 2.0 Flash

**è¨­å®šã«é–¢ã™ã‚‹æ³¨æ„ç‚¹:**

-   `AI_GATEWAY_BASE_URL` ãŒè¨­å®šã•ã‚Œã¦ã„ãªã„å ´åˆã€ãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã® Vercel Gateway URL (`https://ai-gateway.vercel.sh/v1/ai`) ãŒä½¿ç”¨ã•ã‚Œã¾ã™
-   ã‚«ã‚¹ã‚¿ãƒ ãƒ™ãƒ¼ã‚¹ URL ã¯ä»¥ä¸‹ã®å ´åˆã«ä¾¿åˆ©ã§ã™:
    -   ã‚«ã‚¹ã‚¿ãƒ  Gateway ã‚¤ãƒ³ã‚¹ã‚¿ãƒ³ã‚¹ã‚’ä½¿ç”¨ã—ãŸãƒ­ãƒ¼ã‚«ãƒ«é–‹ç™º
    -   ã‚»ãƒ«ãƒ•ãƒ›ã‚¹ãƒˆ AI Gateway ãƒ‡ãƒ—ãƒ­ã‚¤ãƒ¡ãƒ³ãƒˆ
    -   ã‚¨ãƒ³ã‚¿ãƒ¼ãƒ—ãƒ©ã‚¤ã‚ºãƒ—ãƒ­ã‚­ã‚·è¨­å®š
-   ã‚«ã‚¹ã‚¿ãƒ ãƒ™ãƒ¼ã‚¹ URL ã‚’ä½¿ç”¨ã™ã‚‹å ´åˆã€`AI_GATEWAY_API_KEY` ã‚‚æŒ‡å®šã™ã‚‹å¿…è¦ãŒã‚ã‚Šã¾ã™

[Vercel AI Gateway ãƒ€ãƒƒã‚·ãƒ¥ãƒœãƒ¼ãƒ‰](https://vercel.com/ai-gateway)ã‹ã‚‰ API ã‚­ãƒ¼ã‚’å–å¾—ã—ã¦ãã ã•ã„ã€‚

## è‡ªå‹•æ¤œå‡º

**1ã¤**ã®ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã® API ã‚­ãƒ¼ã®ã¿ã‚’è¨­å®šã—ãŸå ´åˆã€ã‚·ã‚¹ãƒ†ãƒ ã¯ãã®ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã‚’è‡ªå‹•çš„ã«æ¤œå‡ºã—ã¦ä½¿ç”¨ã—ã¾ã™ã€‚`AI_PROVIDER` ã‚’è¨­å®šã™ã‚‹å¿…è¦ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚

**è¤‡æ•°**ã® API ã‚­ãƒ¼ã‚’è¨­å®šã™ã‚‹å ´åˆã¯ã€`AI_PROVIDER` ã‚’æ˜Žç¤ºçš„ã«è¨­å®šã™ã‚‹å¿…è¦ãŒã‚ã‚Šã¾ã™:

```bash
AI_PROVIDER=google  # ã¾ãŸã¯: openai, anthropic, deepseek, siliconflow, doubao, azure, bedrock, openrouter, ollama, gateway, sglang
```

## ã‚µãƒ¼ãƒãƒ¼ã‚µã‚¤ãƒ‰ãƒžãƒ«ãƒãƒ¢ãƒ‡ãƒ«è¨­å®š

ç®¡ç†è€…ã¯ã€ãƒ¦ãƒ¼ã‚¶ãƒ¼ãŒå€‹äººã®APIã‚­ãƒ¼ã‚’æä¾›ã™ã‚‹ã“ã¨ãªãåˆ©ç”¨ã§ãã‚‹è¤‡æ•°ã®ã‚µãƒ¼ãƒãƒ¼ã‚µã‚¤ãƒ‰ãƒ¢ãƒ‡ãƒ«ã‚’è¨­å®šã§ãã¾ã™ã€‚

### è¨­å®šæ–¹æ³•

**æ–¹æ³•1ï¼šç’°å¢ƒå¤‰æ•°**ï¼ˆã‚¯ãƒ©ã‚¦ãƒ‰ãƒ‡ãƒ—ãƒ­ã‚¤æŽ¨å¥¨ï¼‰

`AI_MODELS_CONFIG` ã‚’JSONæ–‡å­—åˆ—ã¨ã—ã¦è¨­å®šï¼š

```bash
AI_MODELS_CONFIG='{"providers":[{"name":"OpenAI","provider":"openai","models":["gpt-4o"],"default":true}]}'
```

**æ–¹æ³•2ï¼šè¨­å®šãƒ•ã‚¡ã‚¤ãƒ«**

ãƒ—ãƒ­ã‚¸ã‚§ã‚¯ãƒˆãƒ«ãƒ¼ãƒˆã« `ai-models.json` ãƒ•ã‚¡ã‚¤ãƒ«ã‚’ä½œæˆã—ã¾ã™ï¼ˆã¾ãŸã¯ `AI_MODELS_CONFIG_PATH` ã§ãƒ‘ã‚¹ã‚’æŒ‡å®šï¼‰ã€‚

### è¨­å®šä¾‹

```json
{
  "providers": [
    {
      "name": "OpenAI Production",
      "provider": "openai",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "default": true
    },
    {
      "name": "Custom DeepSeek",
      "provider": "deepseek",
      "models": ["deepseek-chat"],
      "apiKeyEnv": "MY_DEEPSEEK_KEY",
      "baseUrlEnv": "MY_DEEPSEEK_URL"
    }
  ]
}
```

### ãƒ•ã‚£ãƒ¼ãƒ«ãƒ‰èª¬æ˜Ž

| ãƒ•ã‚£ãƒ¼ãƒ«ãƒ‰ | å¿…é ˆ | èª¬æ˜Ž |
|------------|------|------|
| `name` | ã¯ã„ | è¡¨ç¤ºåï¼ˆåŒä¸€ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã®è¤‡æ•°è¨­å®šã‚’ã‚µãƒãƒ¼ãƒˆï¼‰ |
| `provider` | ã¯ã„ | ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã‚¿ã‚¤ãƒ—ï¼ˆ`openai`, `anthropic`, `google`, `bedrock` ãªã©ï¼‰ |
| `models` | ã¯ã„ | ãƒ¢ãƒ‡ãƒ«IDã®ãƒªã‚¹ãƒˆ |
| `default` | ã„ã„ãˆ | `true` ã«è¨­å®šã™ã‚‹ã¨ã€ãã®ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã®æœ€åˆã®ãƒ¢ãƒ‡ãƒ«ãŒãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã§é¸æŠžã•ã‚Œã¾ã™ |
| `apiKeyEnv` | ã„ã„ãˆ | ã‚«ã‚¹ã‚¿ãƒ APIã‚­ãƒ¼ç’°å¢ƒå¤‰æ•°åï¼ˆãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã¯ `OPENAI_API_KEY` ãªã©ã®æ¨™æº–å¤‰æ•°ï¼‰ |
| `baseUrlEnv` | ã„ã„ãˆ | ã‚«ã‚¹ã‚¿ãƒ Base URLç’°å¢ƒå¤‰æ•°å |

### å‚™è€ƒ

- APIã‚­ãƒ¼ã¨èªè¨¼æƒ…å ±ã¯ç’°å¢ƒå¤‰æ•°ã§æä¾›ã—ã¾ã™ã€‚ãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã¯æ¨™æº–å¤‰æ•°åï¼ˆä¾‹ï¼š`OPENAI_API_KEY`ï¼‰ã‚’ä½¿ç”¨ã—ã¾ã™ãŒã€`apiKeyEnv` ã§ã‚«ã‚¹ã‚¿ãƒ å¤‰æ•°åã‚’æŒ‡å®šã§ãã¾ã™ã€‚
- `name` ãƒ•ã‚£ãƒ¼ãƒ«ãƒ‰ã«ã‚ˆã‚ŠåŒä¸€ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã®è¤‡æ•°è¨­å®šãŒå¯èƒ½ã§ã™ï¼ˆä¾‹ï¼šã€ŒOpenAI Productionã€ã¨ã€ŒOpenAI Stagingã€ãŒä¸¡æ–¹ã¨ã‚‚ `provider: "openai"` ã‚’ä½¿ç”¨ã—ã¤ã¤ã€ç•°ãªã‚‹ `apiKeyEnv` ã‚’æŒã¤ï¼‰ã€‚
- è¨­å®šãŒå­˜åœ¨ã—ãªã„å ´åˆã€ã‚¢ãƒ—ãƒªã¯ `AI_PROVIDER`/`AI_MODEL` ç’°å¢ƒå¤‰æ•°è¨­å®šã«ãƒ•ã‚©ãƒ¼ãƒ«ãƒãƒƒã‚¯ã—ã¾ã™ã€‚

## ãƒ¢ãƒ‡ãƒ«æ€§èƒ½è¦ä»¶

ã“ã®ã‚¿ã‚¹ã‚¯ã¯ã€åŽ³å¯†ãªãƒ•ã‚©ãƒ¼ãƒžãƒƒãƒˆåˆ¶ç´„ï¼ˆdraw.io XMLï¼‰ã‚’ä¼´ã†é•·æ–‡ãƒ†ã‚­ã‚¹ãƒˆã®ç”Ÿæˆã‚’å«ã‚€ãŸã‚ã€éžå¸¸ã«å¼·åŠ›ãªãƒ¢ãƒ‡ãƒ«æ€§èƒ½ãŒå¿…è¦ã§ã™ã€‚

**æŽ¨å¥¨ãƒ¢ãƒ‡ãƒ«**:

-   Claude Sonnet 4.5 / Opus 4.5

**Ollama ã«é–¢ã™ã‚‹æ³¨æ„**: Ollama ã¯ãƒ—ãƒ­ãƒã‚¤ãƒ€ãƒ¼ã¨ã—ã¦ã‚µãƒãƒ¼ãƒˆã•ã‚Œã¦ã„ã¾ã™ãŒã€DeepSeek R1 ã‚„ Qwen3-235B ã®ã‚ˆã†ãªé«˜æ€§èƒ½ãƒ¢ãƒ‡ãƒ«ã‚’ãƒ­ãƒ¼ã‚«ãƒ«ã§å®Ÿè¡Œã—ã¦ã„ãªã„é™ã‚Šã€ã“ã®ãƒ¦ãƒ¼ã‚¹ã‚±ãƒ¼ã‚¹ã§ã¯ä¸€èˆ¬çš„ã«å®Ÿç”¨çš„ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚

## Temperatureï¼ˆæ¸©åº¦ï¼‰è¨­å®š

ç’°å¢ƒå¤‰æ•°ã§ Temperature ã‚’ä»»æ„ã«è¨­å®šã§ãã¾ã™:

```bash
TEMPERATURE=0  # ã‚ˆã‚Šæ±ºå®šè«–çš„ãªå‡ºåŠ›ï¼ˆãƒ€ã‚¤ã‚¢ã‚°ãƒ©ãƒ ã«æŽ¨å¥¨ï¼‰
```

**é‡è¦**: ä»¥ä¸‹ã® Temperature è¨­å®šã‚’ã‚µãƒãƒ¼ãƒˆã—ã¦ã„ãªã„ãƒ¢ãƒ‡ãƒ«ã§ã¯ã€`TEMPERATURE` ã‚’æœªè¨­å®šã®ã¾ã¾ã«ã—ã¦ãã ã•ã„:
- GPT-5.1 ãŠã‚ˆã³ãã®ä»–ã®æŽ¨è«–ãƒ¢ãƒ‡ãƒ«
- ä¸€éƒ¨ã®ç‰¹æ®Šãªãƒ¢ãƒ‡ãƒ«

æœªè¨­å®šã®å ´åˆã€ãƒ¢ãƒ‡ãƒ«ã¯ãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã®æŒ™å‹•ã‚’ä½¿ç”¨ã—ã¾ã™ã€‚

## æŽ¨å¥¨äº‹é …

-   **æœ€é«˜ã®ä½“é¨“**: ç”»åƒã‹ã‚‰ãƒ€ã‚¤ã‚¢ã‚°ãƒ©ãƒ ã‚’ç”Ÿæˆã™ã‚‹æ©Ÿèƒ½ã«ã¯ã€ãƒ“ã‚¸ãƒ§ãƒ³ï¼ˆç”»åƒèªè­˜ï¼‰ã‚’ã‚µãƒãƒ¼ãƒˆã™ã‚‹ãƒ¢ãƒ‡ãƒ«ï¼ˆGPT-4o, Claude, Geminiï¼‰ã‚’ä½¿ç”¨ã—ã¦ãã ã•ã„
-   **ä½Žã‚³ã‚¹ãƒˆ**: DeepSeek ã¯ç«¶äº‰åŠ›ã®ã‚ã‚‹ä¾¡æ ¼ã‚’æä¾›ã—ã¦ã„ã¾ã™
-   **ãƒ—ãƒ©ã‚¤ãƒã‚·ãƒ¼**: å®Œå…¨ã«ãƒ­ãƒ¼ã‚«ãƒ«ãªã‚ªãƒ•ãƒ©ã‚¤ãƒ³æ“ä½œã«ã¯ Ollama ã‚’ä½¿ç”¨ã—ã¦ãã ã•ã„ï¼ˆå¼·åŠ›ãªãƒãƒ¼ãƒ‰ã‚¦ã‚§ã‚¢ãŒå¿…è¦ã§ã™ï¼‰
-   **æŸ”è»Ÿæ€§**: OpenRouter ã¯å˜ä¸€ã® API ã§å¤šæ•°ã®ãƒ¢ãƒ‡ãƒ«ã¸ã®ã‚¢ã‚¯ã‚»ã‚¹ã‚’æä¾›ã—ã¾ã™

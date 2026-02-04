# AI æä¾›å•†é…ç½®

æœ¬æŒ‡å—ä»‹ç»å¦‚ä½•ä¸º canvas-a-i-o é…ç½®ä¸åŒçš„ AI æ¨¡åž‹æä¾›å•†ã€‚

## å¿«é€Ÿå¼€å§‹

1. å°† `.env.example` å¤åˆ¶ä¸º `.env.local`
2. è®¾ç½®æ‰€é€‰æä¾›å•†çš„ API å¯†é’¥
3. å°† `AI_MODEL` è®¾ç½®ä¸ºæ‰€éœ€çš„æ¨¡åž‹
4. è¿è¡Œ `npm run dev`

## æ”¯æŒçš„æä¾›å•†

### è±†åŒ… (å­—èŠ‚è·³åŠ¨ç«å±±å¼•æ“Ž)

> **å…è´¹ Token**ï¼šåœ¨ [ç«å±±å¼•æ“Ž ARK å¹³å°](https://www.volcengine.com/activity/newyear-referral?utm_campaign=doubao&utm_content=aidrawio&utm_medium=github&utm_source=coopensrc&utm_term=project) æ³¨å†Œï¼Œå³å¯èŽ·å¾—æ‰€æœ‰æ¨¡åž‹ 50 ä¸‡å…è´¹ Tokenï¼

```bash
DOUBAO_API_KEY=your_api_key
AI_MODEL=doubao-seed-1-8-251215  # æˆ–å…¶ä»–è±†åŒ…æ¨¡åž‹
```

### Google Gemini

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
AI_MODEL=gemini-2.0-flash
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
GOOGLE_BASE_URL=https://your-custom-endpoint
```

### OpenAI

```bash
OPENAI_API_KEY=your_api_key
AI_MODEL=gpt-4o
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼ˆç”¨äºŽ OpenAI å…¼å®¹æœåŠ¡ï¼‰ï¼š

```bash
OPENAI_BASE_URL=https://your-custom-endpoint/v1
```

### Anthropic

```bash
ANTHROPIC_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-5-20250514
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
ANTHROPIC_BASE_URL=https://your-custom-endpoint
```

### DeepSeek

```bash
DEEPSEEK_API_KEY=your_api_key
AI_MODEL=deepseek-chat
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
DEEPSEEK_BASE_URL=https://your-custom-endpoint
```

### SiliconFlow (OpenAI å…¼å®¹)

```bash
SILICONFLOW_API_KEY=your_api_key
AI_MODEL=deepseek-ai/DeepSeek-V3  # ç¤ºä¾‹ï¼›ä½¿ç”¨ä»»ä½• SiliconFlow æ¨¡åž‹ ID
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼ˆé»˜è®¤ä¸ºæŽ¨èåŸŸåï¼‰ï¼š

```bash
SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1  # æˆ– https://api.siliconflow.cn/v1
```

### SGLang

```bash
SGLANG_API_KEY=your_api_key
AI_MODEL=your_model_id
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
SGLANG_BASE_URL=https://your-custom-endpoint/v1
```

### Azure OpenAI

```bash
AZURE_API_KEY=your_api_key
AZURE_RESOURCE_NAME=your-resource-name  # å¿…å¡«ï¼šæ‚¨çš„ Azure èµ„æºåç§°
AI_MODEL=your-deployment-name
```

æˆ–è€…ä½¿ç”¨è‡ªå®šä¹‰ç«¯ç‚¹ä»£æ›¿èµ„æºåç§°ï¼š

```bash
AZURE_API_KEY=your_api_key
AZURE_BASE_URL=https://your-resource.openai.azure.com  # AZURE_RESOURCE_NAME çš„æ›¿ä»£æ–¹æ¡ˆ
AI_MODEL=your-deployment-name
```

å¯é€‰çš„æŽ¨ç†é…ç½®ï¼š

```bash
AZURE_REASONING_EFFORT=low      # å¯é€‰ï¼šlow, medium, high
AZURE_REASONING_SUMMARY=detailed  # å¯é€‰ï¼šnone, brief, detailed
```

### AWS Bedrock

```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AI_MODEL=anthropic.claude-sonnet-4-5-20250514-v1:0
```

æ³¨æ„ï¼šåœ¨ AWS çŽ¯å¢ƒï¼ˆLambdaã€å¸¦æœ‰ IAM è§’è‰²çš„ EC2ï¼‰ä¸­ï¼Œå‡­è¯ä¼šè‡ªåŠ¨ä»Ž IAM è§’è‰²èŽ·å–ã€‚

### OpenRouter

```bash
OPENROUTER_API_KEY=your_api_key
AI_MODEL=anthropic/claude-sonnet-4
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
OPENROUTER_BASE_URL=https://your-custom-endpoint
```

### Ollama (æœ¬åœ°)

```bash
AI_PROVIDER=ollama
AI_MODEL=llama3.2
```

### ModelScope

```bash
MODELSCOPE_API_KEY=your_api_key
AI_MODEL=Qwen/Qwen3-235B-A22B-Instruct-2507
```

å¯é€‰çš„è‡ªå®šä¹‰ç«¯ç‚¹ï¼š

```bash
MODELSCOPE_BASE_URL=https://your-custom-endpoint
```

å¯é€‰çš„è‡ªå®šä¹‰ URLï¼š

```bash
OLLAMA_BASE_URL=http://localhost:11434
```

### Vercel AI Gateway

Vercel AI Gateway é€šè¿‡å•ä¸ª API å¯†é’¥æä¾›å¯¹å¤šä¸ª AI æä¾›å•†çš„ç»Ÿä¸€è®¿é—®ã€‚è¿™ç®€åŒ–äº†èº«ä»½éªŒè¯ï¼Œè®©æ‚¨æ— éœ€ç®¡ç†å¤šä¸ª API å¯†é’¥å³å¯åœ¨ä¸åŒæä¾›å•†ä¹‹é—´åˆ‡æ¢ã€‚

**åŸºæœ¬ç”¨æ³•ï¼ˆVercel æ‰˜ç®¡ç½‘å…³ï¼‰ï¼š**

```bash
AI_GATEWAY_API_KEY=your_gateway_api_key
AI_MODEL=openai/gpt-4o
```

**è‡ªå®šä¹‰ç½‘å…³ URLï¼ˆç”¨äºŽæœ¬åœ°å¼€å‘æˆ–è‡ªæ‰˜ç®¡ç½‘å…³ï¼‰ï¼š**

```bash
AI_GATEWAY_API_KEY=your_custom_api_key
AI_GATEWAY_BASE_URL=https://your-custom-gateway.com/v1/ai
AI_MODEL=openai/gpt-4o
```

æ¨¡åž‹æ ¼å¼ä½¿ç”¨ `provider/model` è¯­æ³•ï¼š

-   `openai/gpt-4o` - OpenAI GPT-4o
-   `anthropic/claude-sonnet-4-5` - Anthropic Claude Sonnet 4.5
-   `google/gemini-2.0-flash` - Google Gemini 2.0 Flash

**é…ç½®è¯´æ˜Žï¼š**

-   å¦‚æžœæœªè®¾ç½® `AI_GATEWAY_BASE_URL`ï¼Œåˆ™ä½¿ç”¨é»˜è®¤çš„ Vercel Gateway URL (`https://ai-gateway.vercel.sh/v1/ai`)
-   è‡ªå®šä¹‰åŸºç¡€ URL é€‚ç”¨äºŽï¼š
    -   ä½¿ç”¨è‡ªå®šä¹‰ç½‘å…³å®žä¾‹è¿›è¡Œæœ¬åœ°å¼€å‘
    -   è‡ªæ‰˜ç®¡ AI Gateway éƒ¨ç½²
    -   ä¼ä¸šä»£ç†é…ç½®
-   å½“ä½¿ç”¨è‡ªå®šä¹‰åŸºç¡€ URL æ—¶ï¼Œå¿…é¡»åŒæ—¶æä¾› `AI_GATEWAY_API_KEY`

ä»Ž [Vercel AI Gateway ä»ªè¡¨æ¿](https://vercel.com/ai-gateway) èŽ·å–æ‚¨çš„ API å¯†é’¥ã€‚

## è‡ªåŠ¨æ£€æµ‹

å¦‚æžœæ‚¨åªé…ç½®äº†**ä¸€ä¸ª**æä¾›å•†çš„ API å¯†é’¥ï¼Œç³»ç»Ÿå°†è‡ªåŠ¨æ£€æµ‹å¹¶ä½¿ç”¨è¯¥æä¾›å•†ã€‚æ— éœ€è®¾ç½® `AI_PROVIDER`ã€‚

å¦‚æžœæ‚¨é…ç½®äº†**å¤šä¸ª** API å¯†é’¥ï¼Œåˆ™å¿…é¡»æ˜¾å¼è®¾ç½® `AI_PROVIDER`ï¼š

```bash
AI_PROVIDER=google  # æˆ–ï¼šopenai, anthropic, deepseek, siliconflow, doubao, azure, bedrock, openrouter, ollama, gateway, sglang
```

## æœåŠ¡ç«¯å¤šæ¨¡åž‹é…ç½®

ç®¡ç†å‘˜å¯ä»¥é…ç½®å¤šä¸ªæœåŠ¡ç«¯æ¨¡åž‹ï¼Œè®©æ‰€æœ‰ç”¨æˆ·æ— éœ€æä¾›ä¸ªäºº API Key å³å¯ä½¿ç”¨ã€‚

### é…ç½®æ–¹å¼

**æ–¹å¼ä¸€ï¼šçŽ¯å¢ƒå˜é‡**ï¼ˆæŽ¨èç”¨äºŽäº‘éƒ¨ç½²ï¼‰

è®¾ç½® `AI_MODELS_CONFIG` ä¸º JSON å­—ç¬¦ä¸²ï¼š

```bash
AI_MODELS_CONFIG='{"providers":[{"name":"OpenAI","provider":"openai","models":["gpt-4o"],"default":true}]}'
```

**æ–¹å¼äºŒï¼šé…ç½®æ–‡ä»¶**

åœ¨é¡¹ç›®æ ¹ç›®å½•åˆ›å»º `ai-models.json` æ–‡ä»¶ï¼ˆæˆ–é€šè¿‡ `AI_MODELS_CONFIG_PATH` æŒ‡å®šè·¯å¾„ï¼‰ã€‚

### é…ç½®ç¤ºä¾‹

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

### å­—æ®µè¯´æ˜Ž

| å­—æ®µ | å¿…å¡« | è¯´æ˜Ž |
|------|------|------|
| `name` | æ˜¯ | æ˜¾ç¤ºåç§°ï¼ˆæ”¯æŒåŒä¸€æä¾›å•†å¤šä¸ªé…ç½®ï¼‰ |
| `provider` | æ˜¯ | æä¾›å•†ç±»åž‹ï¼ˆ`openai`, `anthropic`, `google`, `bedrock` ç­‰ï¼‰ |
| `models` | æ˜¯ | æ¨¡åž‹ ID åˆ—è¡¨ |
| `default` | å¦ | è®¾ä¸º `true` è¡¨ç¤ºé»˜è®¤é€‰ä¸­è¯¥æä¾›å•†çš„ç¬¬ä¸€ä¸ªæ¨¡åž‹ |
| `apiKeyEnv` | å¦ | è‡ªå®šä¹‰ API Key çŽ¯å¢ƒå˜é‡åï¼ˆé»˜è®¤ä½¿ç”¨æä¾›å•†æ ‡å‡†å˜é‡å¦‚ `OPENAI_API_KEY`ï¼‰ |
| `baseUrlEnv` | å¦ | è‡ªå®šä¹‰ Base URL çŽ¯å¢ƒå˜é‡å |

### è¯´æ˜Ž

- API Key å’Œå‡­è¯é€šè¿‡çŽ¯å¢ƒå˜é‡æä¾›ã€‚é»˜è®¤ä½¿ç”¨æ ‡å‡†å˜é‡åï¼ˆå¦‚ `OPENAI_API_KEY`ï¼‰ï¼Œä¹Ÿå¯é€šè¿‡ `apiKeyEnv` æŒ‡å®šè‡ªå®šä¹‰å˜é‡åã€‚
- `name` å­—æ®µå…è®¸åŒä¸€æä¾›å•†å¤šä¸ªé…ç½®ï¼ˆä¾‹å¦‚ "OpenAI Production" å’Œ "OpenAI Staging" éƒ½ä½¿ç”¨ `provider: "openai"` ä½† `apiKeyEnv` ä¸åŒï¼‰ã€‚
- å¦‚æžœé…ç½®ä¸å­˜åœ¨ï¼Œåº”ç”¨ä¼šå›žé€€åˆ° `AI_PROVIDER`/`AI_MODEL` çŽ¯å¢ƒå˜é‡é…ç½®ã€‚

## æ¨¡åž‹èƒ½åŠ›è¦æ±‚

æ­¤ä»»åŠ¡å¯¹æ¨¡åž‹èƒ½åŠ›è¦æ±‚æžé«˜ï¼Œå› ä¸ºå®ƒæ¶‰åŠç”Ÿæˆå…·æœ‰ä¸¥æ ¼æ ¼å¼çº¦æŸï¼ˆdraw.io XMLï¼‰çš„é•¿æ–‡æœ¬ã€‚

**æŽ¨èæ¨¡åž‹**ï¼š

-   Claude Sonnet 4.5 / Opus 4.5

**å…³äºŽ Ollama çš„è¯´æ˜Ž**ï¼šè™½ç„¶æ”¯æŒå°† Ollama ä½œä¸ºæä¾›å•†ï¼Œä½†é™¤éžæ‚¨åœ¨æœ¬åœ°è¿è¡Œåƒ DeepSeek R1 æˆ– Qwen3-235B è¿™æ ·çš„é«˜æ€§èƒ½æ¨¡åž‹ï¼Œå¦åˆ™å¯¹äºŽæ­¤ç”¨ä¾‹é€šå¸¸ä¸å¤ªå®žç”¨ã€‚

## æ¸©åº¦è®¾ç½® (Temperature)

æ‚¨å¯ä»¥é€šè¿‡çŽ¯å¢ƒå˜é‡é€‰æ‹©æ€§åœ°é…ç½®æ¸©åº¦ï¼š

```bash
TEMPERATURE=0  # è¾“å‡ºæ›´å…·ç¡®å®šæ€§ï¼ˆæŽ¨èç”¨äºŽå›¾è¡¨ï¼‰
```

**é‡è¦æç¤º**ï¼šå¯¹äºŽä¸æ”¯æŒæ¸©åº¦è®¾ç½®çš„æ¨¡åž‹ï¼ˆä¾‹å¦‚ä»¥ä¸‹æ¨¡åž‹ï¼‰ï¼Œè¯·å‹¿è®¾ç½® `TEMPERATURE`ï¼š
- GPT-5.1 å’Œå…¶ä»–æŽ¨ç†æ¨¡åž‹
- æŸäº›ä¸“ç”¨æ¨¡åž‹

æœªè®¾ç½®æ—¶ï¼Œæ¨¡åž‹å°†ä½¿ç”¨å…¶é»˜è®¤è¡Œä¸ºã€‚

## æŽ¨è

-   **æœ€ä½³ä½“éªŒ**ï¼šä½¿ç”¨æ”¯æŒè§†è§‰çš„æ¨¡åž‹ï¼ˆGPT-4o, Claude, Geminiï¼‰ä»¥èŽ·å¾—å›¾åƒè½¬å›¾è¡¨åŠŸèƒ½
-   **ç»æµŽå®žæƒ **ï¼šDeepSeek æä¾›å…·æœ‰ç«žäº‰åŠ›çš„ä»·æ ¼
-   **éšç§ä¿æŠ¤**ï¼šä½¿ç”¨ Ollama è¿›è¡Œå®Œå…¨æœ¬åœ°ã€ç¦»çº¿çš„æ“ä½œï¼ˆéœ€è¦å¼ºå¤§çš„ç¡¬ä»¶æ”¯æŒï¼‰
-   **çµæ´»æ€§**ï¼šOpenRouter é€šè¿‡å•ä¸€ API æä¾›å¯¹ä¼—å¤šæ¨¡åž‹çš„è®¿é—®

# AIO Canvas

<div align="center">

**AIé©±åŠ¨çš„å›¾è¡¨åˆ›å»ºå·¥å…· - å¯¹è¯ã€ç»˜åˆ¶ã€å¯è§†åŒ–**

[English](../../README.md) | ä¸­æ–‡ | [æ—¥æœ¬èªž](../ja/README_JA.md)

[![TrendShift](https://trendshift.io/api/badge/repositories/15449)](https://canvas-a-i-o.jiang.jp/)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![Sponsor](https://img.shields.io/badge/Sponsor-â¤-ea4aaa)](https://github.com/sponsors/DayuanJiang)

[![Live Demo](../../public/live-demo-button.svg)](https://canvas-a-i-o.jiang.jp/)

</div>

ä¸€ä¸ªé›†æˆäº†AIåŠŸèƒ½çš„Next.jsç½‘é¡µåº”ç”¨ï¼Œä¸Ždraw.ioå›¾è¡¨æ— ç¼ç»“åˆã€‚é€šè¿‡è‡ªç„¶è¯­è¨€å‘½ä»¤å’ŒAIè¾…åŠ©å¯è§†åŒ–æ¥åˆ›å»ºã€ä¿®æ”¹å’Œå¢žå¼ºå›¾è¡¨ã€‚

> æ³¨ï¼šæ„Ÿè°¢ <img src="https://raw.githubusercontent.com/DayuanJiang/canvas-a-i-o/main/public/doubao-color.png" alt="" height="20" /> [å­—èŠ‚è·³åŠ¨è±†åŒ…](https://www.volcengine.com/activity/newyear-referral?utm_campaign=doubao&utm_content=aidrawio&utm_medium=github&utm_source=coopensrc&utm_term=project) çš„èµžåŠ©æ”¯æŒï¼Œæœ¬é¡¹ç›®çš„ Demo çŽ°å·²æŽ¥å…¥å¼ºå¤§çš„ K2-thinking æ¨¡åž‹ï¼

https://github.com/user-attachments/assets/b2eef5f3-b335-4e71-a755-dc2e80931979

## ç›®å½•
- [AIO Canvas](#canvas-a-i-o)
  - [ç›®å½•](#ç›®å½•)
  - [ç¤ºä¾‹](#ç¤ºä¾‹)
  - [åŠŸèƒ½ç‰¹æ€§](#åŠŸèƒ½ç‰¹æ€§)
  - [MCPæœåŠ¡å™¨ï¼ˆé¢„è§ˆï¼‰](#mcpæœåŠ¡å™¨é¢„è§ˆ)
    - [Claude Code CLI](#claude-code-cli)
  - [å¿«é€Ÿå¼€å§‹](#å¿«é€Ÿå¼€å§‹)
    - [åœ¨çº¿è¯•ç”¨](#åœ¨çº¿è¯•ç”¨)
    - [æ¡Œé¢åº”ç”¨](#æ¡Œé¢åº”ç”¨)
    - [ä½¿ç”¨Dockerè¿è¡Œ](#ä½¿ç”¨dockerè¿è¡Œ)
    - [å®‰è£…](#å®‰è£…)
  - [éƒ¨ç½²](#éƒ¨ç½²)
    - [éƒ¨ç½²åˆ°è…¾è®¯äº‘EdgeOne Pages](#éƒ¨ç½²åˆ°è…¾è®¯äº‘edgeone-pages)
    - [éƒ¨ç½²åˆ°Vercel](#éƒ¨ç½²åˆ°vercel)
    - [éƒ¨ç½²åˆ°Cloudflare Workers](#éƒ¨ç½²åˆ°cloudflare-workers)
  - [å¤šæä¾›å•†æ”¯æŒ](#å¤šæä¾›å•†æ”¯æŒ)
  - [å·¥ä½œåŽŸç†](#å·¥ä½œåŽŸç†)
  - [æ”¯æŒä¸Žè”ç³»](#æ”¯æŒä¸Žè”ç³»)
  - [å¸¸è§é—®é¢˜](#å¸¸è§é—®é¢˜)
  - [StaråŽ†å²](#staråŽ†å²)

## ç¤ºä¾‹

ä»¥ä¸‹æ˜¯ä¸€äº›ç¤ºä¾‹æç¤ºè¯åŠå…¶ç”Ÿæˆçš„å›¾è¡¨ï¼š

<div align="center">
<table width="100%">
  <tr>
    <td colspan="2" valign="top" align="center">
      <strong>åŠ¨ç”»Transformerè¿žæŽ¥å™¨</strong><br />
      <p><strong>æç¤ºè¯ï¼š</strong> ç»™æˆ‘ä¸€ä¸ªå¸¦æœ‰**åŠ¨ç”»è¿žæŽ¥å™¨**çš„Transformeræž¶æž„å›¾ã€‚</p>
      <img src="../../public/animated_connectors.svg" alt="å¸¦åŠ¨ç”»è¿žæŽ¥å™¨çš„Transformeræž¶æž„" width="480" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>GCPæž¶æž„å›¾</strong><br />
      <p><strong>æç¤ºè¯ï¼š</strong> ä½¿ç”¨**GCPå›¾æ ‡**ç”Ÿæˆä¸€ä¸ªGCPæž¶æž„å›¾ã€‚åœ¨è¿™ä¸ªå›¾ä¸­ï¼Œç”¨æˆ·è¿žæŽ¥åˆ°æ‰˜ç®¡åœ¨å®žä¾‹ä¸Šçš„å‰ç«¯ã€‚</p>
      <img src="../../public/gcp_demo.svg" alt="GCPæž¶æž„å›¾" width="480" />
    </td>
    <td width="50%" valign="top">
      <strong>AWSæž¶æž„å›¾</strong><br />
      <p><strong>æç¤ºè¯ï¼š</strong> ä½¿ç”¨**AWSå›¾æ ‡**ç”Ÿæˆä¸€ä¸ªAWSæž¶æž„å›¾ã€‚åœ¨è¿™ä¸ªå›¾ä¸­ï¼Œç”¨æˆ·è¿žæŽ¥åˆ°æ‰˜ç®¡åœ¨å®žä¾‹ä¸Šçš„å‰ç«¯ã€‚</p>
      <img src="../../public/aws_demo.svg" alt="AWSæž¶æž„å›¾" width="480" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Azureæž¶æž„å›¾</strong><br />
      <p><strong>æç¤ºè¯ï¼š</strong> ä½¿ç”¨**Azureå›¾æ ‡**ç”Ÿæˆä¸€ä¸ªAzureæž¶æž„å›¾ã€‚åœ¨è¿™ä¸ªå›¾ä¸­ï¼Œç”¨æˆ·è¿žæŽ¥åˆ°æ‰˜ç®¡åœ¨å®žä¾‹ä¸Šçš„å‰ç«¯ã€‚</p>
      <img src="../../public/azure_demo.svg" alt="Azureæž¶æž„å›¾" width="480" />
    </td>
    <td width="50%" valign="top">
      <strong>çŒ«å’ªç´ æ</strong><br />
      <p><strong>æç¤ºè¯ï¼š</strong> ç»™æˆ‘ç”»ä¸€åªå¯çˆ±çš„çŒ«ã€‚</p>
      <img src="../../public/cat_demo.svg" alt="çŒ«å’ªç»˜å›¾" width="240" />
    </td>
  </tr>
</table>
</div>

## åŠŸèƒ½ç‰¹æ€§

-   **LLMé©±åŠ¨çš„å›¾è¡¨åˆ›å»º**ï¼šåˆ©ç”¨å¤§è¯­è¨€æ¨¡åž‹é€šè¿‡è‡ªç„¶è¯­è¨€å‘½ä»¤ç›´æŽ¥åˆ›å»ºå’Œæ“ä½œdraw.ioå›¾è¡¨
-   **åŸºäºŽå›¾åƒçš„å›¾è¡¨å¤åˆ¶**ï¼šä¸Šä¼ çŽ°æœ‰å›¾è¡¨æˆ–å›¾åƒï¼Œè®©AIè‡ªåŠ¨å¤åˆ¶å’Œå¢žå¼º
-   **PDFå’Œæ–‡æœ¬æ–‡ä»¶ä¸Šä¼ **ï¼šä¸Šä¼ PDFæ–‡æ¡£å’Œæ–‡æœ¬æ–‡ä»¶ï¼Œæå–å†…å®¹å¹¶ä»ŽçŽ°æœ‰æ–‡æ¡£ç”Ÿæˆå›¾è¡¨
-   **AIæŽ¨ç†è¿‡ç¨‹æ˜¾ç¤º**ï¼šæŸ¥çœ‹æ”¯æŒæ¨¡åž‹çš„AIæ€è€ƒè¿‡ç¨‹ï¼ˆOpenAI o1/o3ã€Geminiã€Claudeç­‰ï¼‰
-   **å›¾è¡¨åŽ†å²è®°å½•**ï¼šå…¨é¢çš„ç‰ˆæœ¬æŽ§åˆ¶ï¼Œè·Ÿè¸ªæ‰€æœ‰æ›´æ”¹ï¼Œå…è®¸æ‚¨æŸ¥çœ‹å’Œæ¢å¤AIç¼–è¾‘å‰çš„å›¾è¡¨ç‰ˆæœ¬
-   **äº¤äº’å¼èŠå¤©ç•Œé¢**ï¼šä¸ŽAIå®žæ—¶å¯¹è¯æ¥å®Œå–„æ‚¨çš„å›¾è¡¨
-   **äº‘æž¶æž„å›¾æ”¯æŒ**ï¼šä¸“é—¨æ”¯æŒç”Ÿæˆäº‘æž¶æž„å›¾ï¼ˆAWSã€GCPã€Azureï¼‰
-   **åŠ¨ç”»è¿žæŽ¥å™¨**ï¼šåœ¨å›¾è¡¨å…ƒç´ ä¹‹é—´åˆ›å»ºåŠ¨æ€åŠ¨ç”»è¿žæŽ¥å™¨ï¼Œå®žçŽ°æ›´å¥½çš„å¯è§†åŒ–æ•ˆæžœ

## MCPæœåŠ¡å™¨ï¼ˆé¢„è§ˆï¼‰

> **é¢„è§ˆåŠŸèƒ½**ï¼šæ­¤åŠŸèƒ½ä¸ºå®žéªŒæ€§åŠŸèƒ½ï¼Œå¯èƒ½ä¸ç¨³å®šã€‚

é€šè¿‡MCPï¼ˆæ¨¡åž‹ä¸Šä¸‹æ–‡åè®®ï¼‰åœ¨Claude Desktopã€Cursorå’ŒVS Codeç­‰AIä»£ç†ä¸­ä½¿ç”¨AIO Canvasã€‚

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@canvas-a-i-o/mcp-server@latest"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add drawio -- npx @canvas-a-i-o/mcp-server@latest
```

ç„¶åŽè®©Claudeåˆ›å»ºå›¾è¡¨ï¼š
> "åˆ›å»ºä¸€ä¸ªå±•ç¤ºç”¨æˆ·è®¤è¯æµç¨‹çš„æµç¨‹å›¾ï¼ŒåŒ…å«ç™»å½•ã€MFAå’Œä¼šè¯ç®¡ç†"

å›¾è¡¨ä¼šå®žæ—¶æ˜¾ç¤ºåœ¨æµè§ˆå™¨ä¸­ï¼

è¯¦æƒ…è¯·å‚é˜…[MCPæœåŠ¡å™¨README](../../packages/mcp-server/README.md)ï¼Œäº†è§£VS Codeã€Cursorç­‰å®¢æˆ·ç«¯é…ç½®ã€‚

## å¿«é€Ÿå¼€å§‹

### åœ¨çº¿è¯•ç”¨

æ— éœ€å®‰è£…ï¼ç›´æŽ¥åœ¨æˆ‘ä»¬çš„æ¼”ç¤ºç«™ç‚¹è¯•ç”¨ï¼š

[![Live Demo](../../public/live-demo-button.svg)](https://canvas-a-i-o.jiang.jp/)

> **ä½¿ç”¨è‡ªå·±çš„ API Key**ï¼šæ‚¨å¯ä»¥ä½¿ç”¨è‡ªå·±çš„ API Key æ¥ç»•è¿‡æ¼”ç¤ºç«™ç‚¹çš„ç”¨é‡é™åˆ¶ã€‚ç‚¹å‡»èŠå¤©é¢æ¿ä¸­çš„è®¾ç½®å›¾æ ‡å³å¯é…ç½®æ‚¨çš„ Provider å’Œ API Keyã€‚æ‚¨çš„ Key ä»…ä¿å­˜åœ¨æµè§ˆå™¨æœ¬åœ°ï¼Œä¸ä¼šè¢«å­˜å‚¨åœ¨æœåŠ¡å™¨ä¸Šã€‚

### æ¡Œé¢åº”ç”¨

ä»Ž [Releases é¡µé¢](https://github.com/PhenixStar/canvas-A-I-O/releases) ä¸‹è½½é€‚ç”¨äºŽæ‚¨å¹³å°çš„åŽŸç”Ÿæ¡Œé¢åº”ç”¨ï¼š

æ”¯æŒçš„å¹³å°ï¼šWindowsã€macOSã€Linuxã€‚

### ä½¿ç”¨Dockerè¿è¡Œ

[æŸ¥çœ‹ Docker æŒ‡å—](./docker.md)

### å®‰è£…

1. å…‹éš†ä»“åº“ï¼š

```bash
git clone https://github.com/PhenixStar/canvas-A-I-O
cd canvas-a-i-o
npm install
cp env.example .env.local
```

è¯¦ç»†è®¾ç½®è¯´æ˜Žè¯·å‚é˜…[æä¾›å•†é…ç½®æŒ‡å—](./ai-providers.md)ã€‚

2. è¿è¡Œå¼€å‘æœåŠ¡å™¨ï¼š

```bash
npm run dev
```

3. åœ¨æµè§ˆå™¨ä¸­æ‰“å¼€ [http://localhost:6002](http://localhost:6002) æŸ¥çœ‹åº”ç”¨ã€‚

## éƒ¨ç½²

### éƒ¨ç½²åˆ°è…¾è®¯äº‘EdgeOne Pages

æ‚¨å¯ä»¥é€šè¿‡[è…¾è®¯äº‘EdgeOne Pages](https://pages.edgeone.ai/zh)ä¸€é”®éƒ¨ç½²ã€‚

ç›´æŽ¥ç‚¹å‡»æ­¤æŒ‰é’®ä¸€é”®éƒ¨ç½²ï¼š
[![ä½¿ç”¨ EdgeOne Pages éƒ¨ç½²](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FDayuanJiang%2Fcanvas-a-i-o)

æŸ¥çœ‹[è…¾è®¯äº‘EdgeOne Pagesæ–‡æ¡£](https://pages.edgeone.ai/zh/document/product-introduction)äº†è§£æ›´å¤šè¯¦æƒ…ã€‚

åŒæ—¶ï¼Œé€šè¿‡è…¾è®¯äº‘EdgeOne Pageséƒ¨ç½²ï¼Œä¹Ÿä¼šèŽ·å¾—[æ¯æ—¥å…è´¹çš„DeepSeekæ¨¡åž‹é¢åº¦](https://edgeone.cloud.tencent.com/pages/document/169925463311781888)ã€‚

### éƒ¨ç½²åˆ°Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDayuanJiang%2Fcanvas-a-i-o)

éƒ¨ç½²Next.jsåº”ç”¨æœ€ç®€å•çš„æ–¹å¼æ˜¯ä½¿ç”¨Next.jsåˆ›å»ºè€…æä¾›çš„[Vercelå¹³å°](https://vercel.com/new)ã€‚è¯·ç¡®ä¿åœ¨VercelæŽ§åˆ¶å°ä¸­**è®¾ç½®çŽ¯å¢ƒå˜é‡**ï¼Œå°±åƒæ‚¨åœ¨æœ¬åœ° `.env.local` æ–‡ä»¶ä¸­æ‰€åšçš„é‚£æ ·ã€‚

æŸ¥çœ‹[Next.jséƒ¨ç½²æ–‡æ¡£](https://nextjs.org/docs/app/building-your-application/deploying)äº†è§£æ›´å¤šè¯¦æƒ…ã€‚

### éƒ¨ç½²åˆ°Cloudflare Workers

[æŸ¥çœ‹ Cloudflare éƒ¨ç½²æŒ‡å—](./cloudflare-deploy.md)


## å¤šæä¾›å•†æ”¯æŒ

-   [å­—èŠ‚è·³åŠ¨è±†åŒ…](https://www.volcengine.com/activity/newyear-referral?utm_campaign=doubao&utm_content=aidrawio&utm_medium=github&utm_source=coopensrc&utm_term=project)
-   AWS Bedrockï¼ˆé»˜è®¤ï¼‰
-   OpenAI
-   Anthropic
-   Google AI
-   Google Vertex AI
-   Azure OpenAI
-   Ollama
-   OpenRouter
-   DeepSeek
-   SiliconFlow
-   ModelScope
-   SGLang
-   Vercel AI Gateway

é™¤AWS Bedrockå’ŒOpenRouterå¤–ï¼Œæ‰€æœ‰æä¾›å•†éƒ½æ”¯æŒè‡ªå®šä¹‰ç«¯ç‚¹ã€‚

ðŸ“– **[è¯¦ç»†çš„æä¾›å•†é…ç½®æŒ‡å—](./ai-providers.md)** - æŸ¥çœ‹å„æä¾›å•†çš„è®¾ç½®è¯´æ˜Žã€‚

### æœåŠ¡ç«¯å¤šæ¨¡åž‹é…ç½®

ç®¡ç†å‘˜å¯ä»¥é…ç½®å¤šä¸ªæœåŠ¡ç«¯æ¨¡åž‹ï¼Œè®©æ‰€æœ‰ç”¨æˆ·æ— éœ€æä¾›ä¸ªäºº API Key å³å¯ä½¿ç”¨ã€‚é€šè¿‡ `AI_MODELS_CONFIG` çŽ¯å¢ƒå˜é‡ï¼ˆJSON å­—ç¬¦ä¸²ï¼‰æˆ– `ai-models.json` æ–‡ä»¶é…ç½®ã€‚

**æ¨¡åž‹è¦æ±‚**ï¼šæ­¤ä»»åŠ¡éœ€è¦å¼ºå¤§çš„æ¨¡åž‹èƒ½åŠ›ï¼Œå› ä¸ºå®ƒæ¶‰åŠç”Ÿæˆå…·æœ‰ä¸¥æ ¼æ ¼å¼çº¦æŸçš„é•¿æ–‡æœ¬ï¼ˆdraw.io XMLï¼‰ã€‚æŽ¨èä½¿ç”¨ Claude Sonnet 4.5ã€GPT-5.1ã€Gemini 3 Pro å’Œ DeepSeek V3.2/R1ã€‚

æ³¨æ„ï¼š`claude` ç³»åˆ—å·²åœ¨å¸¦æœ‰ AWSã€Azureã€GCP ç­‰äº‘æž¶æž„ Logo çš„ draw.io å›¾è¡¨ä¸Šè¿›è¡Œè®­ç»ƒï¼Œå› æ­¤å¦‚æžœæ‚¨æƒ³åˆ›å»ºäº‘æž¶æž„å›¾ï¼Œè¿™æ˜¯æœ€ä½³é€‰æ‹©ã€‚


## å·¥ä½œåŽŸç†

æœ¬åº”ç”¨ä½¿ç”¨ä»¥ä¸‹æŠ€æœ¯ï¼š

-   **Next.js**ï¼šç”¨äºŽå‰ç«¯æ¡†æž¶å’Œè·¯ç”±
-   **Vercel AI SDK**ï¼ˆ`ai` + `@ai-sdk/*`ï¼‰ï¼šç”¨äºŽæµå¼AIå“åº”å’Œå¤šæä¾›å•†æ”¯æŒ
-   **react-drawio**ï¼šç”¨äºŽå›¾è¡¨è¡¨ç¤ºå’Œæ“ä½œ

å›¾è¡¨ä»¥XMLæ ¼å¼è¡¨ç¤ºï¼Œå¯åœ¨draw.ioä¸­æ¸²æŸ“ã€‚AIå¤„ç†æ‚¨çš„å‘½ä»¤å¹¶ç›¸åº”åœ°ç”Ÿæˆæˆ–ä¿®æ”¹æ­¤XMLã€‚


## æ”¯æŒä¸Žè”ç³»

**ç‰¹åˆ«æ„Ÿè°¢[å­—èŠ‚è·³åŠ¨è±†åŒ…](https://www.volcengine.com/activity/newyear-referral?utm_campaign=doubao&utm_content=aidrawio&utm_medium=github&utm_source=coopensrc&utm_term=project)èµžåŠ©æ¼”ç¤ºç«™ç‚¹çš„ API Token ä½¿ç”¨ï¼** æ³¨å†Œç«å±±å¼•æ“Ž ARK å¹³å°å³å¯èŽ·å¾—50ä¸‡å…è´¹Tokenï¼

å¦‚æžœæ‚¨è§‰å¾—è¿™ä¸ªé¡¹ç›®æœ‰ç”¨ï¼Œè¯·è€ƒè™‘[èµžåŠ©](https://github.com/sponsors/DayuanJiang)æ¥å¸®åŠ©æˆ‘æ‰˜ç®¡åœ¨çº¿æ¼”ç¤ºç«™ç‚¹ï¼

å¦‚éœ€æ”¯æŒæˆ–å’¨è¯¢ï¼Œè¯·åœ¨GitHubä»“åº“ä¸Šæäº¤issueæˆ–è”ç³»ç»´æŠ¤è€…ï¼š

-   é‚®ç®±ï¼šme[at]jiang.jp

## å¸¸è§é—®é¢˜

è¯·å‚é˜… [FAQ](./FAQ.md) äº†è§£å¸¸è§é—®é¢˜å’Œè§£å†³æ–¹æ¡ˆã€‚

## StaråŽ†å²

[![Star History Chart](https://api.star-history.com/svg?repos=DayuanJiang/canvas-a-i-o&type=date&legend=top-left)](https://www.star-history.com/#DayuanJiang/canvas-a-i-o&type=date&legend=top-left)

---

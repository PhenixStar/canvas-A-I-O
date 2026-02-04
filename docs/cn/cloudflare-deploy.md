# éƒ¨ç½²åˆ° Cloudflare Workers

æœ¬é¡¹ç›®å¯ä»¥é€šè¿‡ **OpenNext é€‚é…å™¨** éƒ¨ç½²ä¸º **Cloudflare Worker**ï¼Œä¸ºæ‚¨æä¾›ï¼š

- å…¨çƒè¾¹ç¼˜éƒ¨ç½²
- æžä½Žå»¶è¿Ÿ
- å…è´¹çš„ `workers.dev` åŸŸåæ‰˜ç®¡
- é€šè¿‡ R2 å®žçŽ°å®Œæ•´çš„ Next.js ISR æ”¯æŒï¼ˆå¯é€‰ï¼‰

> **Windows ç”¨æˆ·é‡è¦æç¤ºï¼š** OpenNext å’Œ Wrangler åœ¨ **åŽŸç”Ÿ Windows çŽ¯å¢ƒä¸‹å¹¶ä¸å®Œå…¨å¯é **ã€‚å»ºè®®æ–¹æ¡ˆï¼š
>
> - ä½¿ç”¨ **GitHub Codespaces**ï¼ˆå®Œç¾Žè¿è¡Œï¼‰
> - æˆ–è€…ä½¿ç”¨ **WSL (Linux)**
>
> çº¯ Windows æž„å»ºå¯èƒ½ä¼šå› ä¸º WASM æ–‡ä»¶è·¯å¾„é—®é¢˜è€Œå¤±è´¥ã€‚

---

## å‰ç½®æ¡ä»¶

1. ä¸€ä¸ª **Cloudflare è´¦æˆ·**ï¼ˆå…è´¹ç‰ˆå³å¯æ»¡è¶³åŸºæœ¬éƒ¨ç½²éœ€æ±‚ï¼‰
2. **Node.js 18+**
3. å®‰è£… **Wrangler CLI**ï¼ˆä½œä¸ºå¼€å‘ä¾èµ–å®‰è£…å³å¯ï¼‰ï¼š

```bash
npm install -D wrangler
```

4. ç™»å½• Cloudflareï¼š

```bash
npx wrangler login
```

> **æ³¨æ„ï¼š** åªæœ‰åœ¨å¯ç”¨ R2 è¿›è¡Œ ISR ç¼“å­˜æ—¶æ‰éœ€è¦ç»‘å®šæ”¯ä»˜æ–¹å¼ã€‚åŸºæœ¬çš„ Workers éƒ¨ç½²æ˜¯å…è´¹çš„ã€‚

---

## ç¬¬ä¸€æ­¥ â€” å®‰è£…ä¾èµ–

```bash
npm install
```

---

## ç¬¬äºŒæ­¥ â€” é…ç½®çŽ¯å¢ƒå˜é‡

Cloudflare åœ¨æœ¬åœ°æµ‹è¯•æ—¶ä½¿ç”¨ä¸åŒçš„æ–‡ä»¶ã€‚

### 1) åˆ›å»º `.dev.vars`ï¼ˆç”¨äºŽ Cloudflare æœ¬åœ°è°ƒè¯• + éƒ¨ç½²ï¼‰

```bash
cp env.example .dev.vars
```

å¡«å…¥æ‚¨çš„ API å¯†é’¥å’Œé…ç½®ä¿¡æ¯ã€‚

### 2) ç¡®ä¿ `.env.local` ä¹Ÿå­˜åœ¨ï¼ˆç”¨äºŽå¸¸è§„ Next.js å¼€å‘ï¼‰

```bash
cp env.example .env.local
```

åœ¨æ­¤å¤„å¡«å…¥ç›¸åŒçš„å€¼ã€‚

---

## ç¬¬ä¸‰æ­¥ â€” é€‰æ‹©éƒ¨ç½²ç±»åž‹

### é€‰é¡¹ Aï¼šä¸ä½¿ç”¨ R2 éƒ¨ç½²ï¼ˆç®€å•ï¼Œå…è´¹ï¼‰

å¦‚æžœæ‚¨ä¸éœ€è¦ ISR ç¼“å­˜ï¼Œå¯ä»¥é€‰æ‹©ä¸ä½¿ç”¨ R2 è¿›è¡Œéƒ¨ç½²ï¼š

**1. ä½¿ç”¨ç®€å•çš„ `open-next.config.ts`ï¼š**

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config"

export default defineCloudflareConfig({})
```

**2. ä½¿ç”¨ç®€å•çš„ `wrangler.jsonc`ï¼ˆä¸åŒ…å« r2_bucketsï¼‰ï¼š**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "canvas-a-i-o-worker",
  "compatibility_date": "2025-12-08",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "canvas-a-i-o-worker"
    }
  ]
}
```

ç›´æŽ¥è·³è‡³ **ç¬¬å››æ­¥**ã€‚

---

### é€‰é¡¹ Bï¼šä½¿ç”¨ R2 éƒ¨ç½²ï¼ˆå®Œæ•´çš„ ISR æ”¯æŒï¼‰

R2 å¼€å¯äº† **å¢žé‡é™æ€å†ç”Ÿ (ISR)** ç¼“å­˜åŠŸèƒ½ã€‚éœ€è¦åœ¨æ‚¨çš„ Cloudflare è´¦æˆ·ä¸­ç»‘å®šæ”¯ä»˜æ–¹å¼ã€‚

**1. åœ¨ Cloudflare æŽ§åˆ¶å°ä¸­åˆ›å»º R2 å­˜å‚¨æ¡¶ï¼š**

- è¿›å…¥ **Storage & Databases â†’ R2**
- ç‚¹å‡» **Create bucket**
- å‘½åä¸ºï¼š`next-inc-cache`

**2. é…ç½® `open-next.config.ts`ï¼š**

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})
```

**3. é…ç½® `wrangler.jsonc`ï¼ˆåŒ…å« R2ï¼‰ï¼š**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "canvas-a-i-o-worker",
  "compatibility_date": "2025-12-08",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "next-inc-cache"
    }
  ],
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "canvas-a-i-o-worker"
    }
  ]
}
```

> **é‡è¦æç¤ºï¼š** `bucket_name` å¿…é¡»ä¸Žæ‚¨åœ¨ Cloudflare æŽ§åˆ¶å°ä¸­åˆ›å»ºçš„åç§°å®Œå…¨ä¸€è‡´ã€‚

---

## ç¬¬å››æ­¥ â€” æ³¨å†Œ workers.dev å­åŸŸåï¼ˆä»…é¦–æ¬¡éœ€è¦ï¼‰

åœ¨é¦–æ¬¡éƒ¨ç½²ä¹‹å‰ï¼Œæ‚¨éœ€è¦ä¸€ä¸ª workers.dev å­åŸŸåã€‚

**é€‰é¡¹ 1ï¼šé€šè¿‡ Cloudflare æŽ§åˆ¶å°ï¼ˆæŽ¨èï¼‰**

è®¿é—®ï¼šhttps://dash.cloudflare.com â†’ Workers & Pages â†’ Overview â†’ Set up a subdomain

**é€‰é¡¹ 2ï¼šåœ¨éƒ¨ç½²è¿‡ç¨‹ä¸­**

è¿è¡Œ `npm run deploy` æ—¶ï¼ŒWrangler å¯èƒ½ä¼šæç¤ºï¼š

```
Would you like to register a workers.dev subdomain? (Y/n)
```

è¾“å…¥ `Y` å¹¶é€‰æ‹©ä¸€ä¸ªå­åŸŸåã€‚

> **æ³¨æ„ï¼š** åœ¨ CI/CD æˆ–éžäº¤äº’å¼çŽ¯å¢ƒä¸­ï¼Œè¯¥æç¤ºä¸ä¼šå‡ºçŽ°ã€‚è¯·å…ˆé€šè¿‡æŽ§åˆ¶å°è¿›è¡Œæ³¨å†Œã€‚

---

## ç¬¬äº”æ­¥ â€” éƒ¨ç½²åˆ° Cloudflare

```bash
npm run deploy
```

è¯¥è„šæœ¬æ‰§è¡Œçš„æ“ä½œï¼š

- æž„å»º Next.js åº”ç”¨
- é€šè¿‡ OpenNext å°†å…¶è½¬æ¢ä¸º Cloudflare Worker
- ä¸Šä¼ é™æ€èµ„æº
- å‘å¸ƒ Worker

æ‚¨çš„åº”ç”¨å°†å¯é€šè¿‡ä»¥ä¸‹åœ°å€è®¿é—®ï¼š

```
https://<worker-name>.<your-subdomain>.workers.dev
```

---

## å¸¸è§é—®é¢˜ä¸Žä¿®å¤

### `You need to register a workers.dev subdomain`

**åŽŸå› ï¼š** æ‚¨çš„è´¦æˆ·å°šæœªæ³¨å†Œ workers.dev å­åŸŸåã€‚

**ä¿®å¤ï¼š** å‰å¾€ https://dash.cloudflare.com â†’ Workers & Pages â†’ Set up a subdomainã€‚

---

### `Please enable R2 through the Cloudflare Dashboard`

**åŽŸå› ï¼š** wrangler.jsonc ä¸­é…ç½®äº† R2ï¼Œä½†æ‚¨çš„è´¦æˆ·å°šæœªå¯ç”¨è¯¥åŠŸèƒ½ã€‚

**ä¿®å¤ï¼š** å¯ç”¨ R2ï¼ˆéœ€è¦æ”¯ä»˜æ–¹å¼ï¼‰æˆ–ä½¿ç”¨é€‰é¡¹ Aï¼ˆä¸ä½¿ç”¨ R2 éƒ¨ç½²ï¼‰ã€‚

---

### `No R2 binding "NEXT_INC_CACHE_R2_BUCKET" found`

**åŽŸå› ï¼š** `wrangler.jsonc` ä¸­ç¼ºå°‘ `r2_buckets` é…ç½®ã€‚

**ä¿®å¤ï¼š** æ·»åŠ  `r2_buckets` éƒ¨åˆ†æˆ–åˆ‡æ¢åˆ°é€‰é¡¹ Aï¼ˆä¸ä½¿ç”¨ R2ï¼‰ã€‚

---

### `Can't set compatibility date in the future`

**åŽŸå› ï¼š** wrangler é…ç½®ä¸­çš„ `compatibility_date` è®¾ç½®ä¸ºäº†æœªæ¥çš„æ—¥æœŸã€‚

**ä¿®å¤ï¼š** å°† `compatibility_date` ä¿®æ”¹ä¸ºä»Šå¤©æˆ–æ›´æ—©çš„æ—¥æœŸã€‚

---

### Windows é”™è¯¯ï¼š`resvg.wasm?module` (ENOENT)

**åŽŸå› ï¼š** Windows æ–‡ä»¶åä¸èƒ½åŒ…å« `?`ï¼Œä½†æŸä¸ª wasm èµ„æºæ–‡ä»¶åä¸­ä½¿ç”¨äº† `?module`ã€‚

**ä¿®å¤ï¼š** åœ¨ Linux çŽ¯å¢ƒï¼ˆWSLã€Codespaces æˆ– CIï¼‰ä¸Šè¿›è¡Œæž„å»º/éƒ¨ç½²ã€‚

---

## å¯é€‰ï¼šæœ¬åœ°é¢„è§ˆ

éƒ¨ç½²å‰åœ¨æœ¬åœ°é¢„è§ˆ Workerï¼š

```bash
npm run preview
```

---

## æ€»ç»“

| åŠŸèƒ½ | ä¸ä½¿ç”¨ R2 | ä½¿ç”¨ R2 |
|---------|------------|---------|
| æˆæœ¬ | å…è´¹ | éœ€è¦ç»‘å®šæ”¯ä»˜æ–¹å¼ |
| ISR ç¼“å­˜ | æ—  | æœ‰ |
| é™æ€é¡µé¢ | æ”¯æŒ | æ”¯æŒ |
| API è·¯ç”± | æ”¯æŒ | æ”¯æŒ |
| é…ç½®å¤æ‚åº¦ | ç®€å• | ä¸­ç­‰ |

æµ‹è¯•æˆ–ç®€å•åº”ç”¨è¯·é€‰æ‹© **ä¸ä½¿ç”¨ R2**ã€‚éœ€è¦ ISR ç¼“å­˜çš„ç”Ÿäº§çŽ¯å¢ƒåº”ç”¨è¯·é€‰æ‹© **ä½¿ç”¨ R2**ã€‚

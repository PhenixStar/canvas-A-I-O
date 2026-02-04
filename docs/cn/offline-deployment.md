# ç¦»çº¿éƒ¨ç½²

é€šè¿‡è‡ªæ‰˜ç®¡ draw.io æ¥æ›¿ä»£ `embed.diagrams.net`ï¼Œä»Žè€Œç¦»çº¿éƒ¨ç½² AIO Canvasã€‚

**æ³¨æ„ï¼š** `NEXT_PUBLIC_DRAWIO_BASE_URL` æ˜¯ä¸€ä¸ª**æž„å»ºæ—¶**å˜é‡ã€‚ä¿®æ”¹å®ƒéœ€è¦é‡æ–°æž„å»º Docker é•œåƒã€‚

## Docker Compose è®¾ç½®

1. å…‹éš†ä»“åº“å¹¶åœ¨ `.env` æ–‡ä»¶ä¸­å®šä¹‰ API å¯†é’¥ã€‚
2. åˆ›å»º `docker-compose.yml`ï¼š

```yaml
services:
  drawio:
    image: jgraph/drawio:latest
    ports: ["8080:8080"]
  canvas-a-i-o:
    build:
      context: .
      args:
        - NEXT_PUBLIC_DRAWIO_BASE_URL=http://localhost:8080
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [drawio]
```

3. è¿è¡Œ `docker compose up -d` å¹¶æ‰“å¼€ `http://localhost:3000`ã€‚

## é…ç½®ä¸Žé‡è¦è­¦å‘Š

**`NEXT_PUBLIC_DRAWIO_BASE_URL` å¿…é¡»æ˜¯ç”¨æˆ·æµè§ˆå™¨å¯è®¿é—®çš„åœ°å€ã€‚**

| åœºæ™¯ | URL å€¼ |
|----------|-----------|
| æœ¬åœ°ä¸»æœº (Localhost) | `http://localhost:8080` |
| è¿œç¨‹/æœåŠ¡å™¨ | `http://YOUR_SERVER_IP:8080` |

**åˆ‡å‹¿ä½¿ç”¨** Docker å†…éƒ¨åˆ«åï¼ˆå¦‚ `http://drawio:8080`ï¼‰ï¼Œå› ä¸ºæµè§ˆå™¨æ— æ³•è§£æžå®ƒä»¬ã€‚

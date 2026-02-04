# ä½¿ç”¨ Docker è¿è¡Œ

å¦‚æžœæ‚¨åªæ˜¯æƒ³åœ¨æœ¬åœ°è¿è¡Œï¼Œæœ€å¥½çš„æ–¹å¼æ˜¯ä½¿ç”¨ Dockerã€‚

é¦–å…ˆï¼Œå¦‚æžœæ‚¨å°šæœªå®‰è£… Dockerï¼Œè¯·å…ˆå®‰è£…ï¼š[èŽ·å– Docker](https://docs.docker.com/get-docker/)

ç„¶åŽè¿è¡Œï¼š

```bash
docker run -d -p 3000:3000 \
  -e AI_PROVIDER=openai \
  -e AI_MODEL=gpt-4o \
  -e OPENAI_API_KEY=your_api_key \
  ghcr.io/dayuanjiang/canvas-a-i-o:latest
```

æˆ–è€…ä½¿ç”¨çŽ¯å¢ƒå˜é‡æ–‡ä»¶ï¼š

```bash
cp env.example .env
# ç¼–è¾‘ .env æ–‡ä»¶å¹¶å¡«å…¥æ‚¨çš„é…ç½®
docker run -d -p 3000:3000 --env-file .env ghcr.io/dayuanjiang/canvas-a-i-o:latest
```

åœ¨æµè§ˆå™¨ä¸­æ‰“å¼€ [http://localhost:3000](http://localhost:3000)ã€‚

è¯·å°†çŽ¯å¢ƒå˜é‡æ›¿æ¢ä¸ºæ‚¨é¦–é€‰çš„ AI æä¾›å•†é…ç½®ã€‚æŸ¥çœ‹ [AI æä¾›å•†](./ai-providers.md) äº†è§£å¯ç”¨é€‰é¡¹ã€‚

> **ç¦»çº¿éƒ¨ç½²ï¼š** å¦‚æžœæ— æ³•è®¿é—® `embed.diagrams.net`ï¼Œè¯·å‚é˜… [ç¦»çº¿éƒ¨ç½²](./offline-deployment.md) äº†è§£é…ç½®é€‰é¡¹ã€‚

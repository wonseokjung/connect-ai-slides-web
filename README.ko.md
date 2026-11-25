<p align="center"><img src="docs/brand/banner.jpg" width="100%" alt="AI 멘토 제이, CONNECT AI LAB 의 connect-ai-slides-web"></p>

<p align="center">
  <b>CONNECT AI LAB</b> · 모두를 위한 AI 교육 · AI education for everyone<br>
  <a href="https://www.youtube.com/@CONNECT-AI-LAB">YouTube: CONNECT AI LAB</a> · <a href="https://www.aicitybuilders.com/vibecoding">강의: 비주얼 바이브코딩</a> · <a href="README.md">English</a>
</p>

# connect-ai-slides-web

**모션그래픽은 영상에만 쓰는 게 아니에요. 그 움직임 그대로 발표자료도 되고, 웹사이트도 돼요.**

내 AI 발표자료 직원이에요. 할 말을 몇 줄 적으면 움직이는 발표자료랑 진짜 파워포인트 파일이 같이 나와요.

![진짜 .pptx 를 Apple 오피스 엔진으로 연 화면이에요. 금색 점선이 전부 고칠 수 있는 글상자예요](docs/pptx/hero.webp)

<sub>위 화면은 이 도구가 만든 .pptx 를 그대로 연 거예요. 금색 점선은 파일 안에 있는 글상자 자리를 읽어서 그린 거고요.</sub>

## 시작

```bash
npx connect-ai-slides-web install-skill
```

그다음에 에이전트(Claude Code, Codex, Antigravity, Cursor)에서 새 대화를 여시고, "이 내용으로 발표자료 만들어 줘" 이렇게 한번 말해 보세요.

## 에이전트 없이

```bash
npx connect-ai-slides-web ppt              # 견본 my-talk.md 를 하나 써 줘요
npx connect-ai-slides-web ppt my-talk.md   # 내 글로 덱 + deck.pptx
npx connect-ai-slides-web inspect my-talk-deck/out/deck.pptx
```

`#` 은 제목, `##` 은 슬라이드 한 장이에요. `-` 는 목록, `1.` 은 단계, `>` 는 인용, `Note:` 는 발표자 노트로 들어가요.

## 파워포인트 안에는

| | |
|---|---|
| 글자 | 진짜 글상자예요. 눌러서 바로 고치시면 돼요 |
| 움직임 | 슬라이드마다 영상 클립 하나로 들어가고, 넘기면 저절로 시작해요 (`--click` 이면 눌러서 시작) |
| 글자가 나오는 순간 | 덱에서 글자가 나타나는 그 순간에 페이드인 돼요 |
| 노트 | 발표자 노트가 슬라이드마다 들어가요 |
| Google Slides | `--google` 을 붙이면 영상 대신 그림을 깐 파일이 하나 더 나와요 |

위 화면의 파일을 직접 받아서 열어 보세요. [한국어 deck.pptx](docs/demo/ko/deck.pptx) · [영어 deck.pptx](docs/demo/en/deck.pptx)

## 같은 이야기로 웹사이트도

![같은 이야기를 영어 덱과 한국어 폰 웹사이트로](docs/demo/montage.webp)

덱이랑 웹사이트가 `story.json` 한 벌에서 같이 나와요. 웹사이트는 5강에서 해요. 움직임 블록 67개는 [카탈로그 페이지](docs/index.html)에서 움직이는 걸로 보실 수 있어요.

---

명령이랑 옵션, 안 되는 것까지 [docs/guide.ko.md](docs/guide.ko.md)에 다 정리해 뒀어요.

MIT예요. 다만 GSAP는 GreenSock의 [무료 표준 라이선스](https://gsap.com/standard-license)고, Remotion은 개인, 직원 3명 이하 회사, 비영리는 무료지만 그 밖의 회사는 따로 라이선스가 필요해요. 자세한 건 [NOTICE.md](NOTICE.md)에 있어요.

이런 도구를 내 AI 에이전트로 직접 만드는 법은 [비주얼 바이브코딩](https://www.aicitybuilders.com/vibecoding)에서 알려 드려요.

<table><tr>
<td width="140" valign="top"><img src="docs/brand/jay.jpg" width="128" alt="AI 멘토 제이"></td>
<td valign="top"><b>만든 사람: AI 멘토 제이</b> · CONNECT AI LAB<br>
이런 AI 직원을 하나씩 오픈소스로 만들고 있어요. 만드는 법은 유튜브랑 강의에서 보여 드려요.<br>
<a href="https://www.youtube.com/@CONNECT-AI-LAB">유튜브</a> · <a href="https://www.aicitybuilders.com/vibecoding">비주얼 바이브코딩</a> · <a href="https://github.com/wonseokjung">다른 오픈소스</a></td>
</tr></table>

<!-- team:start -->
## CONNECT AI LAB의 AI 직원들

AI 직원을 하나씩 오픈소스로 만들고 있어요. 필요한 직원부터 데려가 쓰세요.

<table>
<tr><td width="34%" valign="top"><b>사업 해부 직원</b><br><a href="https://github.com/wonseokjung/reversebusiness"><code>reversebusiness</code></a></td><td valign="top">사업 웹사이트 주소 하나 주면 그 사업이 어떻게 돈 버는지 읽어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>영상 편집 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-video-motion"><code>connect-ai-video-motion</code></a></td><td valign="top">내 영상을 주면 몸을 피해서 빈자리에 모션그래픽을 넣어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>모션그래픽 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-motion"><code>connect-ai-motion</code></a></td><td valign="top">글 몇 줄 주면 모션그래픽 영상을 만들어 줘요. 찍은 영상은 없어도 돼요.</td></tr>
<tr><td width="34%" valign="top"><b>발표자료 직원</b> · <b>지금 보는 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-slides-web"><code>connect-ai-slides-web</code></a></td><td valign="top">할 말을 몇 줄 주면 움직이는 덱이랑 고칠 수 있는 파워포인트 파일을 만들어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>마케팅팀</b><br><a href="https://github.com/wonseokjung/connect-ai-marketer"><code>connect-ai-marketer</code></a></td><td valign="top">내 브라우저에서 24시간 댓글, 리스닝, 업로드를 맡아요.</td></tr>
<tr><td width="34%" valign="top"><b>글쓰기 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-writer"><code>connect-ai-writer</code></a></td><td valign="top">영상 하나 주면 플랫폼마다 내 말투로 글을 쓰고 사진까지 같이 만들어 줘요.</td></tr>
</table>
<!-- team:end -->

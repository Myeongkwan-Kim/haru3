#!/bin/sh
# index.html (Artifact 본문 규격: doctype/head/body 없음)을 자체 호스팅용
# 완전한 HTML 문서로 감싸고, static/ 의 부속 파일과 함께 dist/ 를 만든다.
# dist/ 는 산출물이므로 직접 고치지 말 것.
set -e
cd "$(dirname "$0")"
SPLIT=$(grep -n '^<div id="app">' index.html | head -1 | cut -d: -f1)
rm -rf dist
mkdir -p dist
{
  cat <<'HEAD'
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="하루 세 아이">
<meta name="theme-color" content="#FCFCFB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#131A18" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon.svg">
<style>html,body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
HEAD
  head -n $((SPLIT - 1)) index.html
  echo '</head>'
  echo '<body>'
  tail -n +$SPLIT index.html
  echo '</body>'
  echo '</html>'
} > dist/index.html
cp static/* dist/
echo "dist/ 생성 완료: $(ls dist | tr '\n' ' ')"

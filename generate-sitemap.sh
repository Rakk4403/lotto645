#!/bin/zsh
# 배포 시점에 도메인 자동 치환하여 sitemap.xml, index.html, robots.txt 생성

if [[ -z "$DOMAIN" ]]; then
  echo "환경변수 DOMAIN이 설정되어 있지 않습니다. 예: export DOMAIN=\"https://lotto.example.com\""
  exit 1
fi

sed "s|YOUR_DOMAIN_HERE|$DOMAIN|g" sitemap.xml.template > sitemap.xml
sed "s|YOUR_DOMAIN_HERE|$DOMAIN|g" robots.txt.template > robots.txt
sed "s|YOUR_DOMAIN_HERE|$DOMAIN|g" index.html.template > index.html

echo "sitemap.xml, robots.txt, index.html 생성 완료: $DOMAIN"

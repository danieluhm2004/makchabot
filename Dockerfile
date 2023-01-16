FROM node:18-alpine
ARG DOPPLER_TOKEN

COPY . /app
WORKDIR /app
RUN apk --no-cache add tzdata gnupg curl && \
  curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh && \
  doppler secrets download doppler.encrypted.json && \
  cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
  echo "Asia/Seoul" > /etc/timezone && \
  yarn --prod=false && yarn build && yarn --prod=true

ENTRYPOINT ["doppler", "run", "--fallback=doppler.encrypted.json", "--"]
CMD yarn start:prod

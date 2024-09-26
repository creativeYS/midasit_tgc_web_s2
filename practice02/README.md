#

# docker를 통한 MQ 실행
```agsl
docker run --name rabbit-mq -p 5672:5672 -p 5673:5673 -p 15672:15672 rabbitmq:3-management
```
#### rabbit-mq 서비스를 실행합니다.
- localhost:15672로 접속하여 rabbit-mq 관리자 페이지를 확인할 수 있습니다.

#### 메시지를 생산합니다.
```agsl
npm run produce kys0522
npm run produce Daniel
```

#### 메시지를 소비합니다.
```agsl
npm run consume
```
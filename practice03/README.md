#

# docker를 통한 MQ 실행
```agsl
docker run --name rabbit-mq -p 5672:5672 -p 5673:5673 -p 15672:15672 rabbitmq:3-management
```

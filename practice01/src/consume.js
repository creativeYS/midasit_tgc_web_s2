const amqp = require('amqplib');

async function receiveMessage() {
    try {
        // RabbitMQ 서버에 연결
        const connection = await amqp.connect('amqp://localhost');
        
        // 채널 생성
        const channel = await connection.createChannel();
        
        // 큐 선언
        const queue = 'task_queue';
        await channel.assertQueue(queue, {
            durable: true, // 큐의 내구성 설정
        });

        console.log(`[CONSUMER] Waiting for messages in ${queue}. To exit press CTRL+C`);

        // 메시지 소비 (구독)
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                // 메시지 처리
                const messageContent = msg.content.toString();
                console.log(`[CONSUMER] Received '${messageContent}'`);
                
                // 메시지 처리 완료를 RabbitMQ에 알림
                channel.ack(msg);
            }
        }, {
            noAck: false // 메시지 처리 후 ack를 통해 RabbitMQ에 확인
        });

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();

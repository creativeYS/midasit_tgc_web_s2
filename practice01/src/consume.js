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
            durable: true, // 메시지가 RabbitMQ 서버가 재시작되어도 유지되도록 durable 옵션 설정
        });

        while (true) {
            // 메시지 받기
            const message = await channel.get(queue);
            if (message) {
                const value = JSON.parse(message.content.toString());
                console.log(`[CONSUME] Received '${value.name}'`);
                channel.ack(message);
            } 
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
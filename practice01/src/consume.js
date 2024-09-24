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

        channel.consume(queue, (msg) => {
            const message = msg.content.toString();
            const name = JSON.parse(message).name;
            console.log(name);

            channel.ack(msg, true);
        });

        // 연결 닫기
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
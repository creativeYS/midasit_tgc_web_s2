const amqp = require('amqplib');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'param', alias: 'v', type: String },
    { name: 'src', type: String, multiple: true, defaultOption: true }
];

async function receiveMessage() {
    try {
        const commandLine = commandLineArgs(optionDefinitions);
        const params = commandLine.src ?? [];

        // RabbitMQ 서버에 연결
        const connection = await amqp.connect('amqp://localhost');

        // 채널 생성
        const channel = await connection.createChannel();

        // 큐 선언
        const queue = 'task_queue';
        await channel.assertQueue(queue, {
            durable: true, // 메시지가 RabbitMQ 서버가 재시작되어도 유지되도록 durable 옵션 설정
        });

        // 메시지 받기
        channel.consume(queue, (message) => {
            const content = JSON.parse(message.content.toString());
            console.log(`[CONSUME] Received '${content.name}'`);
        }, {
            noAck: true // 메시지 처리 확인을 자동으로 보내지 않음
        });

        console.log('[CONSUME] Waiting for messages. To exit press CTRL+C');
        
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
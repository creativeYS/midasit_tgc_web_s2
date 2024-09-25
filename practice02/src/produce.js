const amqp = require('amqplib');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'param', alias: 'v', type: String },
    { name: 'src', type: String, multiple: true, defaultOption: true }
];

async function sendMessage() {
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

        // 보낼 메시지
        const message = JSON.stringify({
            date : new Date().toString(),
            name: params[0],
        });

        // 메시지 전송
        channel.sendToQueue(queue, Buffer.from(message), {
            persistent: true // 메시지를 영구적으로 저장
        });

        console.log(`[PRODUCE] Sent '${message}'`);

        // 연결 닫기
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

sendMessage();
const amqp = require('amqplib');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const path = require('path');

const optionDefinitions = [
    { name: 'param', alias: 'v', type: String },
    { name: 'src', type: String, multiple: true, defaultOption: true }
];

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function sendMessage() {
    try {
        const commandLine = commandLineArgs(optionDefinitions);
        const params = commandLine.src ?? [];
        if(params.length === 0) {
            console.log('input is not found')
            return;
        }

        const filePath = params[0];

        if (!fs.existsSync(filePath)) {
            console.log('file is not exist.');
        }

        const fileName = path.basename(filePath);
        const key = generateRandomString(10);

        try {
            const path = `./files/${key}`
            fs.mkdirSync(path);
            fs.copyFileSync(filePath, `${path}/${fileName}`);
        } catch (err) {
            console.error('fail to file copy : ', err);
            return
        }

        // RabbitMQ 서버에 연결
        const connection = await amqp.connect('amqp://localhost');

        // 채널 생성
        const channel = await connection.createChannel();

        // 큐 선언
        const queue = 'task_queue';
        await channel.assertQueue(queue, {
            durable: true, // 메시지를 영구적으로 유지
            arguments: {
                'x-message-ttl': 10000, // 메시지 TTL 10초 설정
                'x-dead-letter-exchange': 'my_dlx' // 만료된 메시지를 보내는 DLX 설정
            }
        });

        // 보낼 메시지
        const message = JSON.stringify({
            date : new Date().toString(),
            fileName,
            key,
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
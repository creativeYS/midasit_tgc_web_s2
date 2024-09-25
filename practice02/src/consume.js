const amqp = require('amqplib');
const fs = require('fs');

async function receiveMessage() {
    try {
        // RabbitMQ 서버에 연결
        const connection = await amqp.connect('amqp://localhost');

        // 채널 생성
        const channel = await connection.createChannel();

        // 큐 선언
        const queue = 'task_queue';
        await channel.assertQueue(queue, {
            durable: true // 메시지를 영구적으로 유지
        });

        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        // 메시지 소비 (consume)
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                console.log(`[CONSUME] Received ${content}`);

                const payload = JSON.parse(content);
                // do something with payload
                const date = new Date(payload.date);
                const fileName = payload.fileName;
                const key = payload.key;
                console.log(`  [CONSUME] ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} : hello ${key}, ${fileName}`)

                const filePath = `./files/${key}/${fileName}`
                if (fs.existsSync(filePath)) {
                    console.log('  [CONSUME] processing...');

                    // 메시지 처리 완료
                    channel.ack(msg);
                }
                else {
                    console.log(`  [ERROR] "${key}/${fileName}" is not found...`);
                }

            }
        }, {
            noAck: false // 수신 확인 (acknowledge) 설정
        });
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
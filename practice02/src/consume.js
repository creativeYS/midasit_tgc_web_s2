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
        const dlx_queue = 'dlx_queue';

        await channel.assertQueue(queue, {
            durable: true, // 메시지를 영구적으로 유지
            arguments: {
                'x-message-ttl': 10000, // 메시지 TTL 10초 설정
                'x-dead-letter-exchange': 'my_dlx' // 만료된 메시지를 보내는 DLX 설정
            }
        });

        await channel.assertExchange('my_dlx', 'direct', { durable: true });
        await channel.assertQueue(dlx_queue, {
            durable: true
        });
        channel.bindQueue(dlx_queue, 'my_dlx', '');

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
                const ext = fileName.split('.').pop().toLowerCase();
                if (fs.existsSync(filePath) && ext === 'dwg') {
                    console.log('  [CONSUME] processing...');

                    const { exec } = require('child_process');
                    
                    // 파일 처리 완료
                    const outputDir = `./files/${key}/`;
                    const outputFileName = fileName.replace('.dwg', '.obj');
                    const outputPath = `${outputDir}${outputFileName}`;
                
                    const converterPath = `./app/dist/WebTools/FileConverter`; // 변환기 경로
                    
                    // 변환 명령어 생성
                    const command = `"${converterPath}" "${filePath}" "${outputPath}"`;
                
                    console.log(`  [CONVERT] Executing: ${command}`);
                
                    // 변환 실행
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`  [ERROR] Conversion failed: ${stderr}`);
                            channel.nack(msg, false, true); // 변환 실패 시 메시지 재전송
                            return;
                        }
                
                        console.log(`  [CONVERT] Conversion successful: ${stdout}`);
                        channel.ack(msg); // 변환 성공 시 메시지 처리 완료
                    });
                }
                else {
                    console.log(`  [ERROR] "${key}/${fileName}" is not found or unknown file format...`);
                    channel.nack(msg, false, true); // 메시지 재전송
                }
            }
        }, {
            noAck: false // 수신 확인 (acknowledge) 설정
        });

        channel.consume(dlx_queue, (msg) => {
            console.log(`[DLQ] Received ${msg.content.toString()}`);
            channel.ack(msg);
        }, {
            noAck: false // 수신 확인 (acknowledge) 설정
        });

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
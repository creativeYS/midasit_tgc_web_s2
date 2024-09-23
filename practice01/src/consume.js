const amqp = require('amqplib');

async function receiveMessage() {
    try {

        const connection = await amqp.connect('amqp://localhost');

        const channel = await connection.createChannel();

        const queue = 'task_queue';
        await channel.assertQueue(queue, {
            durable: true
        });

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const payload = JSON.parse(content);
                console.log(`[CONSUME] ${payload.name}`)
                channel.ack(msg);
            }
        }, {
            noAck: false
        });

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
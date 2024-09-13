const amqp = require('amqplib');

const queue = 'task_queue';

async function receiveMessage() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        process.once('SIGINT', async () => { 
            await channel.close();
            await connection.close();
        });

        await channel.assertQueue(queue, { durable: true });
        await channel.consume(queue, (message) => {
            const obj = JSON.parse(message.content.toString());
            console.log(obj.name);
        }, { noAck: true });

        console.log(' [*] Waiting for messages. To exit press CTRL+C');
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
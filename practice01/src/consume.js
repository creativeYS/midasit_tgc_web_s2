const amqp = require('amqplib');

async function receiveMessage() {
    try {
            const connection = await amqp.connect('amqp://localhost');
            const channel = await connection.createChannel();
            channel.consume("task_queue", async (msg) => {
 
            const msgBody = msg.content.toString();
            const msgParse = JSON.parse(msgBody)['name'];
            console.log(`[CONSUME] Received '${msgParse}'`);
           
            channel.ack(msg);
        });
 
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

receiveMessage();
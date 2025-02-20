// order-service/index.js
const amqp = require('amqplib');
const express = require('express');
const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://admin:admin@rabbitmq';
const ORDER_CREATED = 'order_created';

async function publishOrder(order) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(ORDER_CREATED, 'fanout', { durable: true });
    channel.publish(ORDER_CREATED, '', Buffer.from(JSON.stringify(order)));
    console.log('Order Created Event Published:', order);
    setTimeout(() => connection.close(), 500);
}

app.post('/order', async (req, res) => {
    const order = { id: Date.now(), items: req.body.items };
    await publishOrder(order);
    res.json({ message: 'Order placed', order });
});

app.listen(3001, () => console.log('Order Service running on port 3001'));

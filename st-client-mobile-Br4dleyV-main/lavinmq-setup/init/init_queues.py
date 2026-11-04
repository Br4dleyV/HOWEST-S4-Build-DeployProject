import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters(
    host='messagebroker.device.dev',
    port=5672,
    credentials=pika.PlainCredentials('guest', 'guest')
))
channel = connection.channel()

# Queues aanmaken
channel.queue_declare(queue='send-queue', durable=True)
channel.queue_declare(queue='receive-queue', durable=True)

print("Queues aangemaakt.")
connection.close()

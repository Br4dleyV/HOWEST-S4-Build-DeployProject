import pika
import uuid
import json
import datetime as dt
from datetime import timedelta

def generate_order(item_id, item_name, item_price, item_quantity, pickup_date, pickup_location):
    order = {
        "id": str(uuid.uuid4()),
        "items": [
            {
                "id": item_id,
                "name": item_name,
                "price": item_price,
                "quantity": item_quantity
            }
        ],
        "totalPrice": item_price * item_quantity,
        "pickupDate": pickup_date,
        "pickupLocation": pickup_location
    }
    return order

# {"id":"44b99cb9-b504-44fb-8f82-4cbe74455f99","items":[{"id":3,"name":"Froyo","price":5.0,"quantity":1}],"totalPrice":5.0,"pickupDate":"20/06/2026","pickupLocation":"Howest Brugge"}

def publish_orders():
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='messagebroker.device.dev',
        port=5672,
        credentials=pika.PlainCredentials('guest', 'guest')
    ))
    channel = connection.channel()
    orders = [
        generate_order(1, "Froyo", 5.0, 2, "20/06/2026", "Howest Brugge"),
        generate_order(2, "Donut", 5.0, 1, "20/06/2026", "Howest Brugge"),
        generate_order(3, "Cupcake", 5.0, 1, "20/06/2026", "Howest Brugge")
    ]

    for order in orders:
        channel.basic_publish(
            exchange='',
            routing_key='receive-queue',
            body=json.dumps(order),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
                content_type='application/json'
            )
        )
        print(f"✔ Order published : {order["items"]}")

    connection.close()

if __name__ == "__main__":
    publish_orders()

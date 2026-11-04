## Opzetten LavinMQ lokaal
- in map `lavinmq-setup` staat docker-compose.yml en een mapje init (bevat 2 python-script voor het aanmaken van queues en het toevoegen van een paar orders op de queue). 
- Voor commando 'docker compose up' uit om de messageBroker op te zetten, 2 queues aan te maken en 3 orders op de 'receive-queue' te plaatsen
- Toegang tot LavinMQ
    - AMQP: amqp://localhost:40300
    - Web UI (default credentials: guest / guest): http://localhost:40301
      - bekijk hier de receive-queue en je zou de 3 orders moeten zien

- Extra opmerking: domeinnaam messagebroker.device.dev is hier enkel als service-naam gebruikt. Lokaal hoef je die niet op te lossen, tenzij je applicatie expliciet verbinding maakt met die hostnaam. In dat geval kun je 127.0.0.1 messagebroker.device.dev toevoegen aan je /etc/hosts (Linux/macOS) of C:\Windows\System32\drivers\etc\hosts (Windows).
- Zorg dat poort 40300 en 40301 vrij zijn op je machine, of verander ze in het ports-gedeelte

##  Test Environment – LavinMQ MessageBroker with Docker

This repository contains a **ready-to-use test environment** for your app using [LavinMQ](https://lavinmq.com/) as a lightweight AMQP-compatible message broker. This setup is intended to help you test ticket reception and order publishing locally.

### What’s Included?

* A `docker-compose.yml` file to spin up LavinMQ
* Two Python scripts:

  * `init_queues.py`: Creates the required queues
  * `seed_orders.py`: Publishes **3 test orders** to the `receive-queue`

### How to Use It

1. **Get the code from Leho**
   Download the `lavinmq-setup.zip` file from Leho and extract it to a convenient location on your machine.

2. **Start LavinMQ with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Install Python dependencies (only once)**
   Make sure Python 3 and `pip` are installed, then run:

   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the queues**

   ```bash
   python init_queues.py
   ```

5. **Send test tickets**

   ```bash
   python seed_orders.py
   ```

---

### Message Queues Used

* `send-queue` – for publishing new orders 
* `receive-queue` – for retrieving confirmation info to pickup your order

---

### Sample Order Format

Each order message is sent in JSON format and contains fields like:

```json
{
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
```

You can modify or extend `seed_orders.py` to add more test cases as needed.

---

### LavinMQ Management Interface

Once running, you can view LavinMQ in your browser:

📎 [http://localhost:40301](http://localhost:40301)
**Username:** `guest`
**Password:** `guest`

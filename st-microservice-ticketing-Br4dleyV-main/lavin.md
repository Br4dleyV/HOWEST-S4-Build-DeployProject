# LavinMQ Manual Test Guide (Suggestion Service)

This service uses AMQP exchange `howestprime` (type `topic`) as defined in `config/asyncapi.yaml`.

- Incoming event consumed by this service: `thirdparty.service.suggestions.sendcreatesuggestion`
- Outgoing event published by this service: `howestprime.ticketing.suggestions.created`

## 1. Start broker and service

1. Start MongoDB + LavinMQ:
```bash
docker compose -f config/ticketing-howestprime-dev/docker-compose.yml up -d
```
2. Start service:
```bash
deno task run
```

LavinMQ UI:

- URL: `http://localhost:40101`
- User: `guest`
- Pass: `guest`

## 2. Verify inbound consumer (`WhenSuggestionSendCreateSuggestion`)

From AsyncAPI receive operation `WhenSuggestionSendCreateSuggestion`, the service auto-creates queue:

- `howestprime.Ticketing.WhenSuggestionSendCreateSuggestion`

In LavinMQ UI:

1. Open **Exchanges** and select `howestprime`.
2. Publish message with routing key `thirdparty.service.suggestions.sendcreatesuggestion`.
3. Use this JSON body (direct fields, no `payload` wrapper):

```json
{
    "email": "user@example.com",
    "title": "Improve booking performance",
    "description": "Cache frequently requested movie data to reduce latency."
}
```

## 3. Verify outbound publisher (`sendSuggestionCreated`)

Create a queue to inspect outbound messages:

1. Open **Queues** -> **Add Queue**.
2. Queue name: `test.suggestion.created`.
3. Durable: enabled.
4. Create queue.

Bind that queue:

1. Open **Exchanges** -> `howestprime`.
2. Add binding with destination type `queue`, destination `test.suggestion.created`, routing key `howestprime.ticketing.suggestions.created`.

Trigger publish by sending the inbound event from step 2.

Read the queue in LavinMQ UI (**Get messages**). You should receive a payload similar to:

```json
{
    "suggestionId": "8fdd8b8e-8de4-4b9a-8e16-868b72f4f469",
    "email": "user@example.com",
    "title": "Improve booking performance",
    "description": "Cache frequently requested movie data to reduce latency."
}
```

## 4. Troubleshooting

1. Restart service after changing `config/asyncapi.yaml`.
2. Confirm `.env` values:
   - `MESSAGING_LAVINMQ_ASYNCAPI_PATH=config/asyncapi.yaml`
   - `MESSAGING_LAVINMQ_HOSTNAME=localhost`
   - `MESSAGING_LAVINMQ_PORT=40100`
   - `MESSAGING_LAVINMQ_USER=guest`
   - `MESSAGING_LAVINMQ_PASS=guest`
3. Check logs for consumer registration:
   - `Registered consumer on exchange howestprime ... with operationId WhenSuggestionSendCreateSuggestion`
4. Check logs for publisher activity:
   - `Published domain event: howestprime.ticketing.suggestions.created to howestprime`

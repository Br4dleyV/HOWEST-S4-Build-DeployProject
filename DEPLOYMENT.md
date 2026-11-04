# Howest Prime als portfolio-demo

Deze opstelling gebruikt vier gratis Render Web Services. Neon bewaart de Movies-data,
MongoDB Atlas de Ticketing-data en CloudAMQP de berichten. Azure Terraform en de
documentatiewebsite worden niet gedeployd. De Android-app wordt een downloadbare APK.

`render.yaml` maakt de vier services aan, met de juiste projectmappen, poorten en
onderlinge API-URLs. Er worden geen betaalde Render-databases of disks aangemaakt.
Render Free mag slapen: de eerste bezoeker moet mogelijk wachten en een actie
opnieuw proberen wanneer meerdere services nog opstarten. Tijdens het slapen
verwerken de microservices geen berichten. De gratis draaiuren worden gedeeld.

## 1. PostgreSQL bij Neon

1. Maak een account op [Neon](https://console.neon.tech/) en kies het Free-plan.
2. Maak een project `howestprime`, bij voorkeur in een Europese regio dicht bij Frankfurt.
3. Gebruik een database, bijvoorbeeld `neondb`, of maak `howestprime_movies` aan.
4. Open **Connect** en kies de verbindingsgegevens voor **.NET / Npgsql**.
   Gebruik voor deze demo een directe verbinding (connection pooling uit), omdat
   Movies bij het opstarten ook database-migraties uitvoert.
5. Bewaar de volledige Npgsql-connectionstring voor Render. Bijvoorbeeld:

   ```text
   Host=JOUW-HOST;Port=5432;Database=neondb;Username=JOUW-USER;Password=JOUW-WACHTWOORD;SSL Mode=Require;Timeout=60
   ```

Gebruik de echte waarden uit Neon. Een `postgresql://...`-URL is niet het formaat
dat deze .NET-app verwacht. Neem eventuele aanvullende TLS-opties uit Neon over.
De Movies-app maakt bij de eerste start tabellen en voorbeeldfilms aan; de seeder
maakt geen voorstellingen aan. Plan die later via de backoffice.

Bronnen: [Neon Free](https://neon.com/pricing),
[Neon met Npgsql](https://neon.com/docs/guides/dotnet-npgsql).

## 2. MongoDB Atlas

1. Maak een account op [MongoDB Atlas](https://cloud.mongodb.com/).
2. Maak een project `howestprime` en kies een **Free / M0**-cluster in Europa.
   Selecteer geen betaalde cluster of proefplan.
3. Maak onder **Database Access** een databasegebruiker met lees- en schrijfrechten
   voor `howestprime_ticketing`. Dit is een andere login dan je Atlas-account.
4. Open **Connect → Drivers** en kopieer de Node.js-driver-connectionstring.
5. Vul het databasewachtwoord in en zet de databasenaam vóór het vraagteken:

   ```text
   mongodb+srv://USER:URL_ENCODED_PASSWORD@JOUW-CLUSTER.mongodb.net/howestprime_ticketing?retryWrites=true&w=majority
   ```

   Speciale tekens in gebruikersnaam en wachtwoord moeten URL-encoded zijn.
   Voeg geen poort toe aan een `mongodb+srv`-URL.
6. Zodra de Render-services aangemaakt zijn: open bij Ticketing **Connect → Outbound**.
   Voeg alle getoonde IP-ranges toe aan Atlas **Network Access**. Herdeploy Ticketing
   als de eerste deployment hierdoor nog geen databaseverbinding kon maken.

De app gebruikt de complete URI; de oude afzonderlijke lokale databasevelden zijn
dan niet nodig. `directConnection` staat voor Atlas op `false`.

Bronnen: [Atlas Free-cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/),
[Atlas IP-toegang](https://www.mongodb.com/docs/atlas/security/ip-access-list/),
[Render outbound IPs](https://render.com/docs/outbound-ip-addresses).

## 3. CloudAMQP

1. Maak een account op [CloudAMQP](https://customer.cloudamqp.com/).
2. Kies een gratis gedeelde **LavinMQ**-instance (momenteel **Loyal Lemming**).
   Kies indien beschikbaar een Europese regio.
3. Open de instance en kopieer de volledige **AMQPS URL**, inclusief gebruikersnaam,
   wachtwoord en virtual host. Gebruik de TLS-variant `amqps://`.
4. Bewaar die URL voor Render. Bijvoorbeeld:

   ```text
   amqps://USER:PASSWORD@JOUW-BROKER/VHOST
   ```

De Movies- en Ticketing-services moeten dezelfde broker en virtual host gebruiken.
Hun eigen AsyncAPI-bestanden bepalen de exchanges en queues; die registreren ze
bij het opstarten. Deel deze provider-URL niet als publieke download of in GitHub.

Bron: [CloudAMQP-plannen](https://www.cloudamqp.com/plans/).

## 4. Vier services via een Render Blueprint

De voorbereide wijzigingen moeten eerst op GitHub staan.

1. Open [Render](https://dashboard.render.com/) en kies **New → Blueprint**.
2. Verbind `Br4dleyV/HOWEST-S4-Build-DeployProject`, branch `main`.
3. Gebruik `render.yaml` uit de hoofdmap.
4. Controleer dat alle vier services op **Free** staan.
5. Render vraagt drie geheime waarden:

   | Render-service | Variabele | Waarde |
   |---|---|---|
   | Movies | `Database__ConnectionString` | Volledige Npgsql-connectionstring uit Neon |
   | Movies | `MessageBroker__ConnectionString` | Volledige `amqps://`-URL uit CloudAMQP |
   | Ticketing | `PERSISTENCE_MONGO_DB_URI` | Volledige Atlas-URI met `howestprime_ticketing` als database |

6. Start de Blueprint-deployment. Voeg daarna de outbound IP-ranges van Ticketing
   aan Atlas toe zoals hierboven beschreven.
7. Wacht tot alle services live zijn. Bij nieuwe of gewijzigde providergegevens
   sla je de environment variables opnieuw op en redeploy je de betrokken services.

Ticketing neemt de broker-URL over van Movies. De andere onderlinge URLs verwijzen
naar de publieke Render-URLs, zodat een HTTP-verzoek een slapende API kan wekken.
De Howest-webapp gebruikt de vaste Docker Hub-digest van de bewaarde Linux/AMD64-image.
De image genereert bij het starten `config.js` uit de twee `VITE_APP_*`-variabelen.
Daar horen alleen publieke API-URLs in.

De volledige projectmappen staan als `rootDir` ingesteld. De bestaande workflows in
submappen hoeven hiervoor niet verplaatst te worden: Render bouwt zelf de Dockerfiles.

Als je servicenamen wijzigt, pas ook alle bijbehorende `fromService.name`-verwijzingen
in `render.yaml` aan. Verandert later een bronwaarde, sync dan de Blueprint en controleer
of de ontvangende services de nieuwe waarde hebben gekregen.

Bronnen: [Render Blueprints](https://render.com/docs/blueprint-spec),
[Render monorepo's](https://render.com/docs/monorepo-support),
[Render Free-beperkingen](https://render.com/docs/free).

## 5. Controleren na deployment

Gebruik de echte URLs die Render toont; namen kunnen een extra suffix krijgen.

1. Open de Movies-URL met `/health`: verwacht HTTP 200.
2. Open de Ticketing-URL met `/api/health`: verwacht HTTP 200.
3. Open Ticketing met `/api/suggestions`: dit moet de MongoDB-verbinding werkelijk
   gebruiken en een lijst opleveren. Een healthcheck alleen bewijst dat niet.
4. Open de backoffice. Controleer of je voorbeeldfilms ziet. Maak een testfilm en
   plan een toekomstige voorstelling; controleer daarna de Howest-klantenwebsite.
5. Doorloop een boeking en betaling met testgegevens. Controleer zowel de API-responses
   als de logs van beide services en de queues bij CloudAMQP.
6. Laat de services slapen en herhaal een bezoek en boeking. Tijdens het ontwaken
   kan een eerste aanvraag een timeout geven; herhaal die pas nadat de APIs wakker zijn.

De databases blijven buiten de Render-containers staan. Bestanden in de containers
zijn tijdelijk. Backoffice gebruikt Blazor Server: na slapen of herstarten kan een
browser-refresh nodig zijn. Bewaar alleen demo-gegevens; de bestaande backoffice
heeft geen volledige toegangsbeveiliging voor een echte productieomgeving.

## 6. Android-app als APK

De mobiele app is een apart schoolonderdeel. De snack-API wijst nu naar de docent;
de broker gebruikt `10.0.2.2:40300` en `guest`. Ook de mobiele queueberichten verschillen
van de Ticketing-events. Een cloud-URL invullen maakt die koppeling niet vanzelf af.

Voor een eerste distributie:

1. Open `st-client-mobile-Br4dleyV-main` in Android Studio.
2. Configureer een publieke Mapbox-token via `MAPBOX_ACCESS_TOKEN` in
   `%USERPROFILE%/.gradle/gradle.properties`.
3. Controleer de bereikbaarheid van de snack-API. Voor brokerfuncties zijn nog een
   TLS/virtual-host-configuratie en een passende mobiele backend of eventvertaling nodig.
   Stop de volledige gedeelde cloudbroker-credentials niet in een publiek verspreide APK.
4. Kies **Build → Generate Signed App Bundle / APK → APK**. Bewaar je signing-keystore
   buiten Git en maak er een back-up van: je hebt dezelfde sleutel nodig voor updates.
5. Installeer en test de APK op een Android-toestel (de huidige `minSdk` is 34).
6. Upload de geteste APK als GitHub Release en link die vanuit je portfolio.
   Vermeld welke functies live werken en welke een lokale demo vereisen.

Bron: [Android app signing](https://developer.android.com/studio/publish/app-signing).

## Verificatie van deze voorbereiding

De Blueprint wordt lokaal gecontroleerd tegen het gepubliceerde Render JSON-schema.
Docker-builds en lokale tests zijn afzonderlijke controles; ze bewijzen geen verbinding
met jouw Neon-, Atlas- of CloudAMQP-account. Voer na het aanmaken van die accounts de
checks hierboven uit voordat je de URLs als werkende demo publiceert.

Lokaal gecontroleerd op 4 november 2026:

- Alle drie Dockerfiles bouwen succesvol; de Howest-image start ook op.
- De Movies-tests slagen (325); de gerichte Ticketing MongoDB-tests slagen (14).
- Beide API-healthchecks, de Movies-programmatie, Ticketing-suggesties, de backoffice,
  de Howest-homepage en de gegenereerde webapp-configuratie geven HTTP 200.
- Beide APIs starten opnieuw op met de bestaande lokale databases en broker.
- Een nieuwe film wordt via AMQP opgeslagen in Ticketing. Een daaropvolgende
  voorstelling en boeking leveren een Ticketing-order met een ticket op.

De integratietest gebruikte echte lokale PostgreSQL-, MongoDB-replica-set- en
LavinMQ-containers. De provider-TLS-verbindingen, een volledige betaling en de
Android-build zijn nog niet live getest. Een bestaande NuGet-waarschuwing over
`Microsoft.OpenApi` 2.0.0 blijft buiten deze deploymentwijziging.

Bij het voorbereiden is ook het bestaande `MovieRegistered`-bericht hersteld:
het bevat nu de filmsnapshot met `durationMinutes` en een tekstuele `ageRating`,
zoals Ticketing die verwacht. Het Movies AsyncAPI-contract en een regressietest
zijn hiermee bijgewerkt.

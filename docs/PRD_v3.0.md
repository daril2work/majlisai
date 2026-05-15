# MajlisAI National Aggregator PRD v3.0

## Vision
To create the most comprehensive and reliable aggregator for Salafy Islamic events across Indonesia, leveraging AI for data extraction and PostGIS for location-based discovery.

## Key Features
1. **Automated Ingestion (WhatsApp/Telegram)**:
   - Bot receives event posters from groups.
   - AI extracts details (Date, Time, Location, Topic, Speaker).
   - Duplicate detection using Image Hashing.

2. **Proximity Search**:
   - Find events within a specific radius of the user.
   - Interactive map view.

3. **Salafy Gate (AI Guard)**:
   - Strict validation of speakers and content to ensure alignment with the Salafy manhaj.
   - Classification score threshold: 0.75.

4. **Multi-Source Support**:
   - Integration with Fonnte for WhatsApp.
   - Future support for Telegram scraping.

## Success Metrics
- 100% automated ingestion for supported channels.
- < 100ms proximity search response time.
- Accurate deduplication of posters.

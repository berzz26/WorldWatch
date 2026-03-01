

# WorldWatch

WorldWatch is an automated geopolitical intelligence pipeline built with Bun.

It aggregates global news from multiple RSS sources, filters new events, summarizes them using Gemini, and delivers structured HTML intelligence briefs via email on a fixed schedule.

The system is designed to be modular, extensible, and free-tier friendly.

---

## Architecture

The pipeline follows a simple flow:

Sources → Aggregation → Deduplication → Gemini Summarization → HTML Formatting → Email Delivery → State Update

* Sources: Global news, government feeds, Indian media, and Reddit RSS.
* Aggregation: Normalizes all feeds into a common event structure.
* Deduplication: Filters previously processed links using local state.
* Summarization: Uses Gemini for large-context structured analysis.
* Formatting: Generates a clean HTML intelligence report.
* Delivery: Sends formatted reports via email.
* State: Persists processed links in `state.json`.

---

## Tech Stack

* Runtime: Bun
* Scraping: RSS + Cheerio (where required)
* AI: Gemini API
* Email: Nodemailer
* Storage: Local JSON state file

No paid APIs required beyond Gemini free tier.

---

## Project Structure

```
src/
  config/
  types/
  sources/
  core/
  ai/
  delivery/
  storage/
  scheduler/
  index.ts
```

* `sources/` handles ingestion.
* `core/` contains aggregation, deduplication, and formatting logic.
* `ai/` wraps Gemini integration.
* `delivery/` handles email transport.
* `storage/` manages persistent state.
* `scheduler/` runs periodic jobs.
* `index.ts` is the entry point.

---

## Setup

1. Install dependencies:

```
bun install
```

2. Create a `.env` file:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_key
```

3. Start the service:

```
bun run src/index.ts
```

---

## State Management

`state.json` stores previously processed links.

This prevents duplicate reports and enables incremental updates.

Deleting this file will cause the system to resend all current feed items.

---

## Customization

* Add or remove RSS feeds in `config/sources.ts`.
* Adjust execution interval in `config/settings.ts`.
* Modify summarization prompt in `ai/geminiClient.ts`.
* Update email styling in `core/formatter.ts`.

---

## Design Principles

* Modular separation of concerns
* Failure isolation per source
* Structured AI output over raw text
* Minimal external dependencies
* Easy migration to database-backed state

---

WorldWatch is not a news scraper.
It is a structured, periodic intelligence aggregation system.

---

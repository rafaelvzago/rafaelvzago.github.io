# Feature Specification: QR Code System

**Created**: 2026-04-15
**Status**: Baseline (brownfield)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Author generates QR codes for URLs (Priority: P1)

The author adds a new URL entry to `qr/urls.txt` and runs the Python script to generate a QR code image and update the JSON mapping.

**Why this priority**: QR codes are generated before being printed or shared at events.

**Independent Test**: Add a row to `urls.txt`, run `python qr/gerar_qrcodes.py`, and verify a new PNG file and updated `urls.json` are created.

**Acceptance Scenarios**:

1. **Given** `urls.txt` contains `3,https://example.com`, **When** the script runs, **Then** `qr/qrcode_3.png` is created and `qr/urls.json` includes `{"3": "https://example.com"}`
2. **Given** an existing entry in `urls.txt` is modified, **When** the script runs, **Then** the corresponding QR code image is regenerated

---

### User Story 2 - Visitor scans a QR code and gets redirected (Priority: P1)

A person scans a printed QR code at an event. The QR code encodes a URL like `https://www.rafaelvzago.com/qr/?id=1`. The browser loads the QR landing page, which fetches `urls.json` and redirects to the mapped URL.

**Why this priority**: This is the end-user facing functionality of the system.

**Independent Test**: Open `https://www.rafaelvzago.com/qr/?id=1` in a browser and verify it redirects to `https://www.rafaelvzago.com`.

**Acceptance Scenarios**:

1. **Given** a QR code encodes `https://www.rafaelvzago.com/qr/?id=1`, **When** the visitor's browser loads the page, **Then** it fetches `urls.json`, finds the URL for id `1`, and redirects
2. **Given** the id parameter is missing, **When** the page loads, **Then** it displays "ID nao especificado."
3. **Given** the id does not exist in `urls.json`, **When** the page loads, **Then** it displays "ID nao encontrado."

---

### Edge Cases

- What happens when the URL in `urls.json` does not have a protocol prefix? The `ensureAbsoluteUrl()` function prepends `https://`.
- What happens when `urls.json` fails to load? The page displays "Erro ao carregar as URLs."

## Requirements

### Functional Requirements

- **FR-001**: `qr/gerar_qrcodes.py` MUST read `qr/urls.txt` (CSV: id,url) and generate one PNG per entry
- **FR-002**: QR codes MUST encode the URL `https://www.rafaelvzago.com/qr/?id=<ID>`
- **FR-003**: The script MUST output `qr/urls.json` mapping IDs to destination URLs
- **FR-004**: `qr/index.html` MUST read the `id` query parameter, fetch `urls.json`, and redirect to the mapped URL
- **FR-005**: `qr/index.html` MUST handle missing id, unknown id, and fetch errors with user-friendly messages in Portuguese
- **FR-006**: `static/qr/index.html` MUST be plain static HTML (no Hugo/theme wrapper)

### Key Entities

- **URL Entry**: A row in `urls.txt` with an integer ID and a destination URL
- **QR Code Image**: A PNG file (`qrcode_<ID>.png`) encoding the redirect URL
- **URL Map**: A JSON file (`urls.json`) mapping IDs to destination URLs
- **Redirect Page**: `qr/index.html` — client-side JavaScript that performs the redirect

## Current Implementation

| Concern | File(s) |
|---------|---------|
| URL registry | `qr/urls.txt` |
| Generator script | `qr/gerar_qrcodes.py` (requires `qrcode` Python package) |
| URL map | `qr/urls.json` (generated) |
| Redirect page | `qr/index.html` |

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every ID in `urls.txt` has a corresponding QR code PNG in `qr/`
- **SC-002**: `urls.json` is valid JSON and contains all entries from `urls.txt`
- **SC-003**: Redirect from `?id=<ID>` to the correct URL completes within 2 seconds
- **SC-004**: Error messages display correctly for invalid/missing IDs

## Assumptions

- The Python `qrcode` library is installed in the author's local environment
- QR code images are committed to the repository (they are small PNGs)
- The redirect page is served as static files under `static/qr/` at `/qr/` (no Hugo wrapper)
- Google Analytics on the main site captures QR-driven traffic via the redirect

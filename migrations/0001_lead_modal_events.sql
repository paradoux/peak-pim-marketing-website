CREATE TABLE IF NOT EXISTS lead_modal_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('modal_view', 'modal_dismiss', 'modal_submit')),
  offer_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('automatic', 'manual', 'query')),
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'mobile')),
  page_path TEXT NOT NULL,
  referrer_host TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_modal_events_created_at
  ON lead_modal_events(created_at);

CREATE INDEX IF NOT EXISTS idx_lead_modal_events_event_type_created_at
  ON lead_modal_events(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_lead_modal_events_page_path_created_at
  ON lead_modal_events(page_path, created_at);

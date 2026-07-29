type D1Result<T> = {
  results?: T[];
};

type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T>() => Promise<D1Result<T>>;
};

type D1Database = {
  prepare: (query: string) => D1Statement;
};

type PagesContext = {
  request: Request;
  env: {
    LEAD_ANALYTICS?: D1Database;
  };
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function safeDays(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("days") || 30);
  return [7, 30, 90].includes(value) ? value : 30;
}

export const onRequestGet = async ({ request, env }: PagesContext) => {
  if (!env.LEAD_ANALYTICS) {
    return json({ ok: false, message: "Lead analytics is not configured." }, 503);
  }

  const days = safeDays(request);
  const windowModifier = `-${days - 1} days`;

  try {
    const [summary, byDay, byPage, byTrigger, byDevice] = await Promise.all([
      env.LEAD_ANALYTICS.prepare(
        `SELECT event_type AS eventType, COUNT(*) AS total
         FROM lead_modal_events
         WHERE created_at >= datetime('now', ?)
         GROUP BY event_type`,
      )
        .bind(windowModifier)
        .all<{ eventType: string; total: number }>(),
      env.LEAD_ANALYTICS.prepare(
        `SELECT date(created_at) AS date, event_type AS eventType, COUNT(*) AS total
         FROM lead_modal_events
         WHERE created_at >= datetime('now', ?)
         GROUP BY date(created_at), event_type
         ORDER BY date(created_at) ASC`,
      )
        .bind(windowModifier)
        .all<{ date: string; eventType: string; total: number }>(),
      env.LEAD_ANALYTICS.prepare(
        `SELECT
           page_path AS pagePath,
           SUM(CASE WHEN event_type = 'modal_view' THEN 1 ELSE 0 END) AS views,
           SUM(CASE WHEN event_type = 'modal_dismiss' THEN 1 ELSE 0 END) AS dismissals,
           SUM(CASE WHEN event_type = 'modal_submit' THEN 1 ELSE 0 END) AS submissions
         FROM lead_modal_events
         WHERE created_at >= datetime('now', ?)
         GROUP BY page_path
         ORDER BY views DESC, submissions DESC
         LIMIT 30`,
      )
        .bind(windowModifier)
        .all<{ pagePath: string; views: number; dismissals: number; submissions: number }>(),
      env.LEAD_ANALYTICS.prepare(
        `SELECT trigger_type AS label, event_type AS eventType, COUNT(*) AS total
         FROM lead_modal_events
         WHERE created_at >= datetime('now', ?)
         GROUP BY trigger_type, event_type
         ORDER BY trigger_type, event_type`,
      )
        .bind(windowModifier)
        .all<{ label: string; eventType: string; total: number }>(),
      env.LEAD_ANALYTICS.prepare(
        `SELECT device_type AS label, event_type AS eventType, COUNT(*) AS total
         FROM lead_modal_events
         WHERE created_at >= datetime('now', ?)
         GROUP BY device_type, event_type
         ORDER BY device_type, event_type`,
      )
        .bind(windowModifier)
        .all<{ label: string; eventType: string; total: number }>(),
    ]);

    return json({
      ok: true,
      days,
      generatedAt: new Date().toISOString(),
      summary: summary.results ?? [],
      byDay: byDay.results ?? [],
      byPage: byPage.results ?? [],
      byTrigger: byTrigger.results ?? [],
      byDevice: byDevice.results ?? [],
    });
  } catch {
    return json({ ok: false, message: "Lead analytics could not be loaded." }, 500);
  }
};

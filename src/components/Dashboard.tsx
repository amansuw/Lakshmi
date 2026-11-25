"use client";

import { Sparkline } from "@/components/Sparkline";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { npr, pct, usd, when } from "@/lib/format";
import type { MarketSnapshot } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export function Dashboard() {
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastPollSaved, setLastPollSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load market");
      setData(body as MarketSnapshot);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePoll = useCallback(async () => {
    try {
      const res = await fetch("/api/poll", { method: "POST" });
      const body = await res.json();
      if (res.ok && body.saved?.at) setLastPollSaved(body.saved.at);
    } catch {
      // Poll persistence is best-effort.
    }
  }, []);

  useEffect(() => {
    void load().then(() => savePoll());
    const id = window.setInterval(() => {
      void load().then(() => savePoll());
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [load, savePoll]);

  if (loading && !data) {
    return <p className="status">Fetching Kathmandu and London gold…</p>;
  }

  if (error && !data) {
    return <p className="status error">{error}</p>;
  }

  if (!data) return null;

  const dayChange = data.nepal.changePct;
  const dayUp = (dayChange ?? 0) >= 0;

  return (
    <div className="dash">
      <header className="hero">
        <p className="brand">Lakshmi</p>
        <h1>Nepal gold, read against the world market</h1>
        <p className="lede">
          Official FENEGOSIDA rates, live international spot, and horizon
          forecasts for when Kathmandu opens after overnight moves.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => void load()}>
            Refresh now
          </button>
          <span className="meta">
            Updated {when(data.fetchedAt)} · polls every hour
            {lastPollSaved ? ` · last saved ${when(lastPollSaved)}` : ""}
          </span>
        </div>
        <div className="hero-visual" aria-hidden="true" />
      </header>

      <section className="strip" aria-label="Latest prices">
        <div>
          <p className="kicker">Nepal fine gold · 10g</p>
          <p className="figure">{npr(data.nepal.fineGoldPer10g)}</p>
          <p className={dayUp ? "delta up" : "delta down"}>
            {pct(dayChange)} vs yesterday · {npr(data.nepal.fineGoldPerTola)} /
            tola
          </p>
        </div>
        <div>
          <p className="kicker">International spot · XAU</p>
          <p className="figure">{usd(data.spot.usdPerOz)}</p>
          <p className="delta muted">
            per troy oz · {data.spot.source} · USD/NPR{" "}
            {data.fx.usdToNpr.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="kicker">Implied Nepal from spot</p>
          <p className="figure">{npr(data.estimatedNepalFromSpot.per10g)}</p>
          <p className="delta muted">
            duty stack estimate · gap{" "}
            {pct(data.estimatedNepalFromSpot.premiumVsOfficialPct)}
          </p>
        </div>
      </section>

      <section className="panel open-move">
        <h2>When the Nepal market opens</h2>
        <p>
          Overnight international move{" "}
          <strong>{pct(data.openMove.overnightIntlChangePct)}</strong>. Implied
          next FENEGOSIDA print{" "}
          <strong>{npr(data.openMove.impliedNepalPer10g)}</strong> (
          {pct(data.openMove.impliedNepalOpenChangePct)}) — about{" "}
          {pct(data.openMove.gapToImpliedPct)} from today&apos;s official rate.
        </p>
        <p className="note">{data.openMove.note}</p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>International trail</h2>
          <Sparkline points={data.history.international} />
        </div>
        <div className="panel-head nepal-chart">
          <h2>Nepal FENEGOSIDA trail</h2>
          <Sparkline points={data.history.nepal} stroke="var(--jade)" />
        </div>
      </section>

      <section className="panel">
        <h2>Horizon forecasts</h2>
        <p className="note">
          Heuristic model from momentum, mean reversion, volatility, and
          sentiment — directional guide only, not advice.
        </p>
        <div className="forecast-grid">
          {data.forecasts.map((f) => (
            <article key={f.horizon} className={`forecast ${f.direction}`}>
              <h3>{f.label}</h3>
              <p className="figure sm">{pct(f.expectedChangePct)}</p>
              <p className="range">
                band {pct(f.lowChangePct)} → {pct(f.highChangePct)}
              </p>
              <p className="targets">
                Intl {usd(f.internationalUsdPerOz)} · NP{" "}
                {npr(f.nepalFineGoldPer10g)}
              </p>
              <p className="conf">
                confidence {(f.confidence * 100).toFixed(0)}%
              </p>
              <p className="rationale">{f.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel sentiment">
        <h2>Market sentiment</h2>
        {data.sentiment ? (
          <>
            <p className={`badge ${data.sentiment.label.toLowerCase()}`}>
              {data.sentiment.label} · {data.sentiment.composite.toFixed(2)}
            </p>
            <p className="note">
              News {data.sentiment.newsScore?.toFixed(2) ?? "—"} ·
              Institutional{" "}
              {data.sentiment.institutionalScore?.toFixed(2) ?? "—"} · via{" "}
              {data.sentiment.source}
            </p>
            <ul className="headlines">
              {data.sentiment.headlines.map((h) => (
                <li key={`${h.publishedAt}-${h.title}`}>
                  <span className={h.score >= 0 ? "up" : "down"}>
                    {pct(h.score * 100, 0)}
                  </span>
                  {h.title}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="note">Sentiment feed unavailable right now.</p>
        )}
      </section>

      <section className="panel sources">
        <h2>Live data sources (hourly poll friendly)</h2>
        <ul>
          {data.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
              <span>{s.pollHint}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

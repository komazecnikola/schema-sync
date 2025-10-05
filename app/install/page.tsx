"use client";
import { useEffect, useMemo, useState } from "react";

type Site = { id: string; displayName?: string; shortName?: string };
type Field = {
  id: string;
  name: string;
  slug: string;
  type: string;
  metadata?: any;
};
type Collection = {
  id: string;
  displayName: string;
  singularName?: string;
  fields: Field[];
};

export default function InstallPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [blogCollectionId, setBlogCollectionId] = useState("");
  const [blogFields, setBlogFields] = useState<Field[]>([]);
  const [faqMultiRefSlug, setFaqMultiRefSlug] = useState("");
  const [faqCollectionId, setFaqCollectionId] = useState("");
  const [faqFields, setFaqFields] = useState<Field[]>([]);
  const [questionFieldSlug, setQuestionFieldSlug] = useState("");
  const [answerFieldSlug, setAnswerFieldSlug] = useState("");
  const [outputFieldSlug, setOutputFieldSlug] = useState("faq-jsonld");
  const [autoPublish, setAutoPublish] = useState(true);

  // Load sites
  useEffect(() => {
    fetch("/api/webflow/sites")
      .then((r) => r.json())
      .then((res) => {
        setSites(Array.isArray(res) ? res : []);
      })
      .catch(() => setSites([]));
  }, []);

  // Load collections when site changes
  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/webflow/sites/${siteId}/collections`)
      .then((r) => r.json())
      .then(setCollections)
      .catch(console.error);
  }, [siteId]);

  // Load Blog fields when Blog collection changes
  useEffect(() => {
    if (!blogCollectionId) return;
    fetch(`/api/webflow/collections/${blogCollectionId}`)
      .then((r) => r.json())
      .then((col: Collection) => setBlogFields(col.fields || []))
      .catch(console.error);
  }, [blogCollectionId]);

  // When multi-ref chosen, infer FAQ collection id from the multi-ref field object
  useEffect(() => {
    if (!faqMultiRefSlug || !blogFields.length) {
      setFaqCollectionId("");
      return;
    }
    const mf = blogFields.find((f) => f.slug === faqMultiRefSlug);

    // Try a few shapes Webflow uses for reference metadata
    const fromMeta = (mf as any)?.metadata?.collectionId;
    const fromRef = (mf as any)?.reference?.collectionId; // some responses use .reference
    const fromConfig = (mf as any)?.settings?.collectionId; // older shapes

    const refColId = fromMeta || fromRef || fromConfig || "";
    setFaqCollectionId(refColId);

    // Optional: log to help inspect the field shape in your site
    if (!refColId) {
      // eslint-disable-next-line no-console
      console.log("Multi-ref field object (no collectionId found):", mf);
    }
  }, [faqMultiRefSlug, blogFields]);

  // Load FAQ fields when FAQ collection id is known
  useEffect(() => {
    if (!faqCollectionId) {
      setFaqFields([]);
      return;
    }
    fetch(`/api/webflow/collections/${faqCollectionId}`)
      .then((r) => r.json())
      .then((col) => setFaqFields(col.fields || []))
      .catch((err) => {
        console.error(err);
        setFaqFields([]);
      });
  }, [faqCollectionId]);

  const multiRefCandidates = useMemo(
    () => blogFields.filter((f) => ["Set", "MultiReference"].includes(f.type)),
    [blogFields]
  );

  const questionCandidates = useMemo(
    () =>
      faqFields.filter((f) =>
        ["PlainText", "Text", "String", "Slug", "ShortText"].includes(f.type)
      ),
    [faqFields]
  );

  const answerCandidates = useMemo(
    () =>
      faqFields.filter((f) =>
        ["RichText", "PlainText", "Text", "String", "LongText"].includes(f.type)
      ),
    [faqFields]
  );

  async function onInstall() {
    if (
      !siteId ||
      !blogCollectionId ||
      !faqMultiRefSlug ||
      !faqCollectionId ||
      !questionFieldSlug ||
      !answerFieldSlug ||
      !outputFieldSlug
    ) {
      alert("Please complete all fields.");
      return;
    }
    const body = {
      siteId,
      blogCollectionId,
      faqMultiRefSlug,
      faqCollectionId,
      questionFieldSlug,
      answerFieldSlug,
      outputFieldSlug,
      autoPublish,
    };
    const res = await fetch("/api/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      alert("Install failed: " + t);
    } else {
      alert("Installed! Webhooks registered.");
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <h1>Install — FAQ JSON-LD</h1>

      <label style={{ display: "block", marginTop: 16 }}>Site</label>
      <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
        <option value="">Select site…</option>
        {Array.isArray(sites) &&
          sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName || s.shortName || s.id}
            </option>
          ))}
      </select>

      <label style={{ display: "block", marginTop: 16 }}>Blog collection</label>
      <select
        value={blogCollectionId}
        onChange={(e) => setBlogCollectionId(e.target.value)}
        disabled={!siteId}
      >
        <option value="">Select blog collection…</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.displayName}
          </option>
        ))}
      </select>

      <label style={{ display: "block", marginTop: 16 }}>
        FAQ Multi-reference field on Blog
      </label>
      <select
        value={faqMultiRefSlug}
        onChange={(e) => setFaqMultiRefSlug(e.target.value)}
        disabled={!blogCollectionId}
      >
        <option value="">Select multi-reference field…</option>
        {multiRefCandidates.map((f) => (
          <option key={f.id} value={f.slug}>
            {f.name} ({f.slug})
          </option>
        ))}
      </select>

      <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
        Detected FAQ collection ID: <b>{faqCollectionId || "—"}</b>
      </div>

      {!faqCollectionId && (
        <div style={{ marginTop: 8 }}>
          <label>FAQ collection ID (manual override)</label>
          <input
            type="text"
            placeholder="e.g. 66e9f...c3a"
            onBlur={(e) => setFaqCollectionId(e.target.value.trim())}
            style={{ display: "block", width: "100%", maxWidth: 480 }}
          />
          <div style={{ fontSize: 12, color: "#777" }}>
            (Copy from Webflow → Collections → the URL of your FAQ collection.)
          </div>
        </div>
      )}

      <label style={{ display: "block", marginTop: 16 }}>
        FAQ Question field (in FAQ collection)
      </label>
      <select
        value={questionFieldSlug}
        onChange={(e) => setQuestionFieldSlug(e.target.value)}
        disabled={!faqCollectionId}
      >
        <option value="">Select question field…</option>
        {questionCandidates.map((f) => (
          <option key={f.id} value={f.slug}>
            {f.name} ({f.slug})
          </option>
        ))}
      </select>

      <label style={{ display: "block", marginTop: 16 }}>
        FAQ Answer field (in FAQ collection)
      </label>
      <select
        value={answerFieldSlug}
        onChange={(e) => setAnswerFieldSlug(e.target.value)}
        disabled={!faqCollectionId}
      >
        <option value="">Select answer field…</option>
        {answerCandidates.map((f) => (
          <option key={f.id} value={f.slug}>
            {f.name} ({f.slug})
          </option>
        ))}
      </select>

      <label style={{ display: "block", marginTop: 16 }}>
        Output field on Blog (Plain Text)
      </label>
      <input
        type="text"
        value={outputFieldSlug}
        onChange={(e) => setOutputFieldSlug(e.target.value)}
        placeholder="faq-jsonld"
      />

      <label style={{ display: "block", marginTop: 16 }}>
        <input
          type="checkbox"
          checked={autoPublish}
          onChange={(e) => setAutoPublish(e.target.checked)}
        />{" "}
        Auto-publish post after update
      </label>

      <button
        onClick={onInstall}
        style={{ marginTop: 20, padding: "10px 16px" }}
        disabled={!siteId}
      >
        Install (register webhooks)
      </button>
    </main>
  );
}

import React, { useState } from "react";
import {
  Archive,
  ChevronDown,
  Copy,
  Eye,
  MousePointerClick,
  Pipette,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  Button,
  Drawer,
  SegmentedControl,
  Switch,
  UploadZone,
  useToast,
} from "../index";
import { getCohorts } from "../../../data/mockCms";
import {
  POPUP_CREATIVE,
  createPopup,
  getPopup,
  popupButtonCpids,
  popupCpids,
  setPopupStatus,
  updatePopup,
} from "../../../data/mockPopups";
import ImageColorPicker from "../ImageColorPicker";
import PopupSheetPreview from "./PopupSheetPreview";
import { isHex } from "./contrast";

const inputClass =
  "w-full h-10 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100";

const BLANK = {
  name: "",
  page: "home",
  destination: "",
  triggerType: "page", // page | scroll | event — the app's popup trigger types
  triggerPage: "home",
  triggerScroll: 50,
  triggerEvent: "", // event key the app raises, e.g. enquiry_submitted
  toast: "",
  closeCorner: "top_right",
  dividerLabel: "",
  bg: "#1E40AF",
  appendCpid: false,
  hideAfterClick: true,
  audience: [],
  maxShows: 1,
  minGapH: "",
};

const TRIGGER_PAGES = [
  ["home", "Home"],
  ["properties", "Properties"],
  ["my_business", "My business"],
  ["service", "Services"],
  ["add_inventory", "Add inventory"],
  ["profile", "Profile"],
  ["property_details", "Property details"],
  ["search_results", "Search results"],
];

const TRIGGER_EVENTS = [
  ["add_inventory_success", "Inventory added"],
  ["enquiry_submitted", "Enquiry submitted"],
  ["profile_completed", "Profile completed"],
];

// sendCpId: append the agent's CPID to the link (the app's buttons[].sendCpId).
const BTN_DEFAULT = {
  label: "",
  url: "",
  sendCpId: false,
  bg: "#E5E5E5",
  text: "#171717",
};

// Views · clicks · CTR for the whole popup, with copy of the CPIDs behind each.
function PopupStats({ p, onCopy }) {
  const { viewers, clickers } = popupCpids(p);
  const clicks = Math.round((p.impressions * p.ctr) / 100);
  const cp = (list, label, verb) => (
    <button
      type="button"
      title={`Copy CPIDs who ${verb}`}
      onClick={() => onCopy(list, label)}
      className="text-tertiary hover:text-neutral-900"
    >
      <Copy size={12} />
    </button>
  );
  return (
    <p className="-mt-1 flex items-center gap-4 text-[12.5px] text-secondary tabular-nums">
      <span className="flex items-center gap-1.5">
        <Eye size={13} /> {p.impressions.toLocaleString("en-IN")} views{" "}
        {cp(viewers, "viewer", "saw")}
      </span>
      <span className="flex items-center gap-1.5">
        <MousePointerClick size={13} /> {clicks.toLocaleString("en-IN")} clicks{" "}
        {cp(clickers, "clicker", "clicked")}
      </span>
      <span className="font-medium text-neutral-700">
        {p.ctr.toFixed(1)}% CTR
      </span>
    </p>
  );
}

// "+ CPID" chip inside a link field: appends the agent's CPID to that link.
const CpidChip = ({ checked, onChange }) => (
  <button
    type="button"
    title={checked ? "CPID is added to the link" : "Add CPID to the link"}
    onClick={() => onChange(!checked)}
    className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md text-[11.5px] font-semibold transition-colors ${
      checked
        ? "bg-neutral-900 text-white"
        : "bg-white text-tertiary border border-neutral-200 hover:text-label"
    }`}
  >
    {checked ? "✓ CPID" : "+ CPID"}
  </button>
);

// Readable text on the strip: white on dark colours, near-black on light ones.
function textOn(hex) {
  if (!isHex(hex)) return "#FAFAFA";
  const n = parseInt(hex.slice(1), 16);
  const y =
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255;
  return y > 0.6 ? "#171717" : "#FAFAFA";
}

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[13px] font-medium text-label mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const Group = ({ title, action, children }) => (
  <section className="space-y-4 pt-6 mt-6 border-t border-separator first:pt-0 first:mt-0 first:border-0">
    {(title || action) && (
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold text-label">{title}</h3>
        {action}
      </div>
    )}
    {children}
  </section>
);

// Swatch + hex text, so a colour can be typed or picked.
// One field: swatch on the left, hex in the middle, pick-from-image on the right
// (the pick icon steps aside while the hex is being typed).
function ColorText({ value, onChange, onPick, className = "" }) {
  const [typing, setTyping] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <label
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md cursor-pointer overflow-hidden ${
          isHex(value)
            ? "border border-black/10"
            : "border border-dashed border-neutral-400"
        }`}
        style={isHex(value) ? { background: value } : undefined}
      >
        <input
          type="color"
          value={isHex(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="opacity-0 w-full h-full cursor-pointer"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onFocus={() => setTyping(true)}
        onBlur={() => setTyping(false)}
        placeholder="Hex code"
        className={`${inputClass} font-mono min-w-0 pl-10 ${onPick ? "pr-10" : ""}`}
      />
      {onPick && (!typing || !value) && (
        <button
          type="button"
          title="Pick from image"
          onClick={onPick}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:bg-white hover:text-neutral-900"
        >
          <Pipette size={14} />
        </button>
      )}
    </div>
  );
}

const SURFACE_LABEL = { app: "App", web: "Web" };

const PopupEditor = ({ id, onClose, onChanged }) => {
  const toast = useToast();
  const existing = id ? getPopup(id) : null;
  const [form, setForm] = useState(() => {
    // A popup is live on each surface set to Active; nothing active = disabled.
    const on = existing
      ? existing.status === "live"
        ? existing.on
        : { app: false, web: false }
      : { app: true, web: true };
    return {
      ...BLANK,
      ...(existing || {}),
      on: { ...on },
      creatives: { app: null, web: null, ...(existing?.creatives || {}) },
    };
  });
  const [btns, setBtns] = useState(() => {
    const n = existing
      ? existing.layout === "two"
        ? 2
        : existing.layout === "one"
          ? 1
          : 0
      : 0;
    return (existing?.ctas || [])
      .slice(0, n)
      .map((c) => ({ ...BTN_DEFAULT, ...c }));
  });
  const [picking, setPicking] = useState(null); // where the picked colour goes: 'strip' | { i, k }
  const [evFocus, setEvFocus] = useState(false);
  const [previewing, setPreviewing] = useState(null); // null | 'app' | 'web'
  // A disabled surface folds away; it can still be opened to look at.
  const [peek, setPeek] = useState({ app: false, web: false });
  const shown = (s) => form.on[s] || peek[s];
  const titleFor = (s, label) =>
    form.on[s] ? (
      label
    ) : (
      <button
        type="button"
        onClick={() => setPeek((cur) => ({ ...cur, [s]: !cur[s] }))}
        className="flex items-center gap-1 hover:text-neutral-600"
      >
        {label}
        <ChevronDown
          size={15}
          className={`text-tertiary transition-transform ${peek[s] ? "rotate-180" : ""}`}
        />
      </button>
    );
  const [search, setSearch] = useState("");
  const set = (patch) => setForm((cur) => ({ ...cur, ...patch }));
  const setBtn = (i, patch) =>
    setBtns((cur) => cur.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  const surfaces = ["app", "web"].filter((s) => form.on[s]);
  const setCreative = (s, v) =>
    set({ creatives: { ...form.creatives, [s]: v } });
  const statusFor = (s) => (
    <SegmentedControl
      size="sm"
      value={form.on[s] ? "active" : "disabled"}
      onChange={(v) => set({ on: { ...form.on, [s]: v === "active" } })}
      options={[
        { value: "active", label: "Active" },
        { value: "disabled", label: "Disabled" },
      ]}
    />
  );
  // Preview sits centred on the creative once there is one.
  const creative = (s) => (
    <div className="relative">
      <UploadZone
        label=""
        ratio={POPUP_CREATIVE[s].ratio}
        value={form.creatives[s]}
        onChange={(v) => setCreative(s, v)}
      />
      {form.creatives[s] && (
        <button
          type="button"
          onClick={() => setPreviewing(s)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 px-4 rounded-full bg-white/95 shadow-raised flex items-center gap-1.5 text-[13px] font-medium text-label hover:bg-white"
        >
          <Eye size={14} /> Preview
        </button>
      )}
    </div>
  );
  // Colours are picked from the first creative that is on.
  // Colours come from the app poster first, else the web creative (on or off).
  const pickUrl = form.creatives.app?.url || form.creatives.web?.url;
  const cohorts = getCohorts().filter((c) => c.status !== "archived");
  const q = search.trim().toLowerCase();
  const matches = cohorts.filter(
    (c) => !form.audience.includes(c.id) && c.name.toLowerCase().includes(q),
  );
  const isUrl = (v) => /^https?:\/\/\S+/.test(v);
  const noButtons = btns.length === 0;
  const evQ = form.triggerEvent.trim().toLowerCase();
  const evMatches = TRIGGER_EVENTS.filter(
    ([k, lbl]) =>
      k !== form.triggerEvent &&
      (k.includes(evQ) || lbl.toLowerCase().includes(evQ)),
  );
  const layout = btns.length === 2 ? "two" : btns.length === 1 ? "one" : "none";

  const fixes = [];
  if (!form.name.trim()) fixes.push("Name");
  if (form.on.app && !isHex(form.bg)) fixes.push("Strip colour");
  surfaces.forEach((s) => {
    if (!form.creatives[s]) fixes.push(`${SURFACE_LABEL[s]} image`);
  });
  if (form.destination && !isUrl(form.destination)) fixes.push("Image link");
  btns.forEach((b, i) => {
    if (!b.label.trim()) fixes.push(`Button ${i + 1} label`);
    if (!isUrl(b.url)) fixes.push(`Button ${i + 1} URL`);
    if (!isHex(b.bg) || !isHex(b.text)) fixes.push(`Button ${i + 1} colour`);
  });
  if (form.triggerType === "event" && !form.triggerEvent.trim())
    fixes.push("Trigger event");
  if (
    form.triggerType === "scroll" &&
    !(Number(form.triggerScroll) >= 1 && Number(form.triggerScroll) <= 100)
  )
    fixes.push("Scroll depth");
  if (!(Number(form.maxShows) >= 1)) fixes.push("Max shows");

  function save() {
    const payload = {
      ...form,
      name: form.name.trim(),
      triggerEvent:
        form.triggerType === "event" ? form.triggerEvent.trim() : "",
      triggerScroll: Number(form.triggerScroll) || 0,
      toast: form.toast.trim(),
      destination: noButtons ? form.destination : "",
      maxShows: Number(form.maxShows) || 1,
      layout,
      ctas: btns,
      dividerLabel: btns.length ? form.dividerLabel : "",
      colorMode: "manual",
      text: textOn(form.bg),
      audienceLabel: form.audience.length
        ? form.audience
            .map((cid) => cohorts.find((c) => c.id === cid)?.name || cid)
            .join(", ")
        : "All users",
      status: surfaces.length ? "live" : "paused",
    };
    if (existing) updatePopup(existing.id, payload);
    else createPopup(payload);
    toast("Saved");
    onChanged();
    onClose();
  }

  function archive() {
    const prev = existing.status;
    setPopupStatus(existing.id, "archived");
    toast(`Archived '${existing.name}'`, {
      undo: () => {
        setPopupStatus(existing.id, prev);
        onChanged();
      },
    });
    onChanged();
    onClose();
  }

  function copy(list, label) {
    navigator.clipboard
      ?.writeText(list.join("\n"))
      .then(() => toast(`Copied ${list.length} ${label} CPIDs`));
  }

  return (
    <Drawer
      title={existing ? existing.name : ""}
      onClose={onClose}
      width="max-w-[480px]"
      headerActions={
        <div className="flex items-center gap-2">
          {existing &&
            existing.status !== "live" &&
            existing.status !== "archived" && (
              <button
                type="button"
                title="Archive"
                onClick={archive}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-danger"
              >
                <Archive size={15} />
              </button>
            )}
        </div>
      }
      footer={
        <div className="w-full">
          <Button
            variant="primary"
            className="w-full"
            disabled={fixes.length > 0}
            onClick={save}
          >
            {existing ? "Save" : "Create"}
          </Button>
          {fixes.length > 0 && (
            <p className="mt-2 text-[12px] text-warning text-center">
              Needs: {fixes.join(" · ")}
            </p>
          )}
        </div>
      }
    >
      <Group>
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Demante Event"
            className={inputClass}
          />
        </Field>
        {existing && !existing.appManaged && (
          <PopupStats p={existing} onCopy={copy} />
        )}
      </Group>

      <Group title={titleFor("app", "App")} action={statusFor("app")}>
        {shown("app") && (
          <div className="space-y-4">
            <div className="w-[45%]">{creative("app")}</div>
            <Field label="Strip colour">
              <ColorText
                value={form.bg}
                onChange={(v) => set({ bg: v })}
                onPick={pickUrl ? () => setPicking("strip") : undefined}
              />
            </Field>
          </div>
        )}
      </Group>

      <Group title={titleFor("web", "Web")} action={statusFor("web")}>
        {shown("web") && (
          <div className="space-y-4">
            {creative("web")}
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-label">
                <span className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center">
                  <X size={12} />
                </span>
                Close button
              </span>
              <SegmentedControl
                size="sm"
                value={form.closeCorner}
                onChange={(v) => set({ closeCorner: v })}
                options={[
                  { value: "top_left", label: "Top left" },
                  { value: "top_right", label: "Top right" },
                ]}
              />
            </div>
          </div>
        )}
      </Group>

      <Group title="Buttons">
        {!noButtons && (
          <Field label="Divider text">
            <input
              type="text"
              value={form.dividerLabel}
              onChange={(e) => set({ dividerLabel: e.target.value })}
              placeholder="TRY IT YOURSELF"
              className={inputClass}
            />
          </Field>
        )}
        {btns.map((b, i) => {
          const clickers = existing
            ? popupButtonCpids(existing, i, btns.length)
            : [];
          return (
            <div
              key={i}
              className="rounded-xl border border-neutral-200 p-2.5 space-y-2"
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={b.label}
                  onChange={(e) => setBtn(i, { label: e.target.value })}
                  placeholder={`Button ${i + 1}`}
                  style={{ background: b.bg, color: b.text }}
                  className="flex-1 min-w-0 h-10 px-3 rounded-lg text-center text-[14px] font-semibold outline-none ring-neutral-300 focus:ring-2 placeholder:opacity-50 placeholder:text-current"
                />
                <button
                  type="button"
                  title="Remove"
                  onClick={() =>
                    setBtns((cur) => cur.filter((_, k) => k !== i))
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={b.url}
                  onChange={(e) => setBtn(i, { url: e.target.value })}
                  placeholder="https://..."
                  className={`${inputClass} pr-[76px]`}
                />
                <CpidChip
                  checked={b.sendCpId}
                  onChange={(v) => setBtn(i, { sendCpId: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[12px] text-secondary mb-1">Background</p>
                  <ColorText
                    value={b.bg}
                    onChange={(v) => setBtn(i, { bg: v })}
                    onPick={
                      pickUrl ? () => setPicking({ i, k: "bg" }) : undefined
                    }
                  />
                </div>
                <div>
                  <p className="text-[12px] text-secondary mb-1">Text</p>
                  <ColorText
                    value={b.text}
                    onChange={(v) => setBtn(i, { text: v })}
                    onPick={
                      pickUrl ? () => setPicking({ i, k: "text" }) : undefined
                    }
                  />
                </div>
              </div>
              {existing && (
                <p className="flex items-center gap-2 px-0.5 text-[11.5px] text-tertiary tabular-nums">
                  <span title="Total clicks (one person can click many times)">
                    {Math.round(clickers.length * 1.25)} clicks
                  </span>
                  ·
                  <span className="flex items-center gap-1 text-secondary">
                    {clickers.length} people
                    <button
                      type="button"
                      title="Copy CPIDs of people who clicked"
                      onClick={() => copy(clickers, "clicker")}
                      className="text-tertiary hover:text-neutral-900"
                    >
                      <Copy size={11} />
                    </button>
                  </span>
                </p>
              )}
            </div>
          );
        })}
        {btns.length < 2 && (
          <button
            type="button"
            onClick={() => setBtns((cur) => [...cur, { ...BTN_DEFAULT }])}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-secondary hover:text-label hover:border-neutral-400 text-[13px] font-medium transition-colors"
          >
            <Plus size={14} /> Add button
          </button>
        )}
        {noButtons && (
          <Field label="Image link">
            <div className="relative">
              <input
                type="text"
                value={form.destination}
                onChange={(e) => set({ destination: e.target.value })}
                placeholder="https://..."
                className={`${inputClass} pr-[76px]`}
              />
              <CpidChip
                checked={form.appendCpid}
                onChange={(v) => set({ appendCpid: v })}
              />
            </div>
          </Field>
        )}
        <Field label="Toast">
          <input
            type="text"
            value={form.toast}
            maxLength={80}
            onChange={(e) => set({ toast: e.target.value })}
            placeholder="Shown after a tap"
            className={inputClass}
          />
        </Field>
      </Group>

      <Group title="Who sees it">
        {form.audience.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.audience.map((cid) => (
              <span
                key={cid}
                className="inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-neutral-900 text-white text-[13px]"
              >
                {cohorts.find((c) => c.id === cid)?.name || cid}
                <button
                  type="button"
                  onClick={() =>
                    set({ audience: form.audience.filter((x) => x !== cid) })
                  }
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cohorts"
              className={`${inputClass} pl-9`}
            />
          </div>
          {q && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-separator">
              {matches.length === 0 ? (
                <p className="px-3 py-3 text-[13px] text-tertiary">
                  No cohorts.
                </p>
              ) : (
                matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      set({ audience: [...form.audience, c.id] });
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2.5 text-[14px] text-label hover:bg-neutral-50"
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </Group>

      <Group title="Trigger">
        <SegmentedControl
          size="sm"
          value={form.triggerType}
          onChange={(v) => set({ triggerType: v })}
          options={[
            { value: "page", label: "Page" },
            { value: "scroll", label: "Scroll depth" },
            { value: "event", label: "Event" },
          ]}
        />
        {form.triggerType === "page" && (
          <div className="relative">
            <select
              value={form.triggerPage}
              onChange={(e) => set({ triggerPage: e.target.value })}
              className={`${inputClass} appearance-none pr-9`}
            >
              {TRIGGER_PAGES.map(([k, lbl]) => (
                <option key={k} value={k}>
                  {lbl}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
            />
          </div>
        )}
        {form.triggerType === "scroll" && (
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div className="relative">
              <select
                value={form.triggerPage}
                onChange={(e) => set({ triggerPage: e.target.value })}
                className={`${inputClass} appearance-none pr-9`}
              >
                {TRIGGER_PAGES.map(([k, lbl]) => (
                  <option key={k} value={k}>
                    {lbl}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.triggerScroll}
                onChange={(e) =>
                  set({
                    triggerScroll: e.target.value
                      .replace(/[^\d]/g, "")
                      .slice(0, 3),
                  })
                }
                className={`${inputClass} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-tertiary">
                %
              </span>
            </div>
          </div>
        )}
        {form.triggerType === "event" && (
          <div className="relative">
            <input
              type="text"
              value={form.triggerEvent}
              onChange={(e) => set({ triggerEvent: e.target.value })}
              onFocus={() => setEvFocus(true)}
              onBlur={() => setTimeout(() => setEvFocus(false), 120)}
              placeholder="Search event"
              className={`${inputClass} font-mono`}
            />
            {evFocus && form.triggerEvent.trim() && evMatches.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 rounded-xl border border-neutral-200 bg-white shadow-raised divide-y divide-separator overflow-hidden">
                {evMatches.map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      set({ triggerEvent: k });
                      setEvFocus(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-neutral-50"
                  >
                    <span className="block text-[14px] text-label">{lbl}</span>
                    <span className="block text-[12px] text-tertiary font-mono">
                      {k}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Group>

      <Group title="How often">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max shows">
            <input
              type="text"
              inputMode="numeric"
              value={form.maxShows}
              onChange={(e) =>
                set({ maxShows: e.target.value.replace(/[^\d]/g, "") })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Gap (hours)">
            <input
              type="text"
              inputMode="numeric"
              value={form.minGapH}
              onChange={(e) =>
                set({ minGapH: e.target.value.replace(/[^\d]/g, "") })
              }
              placeholder="—"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[14px] text-label">Hide after click</span>
          <Switch
            checked={form.hideAfterClick}
            onChange={(v) => set({ hideAfterClick: v })}
          />
        </div>
      </Group>

      {previewing && (
        <PopupSheetPreview
          surface={previewing}
          ratio={POPUP_CREATIVE[previewing].ratio}
          closeCorner={previewing === "web" ? form.closeCorner : "top_right"}
          image={form.creatives[previewing]?.url}
          bg={previewing === "app" ? form.bg : "#FFFFFF"}
          text={previewing === "app" ? textOn(form.bg) : "#171717"}
          divider={btns.length ? form.dividerLabel : ""}
          buttons={btns}
          onClose={() => setPreviewing(null)}
        />
      )}

      {picking && pickUrl && (
        <ImageColorPicker
          src={pickUrl}
          onClose={() => setPicking(null)}
          onPick={(hex) => {
            if (picking === "strip") set({ bg: hex });
            else setBtn(picking.i, { [picking.k]: hex });
            setPicking(null);
          }}
        />
      )}
    </Drawer>
  );
};

export default PopupEditor;

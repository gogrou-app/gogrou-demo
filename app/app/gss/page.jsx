"use client";

import { useEffect, useRef, useState } from "react";
import tools from "../../gpc/data.js";
import {
  DEFAULT_GRINDER,
  DEFAULT_INTAKE_OPERATOR,
  DOCUMENT_TYPE_LABELS,
  ISSUE_STATE_LABELS,
  MODULE_LABELS,
  MOVEMENT_TYPE_LABELS,
  ORGANIZATION_STATUS_LABELS,
  RETURN_DECISION_LABELS,
  STOCK_CONDITION_LABELS,
} from "../../../lib/gss/constants.js";
import {
  appendMovement,
  collectMovementHistory,
  createMovementRecord,
  formatMovementDate,
  getMovementStateLabel,
} from "../../../lib/gss/movements.js";
import { getOrganizations as readOrganizations, getTenantWarehouse as readWarehouse, saveTenantWarehouse as writeWarehouse } from "../../../lib/gss/storage.js";
import { createEmptyStockSummary, getPrimaryStockState, normalizeStockSummary } from "../../../lib/gss/stock.js";

const ACTIVE_ORGANIZATION_STORAGE_KEY = "activeOrganizationId";

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const formatModules = (modules) =>
  (modules && modules.length > 0 ? modules : []).map((module) => labelFromMap(MODULE_LABELS, module)).join(", ") || "žádné";

const countDmItems = (items) =>
  items.reduce((total, item) => total + (item.dmItems?.length || 0), 0);

const normalizeSearch = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeWarehouseSearchPart = (value) => {
  let token = normalizeSearch(value).replace(/\s+/g, " ");

  token = token
    .replace(/\b(?:d|l|z)\s*=\s*(\d+(?:[.,]\d+)?)\b/g, "$1")
    .replace(/\b(?:d|l|z)\s*(\d+(?:[.,]\d+)?)\b/g, "$1")
    .replace(/\b(\d+(?:[.,]\d+)?)\s*z\b/g, "$1")
    .replace(/\b(?:prumer|pruměr)\s+(\d+(?:[.,]\d+)?)\b/g, "$1")
    .replace(/\bdelka\s+(\d+(?:[.,]\d+)?)\b/g, "$1")
    .replace(",", ".");

  return token.trim();
};

const tokenizeWarehouseSearch = (value) => {
  const raw = String(value || "");
  const normalized = normalizeSearch(raw);
  if (!normalized) {
    return [];
  }

  const hasExplicitSeparators = /[;,]|\s{2,}/.test(raw);
  const hasParameterSyntax = /\b(?:d|l|z)\s*=?\s*\d|\b\d+\s*z\b|\b(?:prumer|průměr|delka|délka)\s+\d/i.test(raw);
  const source = hasExplicitSeparators
    ? raw.split(/[;,]|\s{2,}/)
    : hasParameterSyntax
      ? raw.split(/\s+/)
      : [raw];

  return source
    .map(normalizeWarehouseSearchPart)
    .filter(Boolean);
};

const normalizeId = (value) => String(value ?? "").trim();

const formatBasicParameters = (tool) => {
  const params = [
    tool.geometry?.diameter_mm ? `D ${tool.geometry.diameter_mm} mm` : null,
    tool.geometry?.overall_length_mm ? `L ${tool.geometry.overall_length_mm} mm` : null,
    tool.geometry?.flutes ? `${tool.geometry.flutes} břity` : null,
    tool.tool_features?.coating ? tool.tool_features.coating : null,
    tool.tool_features?.material ? tool.tool_features.material : null,
  ].filter(Boolean);

  return params.join(" · ") || "základní parametry nejsou doplněné";
};

const createTenantGssItem = (tool) => ({
  id: crypto.randomUUID(),
  origin: "GPC",
  gpc_id: tool.gpc_id,
  gtin: tool.gtin || "",
  name: tool.name,
  manufacturer: tool.manufacturer || "",
  type: tool.type || "",
  tenantSettings: {
    min: "",
    max: "",
    warning: "",
    dmEnabled: false,
    sharpen: {
      enabled: false,
      cycles: "",
      note: "",
    },
    blocked: false,
    blockReason: "",
    localNote: "",
    supplierName: "Gogrou",
    supplierType: "Gogrou partner",
  },
  stockSummary: createEmptyStockSummary(),
  createdAt: new Date().toISOString(),
});

const defaultLocalItemForm = {
  name: "",
  manufacturer: "",
  type: "",
  gtin: "",
  internalCode: "",
  dimensionNote: "",
  diameter: "",
  length: "",
  material: "",
  insertShape: "",
  dmEnabled: false,
  sharpenEnabled: false,
};

const isDrillOrMill = (type) => {
  const normalized = normalizeSearch(type);
  return normalized.includes("vrtak") || normalized.includes("vrták") || normalized.includes("freza") || normalized.includes("fréza") || normalized.includes("drill") || normalized.includes("mill");
};

const isInsert = (type) => {
  const normalized = normalizeSearch(type);
  return normalized.includes("britova") || normalized.includes("břitová") || normalized.includes("desticka") || normalized.includes("destička") || normalized.includes("insert");
};

const validateLocalItemForm = (form) => {
  const hasCommonRequired = form.name.trim() && form.type.trim();
  const hasIdentifier = form.gtin.trim() || form.internalCode.trim() || form.dimensionNote.trim();

  if (!hasCommonRequired || !hasIdentifier) {
    return false;
  }

  if (isDrillOrMill(form.type)) {
    return Boolean(form.diameter.trim() && (form.length.trim() || form.dimensionNote.trim()) && form.material.trim());
  }

  if (isInsert(form.type)) {
    return Boolean(form.insertShape.trim() && form.dimensionNote.trim() && form.material.trim());
  }

  return true;
};

const createLocalTenantGssItem = (form) => ({
  id: crypto.randomUUID(),
  origin: "LOCAL",
  validationStatus: "unvalidated",
  tenantOnly: true,
  gpc_id: "",
  gtin: form.gtin.trim(),
  name: form.name.trim(),
  manufacturer: form.manufacturer.trim() || "neznámý",
  type: form.type.trim(),
  localFields: {
    internalCode: form.internalCode.trim(),
    dimensionNote: form.dimensionNote.trim(),
    diameter: form.diameter.trim(),
    length: form.length.trim(),
    material: form.material.trim() || "neznámý",
    insertShape: form.insertShape.trim(),
  },
  tenantSettings: {
    min: "",
    max: "",
    warning: "",
    dmEnabled: form.dmEnabled,
    sharpen: {
      enabled: form.sharpenEnabled,
      cycles: "",
      note: "",
    },
    blocked: false,
    blockReason: "",
    localNote: "",
    supplierName: "Gogrou",
    supplierType: "Gogrou partner",
  },
  stockSummary: createEmptyStockSummary(),
  createdAt: new Date().toISOString(),
});

const createSettingsForm = (item) => ({
  min: item.tenantSettings?.min || "",
  max: item.tenantSettings?.max || "",
  warning: item.tenantSettings?.warning || "",
  supplierPackQuantity: item.tenantSettings?.supplierPackQuantity || "",
  supplierName: item.tenantSettings?.supplierName || "Gogrou",
  supplierType: item.tenantSettings?.supplierType || "Gogrou partner",
  dmEnabled: Boolean(item.tenantSettings?.dmEnabled),
  sharpenEnabled: Boolean(item.tenantSettings?.sharpen?.enabled),
  sharpenCycles: item.tenantSettings?.sharpen?.cycles || "",
  sharpenNote: item.tenantSettings?.sharpen?.note || "",
  drawingReference: item.tenantSettings?.drawingReference || "",
  coatingNote: item.tenantSettings?.coatingNote || "",
  blocked: Boolean(item.tenantSettings?.blocked),
  blockReason: item.tenantSettings?.blockReason || "",
  localNote: item.tenantSettings?.localNote || "",
});

const getItemKey = (item) => item.id || item.gpc_id || item.name;

const getOrganizationId = (organization) =>
  normalizeId(organization?.organizationId) || normalizeId(organization?.id);

const getOrganizationLookupValues = (organization) => [
  normalizeId(organization?.id),
  normalizeId(organization?.organizationId),
  getOrganizationId(organization),
].filter(Boolean);

const findOrganizationById = (organizations, organizationId) => {
  const normalizedOrganizationId = normalizeId(organizationId);
  if (!normalizedOrganizationId) return null;

  return organizations.find((organization) =>
    getOrganizationLookupValues(organization).includes(normalizedOrganizationId)
  ) || null;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const DM_STATUS_LABELS = {
  new: "Nový",
  resharpened_new: "Nový přebroušený",
  used: "Použitý",
  production: "Ve výrobě",
  sharpening: "Na broušení",
  in_grinding_shop: "V brusírně",
  reserved: "Rezervovaný",
  blocked: "Blokovaný",
  scrapped: "Vyřazený",
};

const DM_LOCATION_LABELS = {
  main_warehouse: "Hlavní sklad",
  production: "Výroba",
  sharpening_collection: "Sběr na broušení",
  grinding_shop: "Brusírna",
  black_box: "Černá bedýnka",
  unknown: "Neznámé",
};

const DM_CREATE_STATUS_OPTIONS = ["new", "resharpened_new", "used"];

const createDmForm = () => ({
  quantity: "",
  status: "new",
  currentDiameter: "",
  currentLength: "",
  maxSharpeningCount: "",
  location: "main_warehouse",
});

const createDmServiceForm = (dmItem = {}) => ({
  currentDiameter: dmItem.currentDiameter || "",
  currentLength: dmItem.currentLength || "",
  sharpeningCount: dmItem.sharpeningCount ?? "",
  coating: dmItem.coating || "",
  serviceNote: dmItem.serviceNote || "",
  lastMeasurementProtocol: dmItem.lastMeasurementProtocol || "",
  serviceProvider: "M-technologies",
  serviceDate: getTodayDate(),
});

const createStockForm = () => ({
  quantity: "",
  condition: "new",
  grinder: DEFAULT_GRINDER,
  note: "",
  purchasePricePerUnit: "",
  purchaseCurrency: "CZK",
  documentType: "supplier_delivery_note",
  documentNumber: "",
  source: "",
  receivedAt: getTodayDate(),
  performedBy: DEFAULT_INTAKE_OPERATOR,
  intakeNote: "",
});

const createReservationForm = () => ({
  job: "",
  quantity: "",
  state: "resharpened_new",
  reason: "",
  reservedBy: DEFAULT_INTAKE_OPERATOR,
  reservedAt: getTodayDate(),
  validUntil: "",
});

const createOverstockOfferForm = (item = {}) => ({
  enabled: Boolean(item.overstockOffer?.enabled),
  quantity: item.overstockOffer?.quantity ? String(item.overstockOffer.quantity) : "",
  pricePerUnit: item.overstockOffer?.pricePerUnit ? String(item.overstockOffer.pricePerUnit) : "",
  currency: item.overstockOffer?.currency || "CZK",
  note: item.overstockOffer?.note || "",
  status: item.overstockOffer?.status || "draft",
});

const createIssueForm = () => ({
  quantity: "",
  preferredState: "used",
  costCenter: "",
  machine: "",
  job: "",
  note: "",
});

const createReturnForm = () => ({
  quantity: "",
  decision: "return_used",
  returnedAt: getTodayDate(),
  performedBy: DEFAULT_INTAKE_OPERATOR,
  costCenter: "",
  machine: "",
  job: "",
  note: "",
  grinder: DEFAULT_GRINDER,
  serviceInstruction: "",
  discardReason: "",
  redirectInstruction: "",
  blockReason: "",
  confirmSharpeningOverride: false,
});

const flattenSearchValues = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenSearchValues);
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(flattenSearchValues);
  }

  return [value];
};

const getWarehouseSearchHaystack = (item) => {
  const stock = normalizeStockSummary(item.stockSummary);
  return [
    item.name,
    item.gogrouId,
    item.gid,
    item.gpcNumericId,
    item.gpc_id,
    item.gtin,
    item.manufacturer,
    item.type,
    item.localFields?.internalCode,
    item.localFields?.dimensionNote,
    item.localFields?.diameter,
    item.localFields?.length,
    item.localFields?.material,
    item.localFields?.insertShape,
    item.category,
    item.productCategory,
    item.technicalParameters,
    item.technical_parameters,
    item.geometry,
    item.tool_features,
    item.parameters,
    stock.lastIntakeMetadata?.documentNumber,
    stock.lastIntakeMetadata?.source,
  ].flatMap(flattenSearchValues).map(normalizeSearch).join(" ");
};

const itemMatchesIssueQuery = (item, query) => {
  const haystack = getWarehouseSearchHaystack(item);

  return haystack.includes(query);
};

const itemMatchesWarehouseQuery = (item, query) => {
  const tokens = Array.isArray(query) ? query : tokenizeWarehouseSearch(query);
  if (tokens.length === 0) {
    return true;
  }

  const haystack = getWarehouseSearchHaystack(item);
  return tokens.every((token) => haystack.includes(token));
};

const getActiveReservations = (item) => (item.reservations || []).filter((reservation) => reservation.status !== "cancelled");

const OVERSTOCK_STATUS_LABELS = {
  draft: "rozpracovaná nabídka",
  active: "aktivní nabídka",
  paused: "pozastavená nabídka",
  sold: "prodaná nabídka",
  cancelled: "zrušená nabídka",
};

const getOverstockStatusLabel = (status) => OVERSTOCK_STATUS_LABELS[status] || status || "rozpracovaná nabídka";

const getOverstockAlertMessage = (offer) => {
  if (!offer?.enabled || offer.status !== "active" || !offer.quantity) {
    return "";
  }

  return "Sledujte nadnormativní nabídku. Pokud další výdej sníží volné nové kusy pod nabízené množství, nabídka bude automaticky ponížena.";
};

const releaseLegacyOverstockReservation = (stock, overstockReserved) => {
  const reserved = Number(overstockReserved) || 0;
  if (reserved <= 0) {
    return stock;
  }

  return {
    ...stock,
    available: stock.available + reserved,
    reserved: Math.max(stock.reserved - reserved, 0),
    states: {
      ...stock.states,
      new: stock.states.new + reserved,
    },
  };
};

const getAllDmCodes = (items) => new Set(
  items.flatMap((item) => (item.dmItems || []).map((dmItem) => dmItem.dmCode))
);

const getDmGid = (item) => {
  const source = item.gogrouId || item.gid || item.gpcNumericId || item.gpc_id || item.localFields?.internalCode || item.id || item.name || "0";
  const digits = String(source).replace(/\D/g, "");

  if (digits) {
    return digits.slice(-9).padStart(9, "0");
  }

  let hash = 0;
  String(source).split("").forEach((char) => {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000000000;
  });

  return String(hash || 1).padStart(9, "0");
};

const getDmPrefix = (organization) => {
  const prefix = String(organization?.prefix || "GG00").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return prefix || "GG00";
};

const getNextDmSequence = (items, prefix, gid) => {
  const pattern = new RegExp(`^${prefix}-${gid}-(\\d{3})$`);
  const maxSequence = items
    .flatMap((item) => item.dmItems || [])
    .reduce((max, dmItem) => {
      const match = String(dmItem.dmCode || "").match(pattern);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

  return maxSequence + 1;
};

const generateDmCode = ({ existingCodes, prefix, gid, sequence }) => {
  let nextSequence = sequence;
  let code = `${prefix}-${gid}-${String(nextSequence).padStart(3, "0")}`;

  while (existingCodes.has(code)) {
    nextSequence += 1;
    code = `${prefix}-${gid}-${String(nextSequence).padStart(3, "0")}`;
  }

  existingCodes.add(code);
  return { code, nextSequence: nextSequence + 1 };
};

const createDmHistoryRecord = ({ type, note, performedBy = DEFAULT_INTAKE_OPERATOR, metadata = {} }) => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  type,
  performedBy,
  note: note || "",
  metadata,
});

const findDmItemInWarehouse = (items, dmCode) => {
  const normalizedCode = normalizeSearch(dmCode);
  if (!normalizedCode) {
    return null;
  }

  for (const item of items) {
    const dmItem = (item.dmItems || []).find((candidate) => normalizeSearch(candidate.dmCode) === normalizedCode);
    if (dmItem) {
      return { item, dmItem };
    }
  }

  return null;
};

const parsePositiveNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const roundUpToPack = (quantity, packQuantity) => Math.ceil(quantity / packQuantity) * packQuantity;

const getPurchaseStatus = (available, min) => {
  if (available === 0) {
    return "Kritický stav";
  }

  if (available < min) {
    return "Pod minimem";
  }

  return "OK";
};

const createPurchaseProposalItem = (item) => {
  const stock = normalizeStockSummary(item.stockSummary);
  const min = parsePositiveNumber(item.tenantSettings?.min);
  const max = parsePositiveNumber(item.tenantSettings?.max);

  if (!min || !max || stock.available >= min) {
    return null;
  }

  const supplierPackQuantity = parsePositiveNumber(item.tenantSettings?.supplierPackQuantity, 1);
  const neededQuantity = Math.max(max - stock.available, 0);
  const recommendedQuantity = roundUpToPack(neededQuantity, supplierPackQuantity);

  return {
    itemId: getItemKey(item),
    itemName: item.name || item.gpc_id || "Položka",
    gpc_id: item.gpc_id || "",
    gtin: item.gtin || "",
    manufacturer: item.manufacturer || "",
    supplierName: item.tenantSettings?.supplierName || "Gogrou",
    supplierType: item.tenantSettings?.supplierType || "Gogrou partner",
    available: stock.available,
    min,
    max,
    supplierPackQuantity,
    status: getPurchaseStatus(stock.available, min),
    recommendedQuantity,
    editedQuantity: recommendedQuantity,
    excluded: false,
    note: "",
  };
};

function DmDetailContent({
  item,
  dmItem,
  dmServiceForm,
  dmServiceMessage,
  onUpdateServiceForm,
  onSaveService,
  onClose,
  onPlaceholder,
}) {
  const maxSharpeningCount = dmItem.maxSharpeningCount ?? item.tenantSettings?.sharpen?.cycles;
  const hasSharpeningLimit = maxSharpeningCount !== "" && maxSharpeningCount !== null && maxSharpeningCount !== undefined;
  const reachedSharpeningLimit = hasSharpeningLimit && Number(dmItem.sharpeningCount || 0) >= Number(maxSharpeningCount);
  const displayDiameter = dmItem.currentDiameter || "neuvedeno";
  const displayLength = dmItem.currentLength || "neuvedeno";

  return (
    <div style={settingsPanel}>
      <div style={dmHeader}>
        <div>
          <div style={settingsTitle}>{dmItem.dmCode}</div>
          <div style={resultTitle}>
            {item.name || item.gpc_id || "Položka"} D={displayDiameter} mm, L={displayLength} mm
          </div>
          <div style={meta}>
            {item.type || "Typ neuveden"} · {item.manufacturer || "Výrobce neuveden"} · {item.gpc_id ? `GPC ID: ${item.gpc_id}` : "Lokální položka"}
          </div>
        </div>
        <div style={badge}>{labelFromMap(DM_STATUS_LABELS, dmItem.status)}</div>
      </div>

      {dmItem.status === "blocked" || dmItem.blockedReason ? (
        <div style={errorMessage}>
          Tento kus je blokovaný. {dmItem.blockedReason ? `Důvod: ${dmItem.blockedReason}` : ""}
        </div>
      ) : null}
      {reachedSharpeningLimit ? (
        <div style={errorMessage}>Tento nástroj dosáhl limitu přebroušení. Doporučeno vyřadit.</div>
      ) : null}

      <div style={summaryGrid}>
        <div style={summaryItem}>
          <div style={summaryLabel}>Aktuální průměr</div>
          <div style={summaryValue}>{displayDiameter}</div>
        </div>
        <div style={summaryItem}>
          <div style={summaryLabel}>Aktuální délka</div>
          <div style={summaryValue}>{displayLength}</div>
        </div>
        <div style={summaryItem}>
          <div style={summaryLabel}>Přebroušení</div>
          <div style={summaryValue}>{dmItem.sharpeningCount ?? 0}/{maxSharpeningCount || "nenastaveno"}</div>
        </div>
        <div style={summaryItem}>
          <div style={summaryLabel}>Umístění</div>
          <div style={summaryValue}>{labelFromMap(DM_LOCATION_LABELS, dmItem.location)}</div>
        </div>
      </div>

      <div style={stateBreakdown}>
        <span>Povlak: {dmItem.coating || "neuvedeno"}</span>
        <span>Výkres: {dmItem.drawingUrl || "neuvedeno"}</span>
        <span>Rezervace: {dmItem.reservedForOrder || "ne"}</span>
        <span>Poslední servis: {dmItem.lastServiceAt || "neuvedeno"}</span>
      </div>
      {dmItem.serviceNote ? <div style={offerInfo}>{dmItem.serviceNote}</div> : null}

      <div style={hintBox}>
        Zákazník po načtení DM okamžitě vidí aktuální hodnoty po ostření. GPC master data se nemění.
      </div>

      <form onSubmit={onSaveService} style={formBox}>
        <div style={settingsTitle}>Zapsat servis / změnit parametry</div>
        <div style={formGrid}>
          <label style={fieldLabel}>
            Nový aktuální průměr
            <input value={dmServiceForm.currentDiameter} onChange={(event) => onUpdateServiceForm("currentDiameter", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Nová aktuální délka
            <input value={dmServiceForm.currentLength} onChange={(event) => onUpdateServiceForm("currentLength", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Počet přebroušení
            <input type="number" min="0" value={dmServiceForm.sharpeningCount} onChange={(event) => onUpdateServiceForm("sharpeningCount", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Povlak
            <input value={dmServiceForm.coating} onChange={(event) => onUpdateServiceForm("coating", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Měřicí protokol / odkaz
            <input value={dmServiceForm.lastMeasurementProtocol} onChange={(event) => onUpdateServiceForm("lastMeasurementProtocol", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Servis provedl
            <input value={dmServiceForm.serviceProvider} onChange={(event) => onUpdateServiceForm("serviceProvider", event.target.value)} style={input} />
          </label>
          <label style={fieldLabel}>
            Datum servisu
            <input type="date" value={dmServiceForm.serviceDate} onChange={(event) => onUpdateServiceForm("serviceDate", event.target.value)} style={input} />
          </label>
        </div>
        <label style={fieldLabel}>
          Poznámka k servisu
          <textarea value={dmServiceForm.serviceNote} onChange={(event) => onUpdateServiceForm("serviceNote", event.target.value)} style={textarea} />
        </label>
        {dmServiceMessage ? <div style={message}>{dmServiceMessage}</div> : null}
        <div style={actions}>
          <button type="submit" style={btnImport}>Uložit servisní parametry</button>
          <button type="button" onClick={onPlaceholder} style={btnSecondary}>Připravuje se: exportovat aktuální parametry</button>
          <button type="button" onClick={onClose} style={btnSecondary}>Zpět na detail položky</button>
        </div>
      </form>

      <div style={historyPanel}>
        <div style={settingsTitle}>Historie DM kusu</div>
        {dmItem.history?.length ? (
          <div style={historyList}>
            {dmItem.history.slice(0, 10).map((history) => (
              <div key={history.id} style={historyItem}>
                <div style={historyTitle}>{history.type} · {formatMovementDate(history.createdAt)}</div>
                <div style={meta}>Provedl {history.performedBy || "neuvedeno"}</div>
                {history.note ? <div style={meta}>{history.note}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div style={muted}>Zatím bez DM historie.</div>
        )}
      </div>
    </div>
  );
}

export default function AppGssPage() {
  const warehouseSectionRef = useRef(null);
  const localItemSectionRef = useRef(null);
  const issueSectionRef = useRef(null);
  const returnSectionRef = useRef(null);
  const [organization, setOrganization] = useState(null);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [gpcQuery, setGpcQuery] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [showLocalItemForm, setShowLocalItemForm] = useState(false);
  const [localItemForm, setLocalItemForm] = useState(defaultLocalItemForm);
  const [localItemMessage, setLocalItemMessage] = useState("");
  const [selectedWarehouseItemKey, setSelectedWarehouseItemKey] = useState("");
  const [warehouseSearchQuery, setWarehouseSearchQuery] = useState("");
  const [settingsItemKey, setSettingsItemKey] = useState("");
  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [stockItemKey, setStockItemKey] = useState("");
  const [stockForm, setStockForm] = useState(createStockForm());
  const [stockMessage, setStockMessage] = useState("");
  const [dmFormItemKey, setDmFormItemKey] = useState("");
  const [dmForm, setDmForm] = useState(createDmForm());
  const [dmMessage, setDmMessage] = useState("");
  const [dmCodeQuery, setDmCodeQuery] = useState("");
  const [dmSearchMessage, setDmSearchMessage] = useState("");
  const [selectedDmDetail, setSelectedDmDetail] = useState(null);
  const [dmServiceForm, setDmServiceForm] = useState(createDmServiceForm());
  const [dmServiceMessage, setDmServiceMessage] = useState("");
  const [reservationItemKey, setReservationItemKey] = useState("");
  const [reservationForm, setReservationForm] = useState(createReservationForm());
  const [reservationMessage, setReservationMessage] = useState("");
  const [overstockItemKey, setOverstockItemKey] = useState("");
  const [overstockForm, setOverstockForm] = useState(createOverstockOfferForm());
  const [overstockMessage, setOverstockMessage] = useState("");
  const [purchaseProposal, setPurchaseProposal] = useState(null);
  const [purchaseProposalMessage, setPurchaseProposalMessage] = useState("");
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const [activeMainPanel, setActiveMainPanel] = useState("");
  const [showIssuePanel, setShowIssuePanel] = useState(false);
  const [issueQuery, setIssueQuery] = useState("");
  const [issueItemKey, setIssueItemKey] = useState("");
  const [issueForm, setIssueForm] = useState(createIssueForm());
  const [issueMessage, setIssueMessage] = useState("");
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [returnQuery, setReturnQuery] = useState("");
  const [returnItemKey, setReturnItemKey] = useState("");
  const [returnForm, setReturnForm] = useState(createReturnForm());
  const [returnMessage, setReturnMessage] = useState("");
  const [warehouseHighlighted, setWarehouseHighlighted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const organizations = readOrganizations();
    const activeOrganizationId = normalizeId(localStorage.getItem(ACTIVE_ORGANIZATION_STORAGE_KEY));
    const activeOrganization = activeOrganizationId
      ? findOrganizationById(organizations, activeOrganizationId)
      : null;
    const organizationId = getOrganizationId(activeOrganization);

    setOrganization(activeOrganization);
    setWarehouseItems(organizationId ? readWarehouse(organizationId) : []);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={muted}>Načítám GSS...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={wrap}>
        <div style={box}>
          <h1 style={title}>GSS</h1>
          <div style={lead}>Vyberte firmu v administraci organizací</div>
          <a href="/admin/organizations" style={btnPrimary}>Otevřít správu organizací</a>
        </div>
      </div>
    );
  }

  const organizationId = getOrganizationId(organization);
  const activeModules = organization.activatedModules || organization.selectedModules || [];
  const hasGssModule = activeModules.includes("GSS");
  const dmItemCount = countDmItems(warehouseItems);
  const normalizedGpcQuery = normalizeSearch(gpcQuery);
  const gpcResults = normalizedGpcQuery
    ? tools
        .filter((tool) => {
          const haystack = [
            tool.name,
            tool.gpc_id,
            tool.gtin,
            tool.manufacturer,
            tool.type,
          ].map(normalizeSearch).join(" ");

          return haystack.includes(normalizedGpcQuery);
        })
        .slice(0, 12)
    : [];
  const normalizedIssueQuery = normalizeSearch(issueQuery);
  const issueResults = normalizedIssueQuery
    ? warehouseItems.filter((item) => itemMatchesIssueQuery(item, normalizedIssueQuery)).slice(0, 12)
    : [];
  const selectedIssueItem = warehouseItems.find((item) => getItemKey(item) === issueItemKey);
  const selectedIssueStock = selectedIssueItem
    ? releaseLegacyOverstockReservation(normalizeStockSummary(selectedIssueItem.stockSummary), selectedIssueItem.overstockReserved)
    : null;
  const normalizedReturnQuery = normalizeSearch(returnQuery);
  const returnResults = normalizedReturnQuery
    ? warehouseItems.filter((item) => itemMatchesWarehouseQuery(item, normalizedReturnQuery)).slice(0, 12)
    : [];
  const selectedReturnItem = warehouseItems.find((item) => getItemKey(item) === returnItemKey);
  const movementHistory = collectMovementHistory(warehouseItems);
  const purchaseCandidates = warehouseItems.map(createPurchaseProposalItem).filter(Boolean);
  const selectedDmContext = selectedDmDetail ? findDmItemInWarehouse(warehouseItems, selectedDmDetail.dmCode) : null;
  const warehouseSearchTokens = tokenizeWarehouseSearch(warehouseSearchQuery);
  const filteredWarehouseItems = warehouseSearchTokens.length > 0
    ? warehouseItems.filter((item) => itemMatchesWarehouseQuery(item, warehouseSearchTokens))
    : warehouseItems;
  const selectedWarehouseItem = selectedWarehouseItemKey
    ? warehouseItems.find((item) => getItemKey(item) === selectedWarehouseItemKey) || null
    : null;

  const addGpcItemToGss = (tool) => {
    const exists = warehouseItems.some((item) => item.gpc_id === tool.gpc_id);
    if (exists) {
      setImportMessage("Položka už v tenant skladu existuje.");
      return;
    }

    const nextItems = [...warehouseItems, createTenantGssItem(tool)];
    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setImportMessage("Položka byla převzata do hlavního skladu.");
  };

  const openWarehouseSection = () => {
    setWarehouseHighlighted(true);
    warehouseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      setWarehouseHighlighted(false);
    }, 1800);
  };

  const openWarehouseItemDetail = (item) => {
    setSelectedWarehouseItemKey(getItemKey(item));
    window.setTimeout(() => {
      warehouseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const closeWarehouseItemDetail = (item) => {
    closeItemDetails(item);
    setSelectedWarehouseItemKey("");
  };

  const closeMainPanel = () => {
    setActiveMainPanel("");
    setShowIssuePanel(false);
    setShowReturnPanel(false);
    setShowLocalItemForm(false);
    setSelectedDmDetail(null);
    setIssueItemKey("");
    setReturnItemKey("");
    setIssueMessage("");
    setReturnMessage("");
  };

  const openMainPanel = (panel) => {
    setActiveMainPanel(panel);
    setShowIssuePanel(panel === "issue");
    setShowReturnPanel(panel === "return");
    setShowLocalItemForm(panel === "local");
    setPlaceholderMessage("");

    window.setTimeout(() => {
      warehouseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openLocalItemForm = () => {
    setActiveMainPanel("local");
    setShowIssuePanel(false);
    setShowReturnPanel(false);
    setShowLocalItemForm(true);
    window.setTimeout(() => {
      localItemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openIssuePanel = () => {
    setActiveMainPanel("issue");
    setShowIssuePanel(true);
    setShowReturnPanel(false);
    setShowLocalItemForm(false);
    window.setTimeout(() => {
      issueSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openReturnPanel = () => {
    setActiveMainPanel("return");
    setShowIssuePanel(false);
    setShowReturnPanel(true);
    setShowLocalItemForm(false);
    window.setTimeout(() => {
      returnSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const updateLocalItemForm = (field, value) => {
    setLocalItemForm((current) => ({
      ...current,
      [field]: value,
    }));
    setLocalItemMessage("");
  };

  const addLocalItemToGss = (event) => {
    event.preventDefault();

    if (!validateLocalItemForm(localItemForm)) {
      setLocalItemMessage("Pro založení lokální položky je nutné doplnit minimální povinné údaje.");
      return;
    }

    const nextItems = [...warehouseItems, createLocalTenantGssItem(localItemForm)];
    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setLocalItemForm(defaultLocalItemForm);
    setLocalItemMessage("Lokální nevalidovaná položka byla založena v tenant skladu.");
    setShowLocalItemForm(false);
    setActiveMainPanel("");
    openWarehouseSection();
  };

  const openItemSettings = (item) => {
    closeItemDetails(item);
    setSettingsItemKey(getItemKey(item));
    setSettingsForm(createSettingsForm(item));
    setSettingsMessage("");
  };

  const updateSettingsForm = (field, value) => {
    setSettingsForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSettingsMessage("");
  };

  const saveItemSettings = (event) => {
    event.preventDefault();

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== settingsItemKey) {
        return item;
      }

      const wasBlocked = Boolean(item.tenantSettings?.blocked);
      const willBeBlocked = Boolean(settingsForm.blocked);
      const nextItem = {
        ...item,
        tenantSettings: {
          ...item.tenantSettings,
          min: settingsForm.min,
          max: settingsForm.max,
          warning: settingsForm.warning,
          supplierPackQuantity: settingsForm.supplierPackQuantity,
          supplierName: settingsForm.supplierName,
          supplierType: settingsForm.supplierType,
          dmEnabled: settingsForm.dmEnabled,
          sharpen: {
            ...item.tenantSettings?.sharpen,
            enabled: settingsForm.sharpenEnabled,
            cycles: settingsForm.sharpenCycles,
            note: settingsForm.sharpenNote,
          },
          drawingReference: settingsForm.drawingReference,
          coatingNote: settingsForm.coatingNote,
          blocked: settingsForm.blocked,
          blockReason: settingsForm.blockReason,
          localNote: settingsForm.localNote,
        },
        updatedAt: new Date().toISOString(),
      };

      if (wasBlocked === willBeBlocked) {
        return nextItem;
      }

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: willBeBlocked ? "block" : "unblock",
        quantity: 0,
        state: getPrimaryStockState(item),
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: settingsForm.blockReason.trim() || settingsForm.localNote.trim(),
        metadata: {
          blockReason: settingsForm.blockReason.trim(),
          localNote: settingsForm.localNote.trim(),
          changedFrom: wasBlocked ? "blocked" : "active",
          changedTo: willBeBlocked ? "blocked" : "active",
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setSettingsItemKey("");
    setSettingsForm(null);
    setSettingsMessage("");
  };

  const openStockForm = (item) => {
    closeItemDetails(item);
    setStockItemKey(getItemKey(item));
    setStockForm(createStockForm());
    setStockMessage("");
  };

  const updateStockForm = (field, value) => {
    setStockForm((current) => ({
      ...current,
      [field]: value,
    }));
    setStockMessage("");
  };

  const openReservationForm = (item) => {
    closeItemDetails(item);
    setReservationItemKey(getItemKey(item));
    setReservationForm(createReservationForm());
    setReservationMessage("");
  };

  const updateReservationForm = (field, value) => {
    setReservationForm((current) => ({
      ...current,
      [field]: value,
    }));
    setReservationMessage("");
  };

  const openOverstockForm = (item) => {
    closeItemDetails(item);
    setOverstockItemKey(getItemKey(item));
    setOverstockForm(createOverstockOfferForm(item));
    setOverstockMessage("");
  };

  const updateOverstockForm = (field, value) => {
    setOverstockForm((current) => ({
      ...current,
      [field]: value,
    }));
    setOverstockMessage("");
  };

  const reserveStock = (event) => {
    event.preventDefault();

    const selectedItem = warehouseItems.find((item) => getItemKey(item) === reservationItemKey);
    if (!selectedItem) {
      setReservationMessage("Vyberte položku pro rezervaci.");
      return;
    }

    if (selectedItem.tenantSettings?.dmEnabled) {
      setReservationMessage("Při DM trackingu bude možné rezervovat konkrétní kus.");
      return;
    }

    if (!reservationForm.job.trim() || !reservationForm.reason.trim()) {
      setReservationMessage("Pro rezervaci je nutné zadat zakázku a důvod rezervace.");
      return;
    }

    const quantity = Number(reservationForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setReservationMessage("Zadejte kladný počet kusů pro rezervaci.");
      return;
    }

    const selectedStock = normalizeStockSummary(selectedItem.stockSummary);
    if (quantity > selectedStock.states[reservationForm.state]) {
      setReservationMessage("Ve vybraném stavu není dostatek kusů k rezervaci.");
      return;
    }

    const reservation = {
      id: crypto.randomUUID(),
      status: "active",
      job: reservationForm.job.trim(),
      quantity,
      state: reservationForm.state,
      stateLabel: ISSUE_STATE_LABELS[reservationForm.state],
      reason: reservationForm.reason.trim(),
      reservedBy: reservationForm.reservedBy.trim() || DEFAULT_INTAKE_OPERATOR,
      reservedAt: reservationForm.reservedAt || getTodayDate(),
      validUntil: reservationForm.validUntil,
      createdAt: new Date().toISOString(),
    };

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== reservationItemKey) {
        return item;
      }

      const stock = normalizeStockSummary(item.stockSummary);
      const nextStock = {
        ...stock,
        available: stock.available - quantity,
        reserved: stock.reserved + quantity,
        states: {
          ...stock.states,
          [reservationForm.state]: stock.states[reservationForm.state] - quantity,
        },
      };
      const nextItem = {
        ...item,
        reservations: [reservation, ...(item.reservations || [])],
        stockSummary: nextStock,
        updatedAt: new Date().toISOString(),
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "reservation_created",
        quantity,
        state: reservationForm.state,
        performedBy: reservation.reservedBy,
        note: reservation.reason,
        metadata: {
          reservationId: reservation.id,
          job: reservation.job,
          stateLabel: reservation.stateLabel,
          reservedAt: reservation.reservedAt,
          validUntil: reservation.validUntil,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setReservationItemKey("");
    setReservationForm(createReservationForm());
    setReservationMessage("");
  };

  const saveOverstockOffer = (event) => {
    event.preventDefault();

    const selectedItem = warehouseItems.find((item) => getItemKey(item) === overstockItemKey);
    if (!selectedItem) {
      setOverstockMessage("Vyberte položku pro nadnormativní nabídku.");
      return;
    }

    const currentStock = normalizeStockSummary(selectedItem.stockSummary);
    const previousReserved = Number(selectedItem.overstockReserved) || 0;
    const quantity = overstockForm.enabled ? Number(overstockForm.quantity) : 0;
    const pricePerUnit = overstockForm.enabled ? Number(overstockForm.pricePerUnit) : 0;

    if (overstockForm.enabled && (!overstockForm.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0)) {
      setOverstockMessage("Zadejte kladný počet kusů k nabídnutí.");
      return;
    }

    if (overstockForm.enabled && (!overstockForm.pricePerUnit.trim() || !Number.isFinite(pricePerUnit) || pricePerUnit < 0)) {
      setOverstockMessage("Zadejte platnou cenu za kus.");
      return;
    }

    const availableNewForOffer = currentStock.states.new + previousReserved;
    if (overstockForm.enabled && quantity > availableNewForOffer) {
      setOverstockMessage("Pro nadnormativní nabídku není dostatek volných nových kusů.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== overstockItemKey) {
        return item;
      }

      const stock = normalizeStockSummary(item.stockSummary);
      const previousItemOffer = item.overstockOffer;
      const previousItemReserved = Number(item.overstockReserved) || 0;
      const nextReserved = 0;
      const reservedDelta = nextReserved - previousItemReserved;
      const now = new Date().toISOString();
      const nextOffer = {
        enabled: Boolean(overstockForm.enabled),
        quantity,
        pricePerUnit,
        currency: overstockForm.currency.trim() || "CZK",
        note: overstockForm.note.trim(),
        status: overstockForm.status,
        createdAt: previousItemOffer?.createdAt || now,
        updatedAt: now,
      };
      const nextStock = {
        ...stock,
        available: stock.available - reservedDelta,
        reserved: stock.reserved + reservedDelta,
        states: {
          ...stock.states,
          new: stock.states.new - reservedDelta,
        },
      };
      const nextItem = {
        ...item,
        overstockOffer: nextOffer,
        overstockReserved: nextReserved,
        stockSummary: nextStock,
        updatedAt: now,
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: previousItemOffer ? "overstock_offer_updated" : "overstock_offer_created",
        quantity,
        state: "new",
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: nextOffer.note,
        metadata: {
          enabled: nextOffer.enabled,
          pricePerUnit: nextOffer.pricePerUnit,
          currency: nextOffer.currency,
          status: nextOffer.status,
          previousQuantity: previousItemOffer?.quantity || 0,
          reservedDelta,
          blocksIssue: false,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setOverstockItemKey("");
    setOverstockForm(createOverstockOfferForm());
    setOverstockMessage("");
  };

  const createPurchaseProposal = () => {
    if (purchaseProposal?.status === "draft") {
      const shouldReplace = window.confirm("Už existuje rozpracovaný objednávkový návrh. Chcete vytvořit nový návrh a přepsat draft?");

      if (!shouldReplace) {
        setPurchaseProposalMessage("Už existuje rozpracovaný objednávkový návrh. Stávající draft zůstává beze změny.");
        return;
      }
    }

    if (purchaseCandidates.length === 0) {
      setPurchaseProposal(null);
      setPurchaseProposalMessage("Nejsou nalezené žádné položky pod minimem.");
      return;
    }

    const proposal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: DEFAULT_INTAKE_OPERATOR,
      organization: {
        id: organizationId,
        name: organization.name,
        prefix: organization.prefix || "",
      },
      supplier: "mixed",
      status: "draft",
      items: purchaseCandidates,
    };
    const includedItemIds = new Set(proposal.items.map((item) => item.itemId));
    const nextItems = warehouseItems.map((item) => {
      if (!includedItemIds.has(getItemKey(item))) {
        return item;
      }

      const proposalItem = proposal.items.find((candidate) => candidate.itemId === getItemKey(item));

      return appendMovement({
        ...item,
        updatedAt: new Date().toISOString(),
      }, createMovementRecord({
        organizationId,
        item,
        type: "purchase_proposal_created",
        quantity: proposalItem.recommendedQuantity,
        state: "new",
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: `Objednávkový návrh do max zásoby pro nový nástroj.`,
        metadata: {
          purchaseProposalId: proposal.id,
          available: proposalItem.available,
          min: proposalItem.min,
          max: proposalItem.max,
          supplierPackQuantity: proposalItem.supplierPackQuantity,
          supplierName: proposalItem.supplierName,
          supplierType: proposalItem.supplierType,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setPurchaseProposal(proposal);
    setPurchaseProposalMessage("Objednávkový návrh byl vytvořen.");
  };

  const updatePurchaseProposalItem = (itemId, field, value) => {
    setPurchaseProposal((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => (
          item.itemId === itemId
            ? { ...item, [field]: field === "excluded" ? value : value }
            : item
        )),
      };
    });
    setPurchaseProposalMessage("");
  };

  const showPurchasePlaceholder = (text) => {
    setPurchaseProposalMessage(text);
  };

  const showPlaceholder = () => {
    setPlaceholderMessage("Tato funkce bude doplněna v další fázi.");
  };

  const openDmForm = (item) => {
    closeItemDetails(item);
    setDmFormItemKey(getItemKey(item));
    setDmForm(createDmForm());
    setDmMessage("");
  };

  const updateDmForm = (field, value) => {
    setDmForm((current) => ({
      ...current,
      [field]: value,
    }));
    setDmMessage("");
  };

  const openDmDetail = (item, dmItem) => {
    closeItemDetails(item);
    setSelectedDmDetail({
      itemId: getItemKey(item),
      dmCode: dmItem.dmCode,
    });
    setDmServiceForm(createDmServiceForm(dmItem));
    setDmServiceMessage("");
    setDmSearchMessage("");
  };

  const closeDmDetail = () => {
    setSelectedDmDetail(null);
    setDmServiceForm(createDmServiceForm());
    setDmServiceMessage("");
  };

  const closeItemDetails = (item) => {
    const itemKey = getItemKey(item);

    if (settingsItemKey === itemKey) {
      setSettingsItemKey("");
      setSettingsForm(null);
      setSettingsMessage("");
    }

    if (stockItemKey === itemKey) {
      setStockItemKey("");
      setStockForm(createStockForm());
      setStockMessage("");
    }

    if (reservationItemKey === itemKey) {
      setReservationItemKey("");
      setReservationForm(createReservationForm());
      setReservationMessage("");
    }

    if (overstockItemKey === itemKey) {
      setOverstockItemKey("");
      setOverstockForm(createOverstockOfferForm());
      setOverstockMessage("");
    }

    if (dmFormItemKey === itemKey) {
      setDmFormItemKey("");
      setDmForm(createDmForm());
      setDmMessage("");
    }

    if (selectedDmDetail?.itemId === itemKey) {
      closeDmDetail();
    }
  };

  const updateDmServiceForm = (field, value) => {
    setDmServiceForm((current) => ({
      ...current,
      [field]: value,
    }));
    setDmServiceMessage("");
  };

  const createDmItems = (event) => {
    event.preventDefault();

    const selectedItem = warehouseItems.find((item) => getItemKey(item) === dmFormItemKey);
    if (!selectedItem) {
      setDmMessage("Vyberte položku pro vytvoření DM kusů.");
      return;
    }

    const quantity = Number(dmForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setDmMessage("Zadejte kladný počet DM kusů.");
      return;
    }

    const existingCodes = getAllDmCodes(warehouseItems);
    const dmPrefix = getDmPrefix(organization);
    const dmGid = getDmGid(selectedItem);
    let nextDmSequence = getNextDmSequence(warehouseItems, dmPrefix, dmGid);
    const now = new Date().toISOString();
    const maxSharpeningCount = dmForm.maxSharpeningCount.trim() ? Number(dmForm.maxSharpeningCount) : null;
    const newDmItems = Array.from({ length: quantity }, () => {
      const generated = generateDmCode({
        existingCodes,
        prefix: dmPrefix,
        gid: dmGid,
        sequence: nextDmSequence,
      });
      nextDmSequence = generated.nextSequence;
      const dmCode = generated.code;

      return {
        id: crypto.randomUUID(),
        dmCode,
        itemId: getItemKey(selectedItem),
        gid: dmGid,
        sequence: Number(dmCode.slice(-3)),
        gpc_id: selectedItem.gpc_id || "",
        origin: selectedItem.origin || "LOCAL",
        status: dmForm.status,
        location: dmForm.location || "main_warehouse",
        currentDiameter: dmForm.currentDiameter.trim(),
        currentLength: dmForm.currentLength.trim(),
        sharpeningCount: 0,
        maxSharpeningCount,
        lastServiceAt: "",
        lastMeasuredAt: "",
        lastMeasurementProtocol: "",
        serviceNote: "",
        coating: selectedItem.tenantSettings?.coatingNote || "",
        drawingUrl: selectedItem.tenantSettings?.drawingReference || "",
        blockedReason: "",
        reservedForOrder: "",
        history: [
          createDmHistoryRecord({
            type: "dm_created",
            note: "DM kus vytvořen v GSS MVP.",
            metadata: {
              status: dmForm.status,
              location: dmForm.location,
              currentDiameter: dmForm.currentDiameter.trim(),
              currentLength: dmForm.currentLength.trim(),
            },
          }),
        ],
        createdAt: now,
        updatedAt: now,
      };
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== dmFormItemKey) {
        return item;
      }

      const nextItem = {
        ...item,
        dmItems: [...(item.dmItems || []), ...newDmItems],
        updatedAt: now,
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "dm_items_created",
        quantity,
        state: dmForm.status,
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: "Vytvořeny digitální DM kusy.",
        metadata: {
          dmCodes: newDmItems.map((dmItem) => dmItem.dmCode),
          location: dmForm.location,
          currentDiameter: dmForm.currentDiameter.trim(),
          currentLength: dmForm.currentLength.trim(),
          maxSharpeningCount,
          dmPrefix,
          gid: dmGid,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setDmFormItemKey("");
    setDmForm(createDmForm());
    setDmMessage("");
  };

  const searchDmCode = () => {
    const found = findDmItemInWarehouse(warehouseItems, dmCodeQuery);
    if (!found) {
      setDmSearchMessage("DM kód nebyl nalezen.");
      return;
    }

    openDmDetail(found.item, found.dmItem);
    setDmSearchMessage("DM kus byl nalezen.");
  };

  const saveDmService = (event) => {
    event.preventDefault();

    if (!selectedDmDetail) {
      setDmServiceMessage("Vyberte DM kus.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== selectedDmDetail.itemId) {
        return item;
      }

      const currentDmItem = (item.dmItems || []).find((dmItem) => dmItem.dmCode === selectedDmDetail.dmCode);
      if (!currentDmItem) {
        return item;
      }

      const sharpeningCount = dmServiceForm.sharpeningCount === "" ? currentDmItem.sharpeningCount : Number(dmServiceForm.sharpeningCount);
      const serviceDate = dmServiceForm.serviceDate || getTodayDate();
      const serviceProvider = dmServiceForm.serviceProvider.trim() || DEFAULT_GRINDER;
      const historyRecord = createDmHistoryRecord({
        type: "dm_service_updated",
        performedBy: serviceProvider,
        note: dmServiceForm.serviceNote.trim(),
        metadata: {
          previousDiameter: currentDmItem.currentDiameter,
          previousLength: currentDmItem.currentLength,
          currentDiameter: dmServiceForm.currentDiameter.trim(),
          currentLength: dmServiceForm.currentLength.trim(),
          sharpeningCount,
          coating: dmServiceForm.coating.trim(),
          measurementProtocol: dmServiceForm.lastMeasurementProtocol.trim(),
          serviceDate,
        },
      });

      const nextDmItems = (item.dmItems || []).map((dmItem) => {
        if (dmItem.dmCode !== selectedDmDetail.dmCode) {
          return dmItem;
        }

        return {
          ...dmItem,
          currentDiameter: dmServiceForm.currentDiameter.trim(),
          currentLength: dmServiceForm.currentLength.trim(),
          sharpeningCount,
          coating: dmServiceForm.coating.trim(),
          serviceNote: dmServiceForm.serviceNote.trim(),
          lastServiceAt: serviceDate,
          lastMeasuredAt: serviceDate,
          lastMeasurementProtocol: dmServiceForm.lastMeasurementProtocol.trim(),
          status: "resharpened_new",
          location: "main_warehouse",
          history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextItem = {
        ...item,
        dmItems: nextDmItems,
        updatedAt: new Date().toISOString(),
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "dm_service_updated",
        quantity: 1,
        state: "resharpened_new",
        performedBy: serviceProvider,
        note: dmServiceForm.serviceNote.trim(),
        metadata: {
          dmCode: selectedDmDetail.dmCode,
          currentDiameter: dmServiceForm.currentDiameter.trim(),
          currentLength: dmServiceForm.currentLength.trim(),
          sharpeningCount,
          coating: dmServiceForm.coating.trim(),
          measurementProtocol: dmServiceForm.lastMeasurementProtocol.trim(),
          serviceDate,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    const updated = findDmItemInWarehouse(nextItems, selectedDmDetail.dmCode);
    if (updated) {
      setDmServiceForm(createDmServiceForm(updated.dmItem));
    }
    setDmServiceMessage("Servisní parametry DM kusu byly uloženy.");
  };

  const receiveStock = (event) => {
    event.preventDefault();

    const quantity = Number(stockForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setStockMessage("Zadejte kladný počet kusů pro naskladnění.");
      return;
    }

    const purchasePricePerUnit = stockForm.purchasePricePerUnit.trim() ? Number(stockForm.purchasePricePerUnit) : null;
    if (purchasePricePerUnit !== null && (!Number.isFinite(purchasePricePerUnit) || purchasePricePerUnit < 0)) {
      setStockMessage("Zadejte platnou pořizovací cenu za kus.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== stockItemKey) {
        return item;
      }

      const currentStock = normalizeStockSummary(item.stockSummary);
      const isSharpening = stockForm.condition === "sharpening";
      const performedBy = stockForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR;
      const movementNote = stockForm.intakeNote.trim() || stockForm.note.trim();
      const purchaseCurrency = stockForm.purchaseCurrency.trim() || "CZK";
      const purchaseSupplier = stockForm.source.trim();
      const purchaseDate = stockForm.receivedAt || getTodayDate();
      const nextStock = {
        ...currentStock,
        total: currentStock.total + quantity,
        available: isSharpening ? currentStock.available : currentStock.available + quantity,
        sharpening: isSharpening ? currentStock.sharpening + quantity : currentStock.sharpening,
        states: {
          ...currentStock.states,
          [stockForm.condition]: currentStock.states[stockForm.condition] + quantity,
        },
        sharpeningBreakdown: {
          ...currentStock.sharpeningBreakdown,
          in_company: isSharpening ? currentStock.sharpeningBreakdown.in_company + quantity : currentStock.sharpeningBreakdown.in_company,
        },
        lastStockMovement: {
          type: "receive",
          quantity,
          condition: stockForm.condition,
          grinder: isSharpening ? stockForm.grinder.trim() || DEFAULT_GRINDER : "",
          note: stockForm.note.trim(),
          createdAt: new Date().toISOString(),
        },
        lastIntakeMetadata: {
          documentType: stockForm.documentType,
          documentTypeLabel: DOCUMENT_TYPE_LABELS[stockForm.documentType],
          documentNumber: stockForm.documentNumber.trim(),
          source: stockForm.source.trim(),
          receivedAt: stockForm.receivedAt || getTodayDate(),
          performedBy,
          note: stockForm.intakeNote.trim(),
          purchasePricePerUnit,
          purchaseCurrency,
          purchaseTotalValue: purchasePricePerUnit !== null ? purchasePricePerUnit * quantity : null,
        },
      };

      const nextItem = {
        ...item,
        lastPurchasePrice: purchasePricePerUnit,
        lastPurchaseCurrency: purchaseCurrency,
        lastPurchaseDate: purchaseDate,
        lastPurchaseSupplier: purchaseSupplier,
        stockSummary: nextStock,
        updatedAt: new Date().toISOString(),
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "intake",
        quantity,
        state: stockForm.condition,
        performedBy,
        note: movementNote,
        metadata: {
          condition: stockForm.condition,
          conditionLabel: STOCK_CONDITION_LABELS[stockForm.condition],
          documentType: stockForm.documentType,
          documentTypeLabel: DOCUMENT_TYPE_LABELS[stockForm.documentType],
          documentNumber: stockForm.documentNumber.trim(),
          source: stockForm.source.trim(),
          receivedAt: stockForm.receivedAt || getTodayDate(),
          purchasePricePerUnit,
          purchaseCurrency,
          purchaseTotalValue: purchasePricePerUnit !== null ? purchasePricePerUnit * quantity : null,
          grinder: isSharpening ? stockForm.grinder.trim() || DEFAULT_GRINDER : "",
          stockNote: stockForm.note.trim(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setStockItemKey("");
    setStockForm(createStockForm());
    setStockMessage("");
  };

  const selectIssueItem = (item) => {
    setIssueItemKey(getItemKey(item));
    setIssueForm(createIssueForm());
    setIssueMessage("");
  };

  const updateIssueForm = (field, value) => {
    setIssueForm((current) => ({
      ...current,
      [field]: value,
    }));
    setIssueMessage("");
  };

  const issueToProduction = (event) => {
    event.preventDefault();

    if (!selectedIssueItem) {
      setIssueMessage("Vyberte položku k výdeji.");
      return;
    }

    const quantity = Number(issueForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setIssueMessage("Zadejte kladný počet kusů pro výdej.");
      return;
    }

    const currentStock = releaseLegacyOverstockReservation(
      normalizeStockSummary(selectedIssueItem.stockSummary),
      selectedIssueItem.overstockReserved
    );
    if (quantity > currentStock.available) {
      setIssueMessage("Nelze vydat více kusů, než je dostupné množství.");
      return;
    }

    if (quantity > currentStock.states[issueForm.preferredState]) {
      setIssueMessage("Ve vybraném stavu není dostatek kusů k výdeji.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== issueItemKey) {
        return item;
      }

      const stock = releaseLegacyOverstockReservation(
        normalizeStockSummary(item.stockSummary),
        item.overstockReserved
      );
      const currentOffer = item.overstockOffer;
      const offerQuantity = Number(currentOffer?.quantity) || 0;
      const nextStateQuantity = stock.states[issueForm.preferredState] - quantity;
      const offerIsAffected = currentOffer?.enabled && currentOffer.status === "active" && issueForm.preferredState === "new" && offerQuantity > nextStateQuantity;
      const nextOfferQuantity = offerIsAffected ? Math.max(nextStateQuantity, 0) : offerQuantity;
      const nextOverstockOffer = offerIsAffected
        ? {
            ...currentOffer,
            quantity: nextOfferQuantity,
            status: nextOfferQuantity > 0 ? currentOffer.status : "paused",
            updatedAt: new Date().toISOString(),
          }
        : currentOffer;
      const overstockIssueNote = offerIsAffected
        ? " Výdej zasáhl do nadnormativní nabídky. Nabízené množství bylo automaticky poníženo."
        : "";
      const nextItem = {
        ...item,
        overstockOffer: nextOverstockOffer,
        overstockReserved: 0,
        stockSummary: {
          ...stock,
          available: stock.available - quantity,
          production: stock.production + quantity,
          states: {
            ...stock.states,
            [issueForm.preferredState]: nextStateQuantity,
          },
          lastIssueMetadata: {
            type: "issue_to_production",
            quantity,
            preferredState: issueForm.preferredState,
            preferredStateLabel: ISSUE_STATE_LABELS[issueForm.preferredState],
            costCenter: issueForm.costCenter.trim(),
            machine: issueForm.machine.trim(),
            job: issueForm.job.trim(),
            note: issueForm.note.trim(),
            overstockOfferAdjusted: offerIsAffected,
            overstockOfferPreviousQuantity: offerIsAffected ? offerQuantity : undefined,
            overstockOfferNextQuantity: offerIsAffected ? nextOfferQuantity : undefined,
            issuedAt: new Date().toISOString(),
            performedBy: DEFAULT_INTAKE_OPERATOR,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "issue_to_production",
        quantity,
        state: issueForm.preferredState,
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: `${issueForm.note.trim()}${overstockIssueNote}`.trim(),
        metadata: {
          preferredState: issueForm.preferredState,
          preferredStateLabel: ISSUE_STATE_LABELS[issueForm.preferredState],
          costCenter: issueForm.costCenter.trim(),
          machine: issueForm.machine.trim(),
          job: issueForm.job.trim(),
          overstockOfferAdjusted: offerIsAffected,
          overstockOfferPreviousQuantity: offerIsAffected ? offerQuantity : undefined,
          overstockOfferNextQuantity: offerIsAffected ? nextOfferQuantity : undefined,
          issuedAt: new Date().toISOString(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    const affectedItem = nextItems.find((item) => getItemKey(item) === issueItemKey);
    const overstockWasAdjusted = Boolean(affectedItem?.stockSummary?.lastIssueMetadata?.overstockOfferAdjusted);
    setIssueMessage(overstockWasAdjusted
      ? "Položka byla vydána do výroby. Výdej zasáhl do nadnormativní nabídky. Nabízené množství bylo automaticky poníženo."
      : "Položka byla vydána do výroby.");
  };

  const reportStockDifference = () => {
    if (!selectedIssueItem) {
      setIssueMessage("Vyberte položku pro ohlášení rozdílu ve skladu.");
      return;
    }

    const stock = normalizeStockSummary(selectedIssueItem.stockSummary);
    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== issueItemKey) {
        return item;
      }

      return appendMovement({
        ...item,
        updatedAt: new Date().toISOString(),
      }, createMovementRecord({
        organizationId,
        item,
        type: "stock_difference_report",
        quantity: 0,
        state: issueForm.preferredState,
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: "Pracovník ohlásil rozdíl ve fyzické zásobě.",
        metadata: {
          expectedAvailable: stock.available,
          expectedStateQuantity: stock.states[issueForm.preferredState],
          selectedState: issueForm.preferredState,
          selectedStateLabel: ISSUE_STATE_LABELS[issueForm.preferredState],
          issueQuery: issueQuery.trim(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setIssueMessage("Rozdíl ve skladu byl ohlášen zodpovědné osobě. Detailní audit workflow bude doplněn později.");
  };

  const selectReturnItem = (item) => {
    setReturnItemKey(getItemKey(item));
    setReturnForm(createReturnForm());
    setReturnMessage("");
  };

  const updateReturnForm = (field, value) => {
    setReturnForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "decision" && value !== "send_sharpening" ? { confirmSharpeningOverride: false } : {}),
    }));
    setReturnMessage("");
  };

  const returnFromProduction = (event) => {
    event.preventDefault();

    if (!selectedReturnItem) {
      setReturnMessage("Vyberte položku pro návrat z výroby.");
      return;
    }

    const quantity = Number(returnForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setReturnMessage("Zadejte kladný počet kusů pro návrat.");
      return;
    }

    const currentStock = normalizeStockSummary(selectedReturnItem.stockSummary);
    if (quantity > currentStock.production) {
      setReturnMessage("Nelze vrátit více kusů, než je aktuálně ve výrobě.");
      return;
    }

    const requiresSharpeningOverride = returnForm.decision === "send_sharpening" && !selectedReturnItem.tenantSettings?.sharpen?.enabled;
    if (requiresSharpeningOverride && !returnForm.confirmSharpeningOverride) {
      setReturnMessage("Položka není nastavena jako brousitelná. Potvrďte výjimku, jinak se návrat na broušení neuloží.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== returnItemKey) {
        return item;
      }

      const stock = normalizeStockSummary(item.stockSummary);
      const nextStock = {
        ...stock,
        production: stock.production - quantity,
        lastReturnMetadata: {
          type: "return_from_production",
          quantity,
          decision: returnForm.decision,
          decisionLabel: RETURN_DECISION_LABELS[returnForm.decision],
          returnedAt: returnForm.returnedAt || getTodayDate(),
          performedBy: returnForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR,
          costCenter: returnForm.costCenter.trim(),
          machine: returnForm.machine.trim(),
          job: returnForm.job.trim(),
          note: returnForm.note.trim(),
          grinder: returnForm.grinder.trim(),
          serviceInstruction: returnForm.serviceInstruction.trim(),
          discardReason: returnForm.discardReason.trim(),
          redirectInstruction: returnForm.redirectInstruction.trim(),
          blockReason: returnForm.blockReason.trim(),
          createdAt: new Date().toISOString(),
        },
      };

      if (returnForm.decision === "return_used") {
        nextStock.available += quantity;
        nextStock.states.used += quantity;
      }

      if (returnForm.decision === "send_sharpening") {
        nextStock.sharpening += quantity;
        nextStock.states.sharpening += quantity;
        nextStock.sharpeningBreakdown.in_company += quantity;
      }

      const nextItem = {
        ...item,
        stockSummary: nextStock,
        updatedAt: new Date().toISOString(),
      };
      const movementType = returnForm.decision === "send_sharpening" ? "send_to_sharpening" : "return_from_production";
      const movementState = returnForm.decision === "send_sharpening" ? "sharpening" : "used";

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: movementType,
        quantity,
        state: movementState,
        performedBy: returnForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR,
        note: returnForm.note.trim() || returnForm.serviceInstruction.trim() || returnForm.discardReason.trim() || returnForm.redirectInstruction.trim() || returnForm.blockReason.trim(),
        metadata: {
          decision: returnForm.decision,
          decisionLabel: RETURN_DECISION_LABELS[returnForm.decision],
          returnedAt: returnForm.returnedAt || getTodayDate(),
          costCenter: returnForm.costCenter.trim(),
          machine: returnForm.machine.trim(),
          job: returnForm.job.trim(),
          grinder: returnForm.grinder.trim(),
          serviceInstruction: returnForm.serviceInstruction.trim(),
          discardReason: returnForm.discardReason.trim(),
          redirectInstruction: returnForm.redirectInstruction.trim(),
          blockReason: returnForm.blockReason.trim(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setReturnMessage("Položka byla vrácena z výroby.");
  };

  return (
    <div style={wrap}>
      <h1 style={title}>GSS</h1>
      <div style={lead}>
        Tenant-aware GSS vstup pro aktuální organizaci. V MVP se aktivní tenant bere z `activeOrganizationId`.
      </div>
      <div style={actions}>
        <a href="/admin/organizations" style={btnSecondary}>Správa organizací / založit další firmu</a>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Organizace</h2>
        <div style={summaryGrid}>
          <div style={summaryItem}>
            <div style={summaryLabel}>Firma</div>
            <div style={summaryValue}>{organization.name}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Prefix</div>
            <div style={summaryValue}>{organization.prefix || "neuvedeno"}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Stav organizace</div>
            <div style={summaryValue}>{labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Aktivní moduly</div>
            <div style={summaryValue}>{formatModules(activeModules)}</div>
          </div>
        </div>
      </div>

      {!hasGssModule ? (
        <div style={box}>
          <h2 style={subtitle}>GSS modul není pro tuto organizaci aktivní.</h2>
          <div style={muted}>
            Aktivaci modulu zatím řeší interní Gogrou správa organizací. Později bude napojená na subscription a billing.
          </div>
        </div>
      ) : (
        <>
          <div style={box}>
            <h2 style={subtitle}>Skladový terminál</h2>
            <div style={hintBox}>
              Najděte položku, otevřete její detail, vyberte akci a po provedení se vraťte zpět na skladový seznam.
            </div>
            <div style={summaryGrid}>
              <div style={summaryItem}>
                <div style={summaryLabel}>Položky</div>
                <div style={summaryValue}>{warehouseItems.length}</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>DM položky</div>
                <div style={summaryValue}>{dmItemCount}</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>Min/max upozornění</div>
                <div style={summaryValue}>placeholder</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>Storage</div>
                <div style={summaryValue}>gss_wh_{organizationId}_MAIN</div>
              </div>
            </div>

            <div style={actions}>
              <button type="button" onClick={openWarehouseSection} style={btnPrimary}>Otevřít sklad</button>
              <button type="button" onClick={() => openMainPanel("intake")} style={btnPrimary}>Příjem</button>
              <button type="button" onClick={openIssuePanel} style={btnPrimary}>Výdej</button>
              <button type="button" onClick={openReturnPanel} style={btnPrimary}>Návrat z výroby</button>
              <button type="button" onClick={() => openMainPanel("dm")} style={btnSecondary}>Načíst DM kód</button>
              <button type="button" onClick={() => openMainPanel("gpc")} style={btnSecondary}>Vyhledat v GPC</button>
              <button type="button" onClick={openLocalItemForm} style={btnSecondary}>Přidat lokální položku</button>
              <button type="button" onClick={() => openMainPanel("purchase")} style={btnSecondary}>Objednávkový návrh</button>
              <button type="button" onClick={() => openMainPanel("overstock")} style={btnSecondary}>Nadnormativní zásoby</button>
              <button type="button" onClick={() => openMainPanel("movements")} style={btnSecondary}>Poslední pohyby</button>
            </div>
            {placeholderMessage ? <div style={errorMessage}>{placeholderMessage}</div> : null}
          </div>

          {activeMainPanel === "intake" ? (
            <div style={box}>
              <div style={detailHeader}>
                <div>
                  <h2 style={subtitle}>Příjem</h2>
                  <div style={muted}>Příjem na sklad se v MVP provádí z detailu konkrétní položky přes akci Naskladnit.</div>
                </div>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
              </div>
              <div style={summaryGrid}>
                <div style={summaryItem}>
                  <div style={settingsTitle}>Bez objednávky</div>
                  <div style={meta}>
                    Otevřete detail skladové položky a použijte akci Naskladnit. Tento režim slouží pro ruční příjem, inventuru, servisní návrat nebo příjem bez vazby na vystavenou objednávku.
                  </div>
                </div>
                <div style={summaryItem}>
                  <div style={settingsTitle}>Z objednávky</div>
                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      Číslo objednávky
                      <input disabled value="" placeholder="bude doplněno později" style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Dodavatel
                      <input disabled value="" placeholder="bude doplněno později" style={input} />
                    </label>
                  </div>
                  <div style={offerInfo}>Budoucí příjem podle vystavené objednávky GSS. Seznam položek objednávky bude doplněn později.</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeMainPanel === "purchase" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Objednávkový návrh</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            <div style={hintBox}>
              Objednávka v GSS vždy znamená požadavek na nový nástroj. Použité, přebroušené, výrobní, brousicí a rezervované kusy se neobjednávají.
            </div>
            <div style={muted}>
              Návrh hledá položky s nastaveným min/max a skutečně volným dostupným množstvím pod minimem. Množství se dopočítává do max a zaokrouhluje na dodací násobek.
            </div>
            <div style={offerInfo}>
              Mimořádná ruční objednávka pro budoucí zakázku nebo očekávanou spotřebu bude rozšířením tohoto návrhu v další fázi.
            </div>
            <div style={hintBox}>
              Porovnání nabídek bude doplněno v další fázi.
            </div>
            <div style={muted}>
              Budoucí porovnání zohlední Gogrou partnera, uložené dodavatele zákazníka, nového dodavatele, nadnormativu v komunitě, cenové akce, SS nabídku a Promitea / RFQ výsledek.
            </div>

            {purchaseCandidates.length > 0 ? (
              <div style={resultList}>
                {purchaseCandidates.map((item) => (
                  <div key={item.itemId} style={resultItem}>
                    <div>
                      <div style={resultTitle}>{item.itemName}</div>
                      <div style={meta}>
                        {item.manufacturer || "Výrobce neuveden"} · Dodavatel: {item.supplierName} · {item.supplierType}
                      </div>
                      <div style={meta}>
                        {item.gpc_id ? `GPC ID: ${item.gpc_id}` : "Bez GPC vazby"} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                      </div>
                      <div style={stateBreakdown}>
                        <span>Available: {item.available}</span>
                        <span>Min: {item.min}</span>
                        <span>Max: {item.max}</span>
                        <span>Dodací násobek: {item.supplierPackQuantity}</span>
                        <span>Doporučeno objednat: {item.recommendedQuantity}</span>
                        <span>{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={muted}>Žádná položka není pod minimem nebo nemá nastavené min/max.</div>
            )}

            {purchaseProposal ? (
              <div style={settingsPanel}>
                <div style={settingsTitle}>Objednávkový balíček</div>
                <div style={meta}>
                  ID: {purchaseProposal.id} · stav: {purchaseProposal.status} · vytvořil {purchaseProposal.createdBy}
                </div>
                <div style={resultList}>
                  {purchaseProposal.items.map((item) => (
                    <div key={item.itemId} style={resultItem}>
                      <div>
                        <label style={checkLabel}>
                          <input
                            type="checkbox"
                            checked={!item.excluded}
                            onChange={(event) => updatePurchaseProposalItem(item.itemId, "excluded", !event.target.checked)}
                          />
                          Zahrnout do návrhu
                        </label>
                        <div style={resultTitle}>{item.itemName}</div>
                        <div style={meta}>{item.supplierName} · {item.supplierType} · doporučeno {item.recommendedQuantity} ks</div>
                        <div style={formGrid}>
                          <label style={fieldLabel}>
                            Upravené množství
                            <input
                              type="number"
                              min="0"
                              value={item.editedQuantity}
                              onChange={(event) => updatePurchaseProposalItem(item.itemId, "editedQuantity", event.target.value)}
                              style={input}
                            />
                          </label>
                          <label style={fieldLabel}>
                            Poznámka
                            <input
                              value={item.note}
                              onChange={(event) => updatePurchaseProposalItem(item.itemId, "note", event.target.value)}
                              style={input}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {purchaseProposalMessage ? <div style={purchaseProposalMessage.includes("vytvořen") ? message : errorMessage}>{purchaseProposalMessage}</div> : null}

            <div style={actions}>
              <button type="button" onClick={createPurchaseProposal} style={btnPrimary}>Vytvořit objednávkový návrh</button>
              <button type="button" onClick={() => showPurchasePlaceholder("Porovnání nabídek bude doplněno v další fázi.")} style={btnSecondary}>Připravuje se: porovnání nabídek</button>
              <button type="button" onClick={() => showPurchasePlaceholder("Ruční mimořádná objednávka bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: ruční objednávka</button>
              <button type="button" onClick={() => showPurchasePlaceholder("Tato funkce bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: vygenerovat objednávku</button>
              <button type="button" onClick={() => showPurchasePlaceholder("Tato funkce bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: Export XLS / Promitea</button>
              <button type="button" onClick={() => showPurchasePlaceholder("Tato funkce bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: odeslat objednávku</button>
            </div>
          </div>
          ) : null}

          {showIssuePanel ? (
            <div ref={issueSectionRef} style={box}>
              <div style={detailHeader}>
                <h2 style={subtitle}>Výdej do výroby</h2>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
              </div>
              <div style={hintBox}>
                Výdej do výroby je samostatná GSS služba. Nejde o přesun mezi sklady zákazníka.
              </div>
              <div style={muted}>
                Pro MVP se hledá pouze v tenant skladových položkách. Později půjde načíst DM kód nebo kód z pracovního postupu.
              </div>
              <div style={offerInfo}>
                Skladový kontext: Hlavní sklad. V MVP se všechny výdeje provádí z hlavního skladu organizace.
              </div>

              <input
                value={issueQuery}
                onChange={(event) => {
                  setIssueQuery(event.target.value);
                  setIssueMessage("");
                }}
                placeholder="Hledat podle názvu, GPC ID, GTIN, interního kódu, výrobce, typu nebo rozměru"
                style={input}
              />

              {normalizedIssueQuery && issueResults.length === 0 ? (
                <div style={muted}>Nebyla nalezena žádná tenant skladová položka.</div>
              ) : null}

              {issueResults.length > 0 ? (
                <div style={resultList}>
                  {issueResults.map((item) => {
                    const stock = releaseLegacyOverstockReservation(normalizeStockSummary(item.stockSummary), item.overstockReserved);
                    const selected = getItemKey(item) === issueItemKey;

                    return (
                      <div key={getItemKey(item)} style={selected ? highlightedResultItem : resultItem}>
                        <div>
                          <div style={resultTitle}>{item.name || item.gpc_id}</div>
                          {item.origin === "LOCAL" ? (
                            <div style={badgeWarning}>Lokální nevalidovaná položka</div>
                          ) : null}
                          <div style={meta}>{item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}</div>
                          <div style={meta}>
                            {item.origin === "LOCAL" ? `Lokální ID: ${item.localFields?.internalCode || getItemKey(item)}` : `GPC ID: ${item.gpc_id || "bez vazby"}`} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                          </div>
                          <div style={meta}>
                            Dostupné: {stock.available} · Celkem: {stock.total} · Ve výrobě: {stock.production} · Na broušení: {stock.sharpening}
                          </div>
                          {stock.reserved > 0 ? (
                            <div style={badgeWarning}>Některé kusy jsou rezervované.</div>
                          ) : null}
                          <div style={stateBreakdown}>
                            <span>Nový: {stock.states.new}</span>
                            <span>Nový přebroušený: {stock.states.resharpened_new}</span>
                            <span>Použitý: {stock.states.used}</span>
                            <span>Na broušení: {stock.states.sharpening}</span>
                          </div>
                          <div style={meta}>
                            DM tracking: {item.tenantSettings?.dmEnabled ? "ano" : "ne"} · Brousitelnost: {item.tenantSettings?.sharpen?.enabled ? "ano" : "ne"}
                          </div>
                        </div>
                        <button type="button" onClick={() => selectIssueItem(item)} style={selected ? btnImport : btnSecondary}>
                          {selected ? "Vybráno" : "Vybrat k výdeji"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {selectedIssueItem ? (
                <form onSubmit={issueToProduction} style={settingsPanel}>
                  <div style={settingsTitle}>Vydat do výroby</div>
                  <div style={meta}>
                    {selectedIssueItem.name || selectedIssueItem.gpc_id} · dostupné {selectedIssueStock.available} ks
                  </div>
                  {selectedIssueItem.origin === "LOCAL" ? (
                    <div style={badgeWarning}>Lokální nevalidovaná položka · lze vydat do výroby jako tenant skladovou položku</div>
                  ) : null}
                  <div style={stateBreakdown}>
                    <span>Dostupné celkem: {selectedIssueStock.available}</span>
                    <span>Nový: {selectedIssueStock.states.new}</span>
                    <span>Nový přebroušený: {selectedIssueStock.states.resharpened_new}</span>
                    <span>Použitý: {selectedIssueStock.states.used}</span>
                  </div>
                  <div style={hintBox}>
                    Vybraný stav: {ISSUE_STATE_LABELS[issueForm.preferredState]} · dostupné v tomto stavu: {selectedIssueStock.states[issueForm.preferredState]} ks
                  </div>
                  {selectedIssueItem.tenantSettings?.dmEnabled ? (
                    <div style={offerInfo}>
                      Načtěte DM kód vydávaného kusu. V MVP zatím není detailní DM výdej implementovaný.
                    </div>
                  ) : null}

                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      Preferovaný stav pro výdej
                      <select
                        value={issueForm.preferredState}
                        onChange={(event) => updateIssueForm("preferredState", event.target.value)}
                        style={input}
                      >
                        <option value="used">Použitý</option>
                        <option value="resharpened_new">Nový přebroušený</option>
                        <option value="new">Nový</option>
                      </select>
                    </label>
                    <label style={fieldLabel}>
                      Počet kusů do výroby
                      <input
                        type="number"
                        min="1"
                        value={issueForm.quantity}
                        onChange={(event) => updateIssueForm("quantity", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Středisko
                      <input
                        value={issueForm.costCenter}
                        onChange={(event) => updateIssueForm("costCenter", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Stroj
                      <input
                        value={issueForm.machine}
                        onChange={(event) => updateIssueForm("machine", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Zakázka
                      <input
                        value={issueForm.job}
                        onChange={(event) => updateIssueForm("job", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Poznámka k výdeji
                      <textarea
                        value={issueForm.note}
                        onChange={(event) => updateIssueForm("note", event.target.value)}
                        style={textarea}
                      />
                    </label>
                  </div>

                  <div style={offerInfo}>
                    V MVP jsou dimenze textová pole. Později se budou vybírat z hodnot definovaných v administraci firmy.
                  </div>
                  <div style={offerInfo}>
                    Výdej sníží dostupné množství, zvýší množství ve výrobě a nikdy nevydává kusy ve stavu Na broušení.
                  </div>
                  <div style={hintBox}>
                    Výdej nad systémovou zásobu není v MVP povolený. Pokud fyzicky vidíte více kusů než systém, použijte Ohlásit rozdíl ve skladu. Budoucí override pro vyšší roli bude doplněn později.
                  </div>

                  {issueMessage ? <div style={issueMessage.includes("vydána") || issueMessage.includes("ohlášen") ? message : errorMessage}>{issueMessage}</div> : null}

                  <div style={actions}>
                    <button type="submit" style={btnImport}>Vydat do výroby</button>
                    <button
                      type="button"
                      onClick={reportStockDifference}
                      style={btnSecondary}
                    >
                      Ohlásit rozdíl ve skladu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIssueItemKey("");
                        setIssueForm(createIssueForm());
                        setIssueMessage("");
                      }}
                      style={btnSecondary}
                    >
                      Zavřít výdej položky
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          ) : null}

          {showReturnPanel ? (
            <div ref={returnSectionRef} style={box}>
              <div style={detailHeader}>
                <h2 style={subtitle}>Návrat z výroby</h2>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
              </div>
              <div style={hintBox}>
                Návrat z výroby je samostatný GSS pohyb. Po návratu musí být vždy rozhodnuto, co se s položkou stane dál.
              </div>
              <div style={muted}>
                V MVP se pracuje s agregovaným množstvím. Pokud má položka DM tracking, budoucí návrat proběhne nad konkrétním DM kusem.
              </div>

              <input
                value={returnQuery}
                onChange={(event) => {
                  setReturnQuery(event.target.value);
                  setReturnMessage("");
                }}
                placeholder="Hledat podle názvu, GPC ID, GTIN, interního kódu, výrobce, typu nebo rozměru"
                style={input}
              />

              {normalizedReturnQuery && returnResults.length === 0 ? (
                <div style={muted}>Nebyla nalezena žádná tenant skladová položka.</div>
              ) : null}

              {returnResults.length > 0 ? (
                <div style={resultList}>
                  {returnResults.map((item) => {
                    const stock = normalizeStockSummary(item.stockSummary);
                    const selected = getItemKey(item) === returnItemKey;

                    return (
                      <div key={getItemKey(item)} style={selected ? highlightedResultItem : resultItem}>
                        <div>
                          <div style={resultTitle}>{item.name || item.gpc_id}</div>
                          <div style={meta}>{item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}</div>
                          <div style={meta}>
                            {item.origin === "LOCAL" ? `Lokální ID: ${item.localFields?.internalCode || getItemKey(item)}` : `GPC ID: ${item.gpc_id || "bez vazby"}`} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                          </div>
                          <div style={meta}>
                            Ve výrobě: {stock.production} · Dostupné: {stock.available} · Na broušení: {stock.sharpening}
                          </div>
                          <div style={stateBreakdown}>
                            <span>Nový: {stock.states.new}</span>
                            <span>Nový přebroušený: {stock.states.resharpened_new}</span>
                            <span>Použitý: {stock.states.used}</span>
                            <span>Na broušení: {stock.states.sharpening}</span>
                          </div>
                          <div style={meta}>
                            DM tracking: {item.tenantSettings?.dmEnabled ? "ano" : "ne"} · Brousitelná: {item.tenantSettings?.sharpen?.enabled ? "ano" : "ne"} · Max přebroušení: {item.tenantSettings?.sharpen?.cycles || "nenastaveno"}
                          </div>
                          {item.tenantSettings?.sharpen?.note ? (
                            <div style={meta}>Servisní instrukce: {item.tenantSettings.sharpen.note}</div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => selectReturnItem(item)}
                          disabled={stock.production <= 0}
                          style={stock.production <= 0 ? btnDisabled : selected ? btnImport : btnSecondary}
                        >
                          {stock.production <= 0 ? "Není ve výrobě" : selected ? "Vybráno" : "Vybrat k návratu"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {selectedReturnItem ? (
                <form onSubmit={returnFromProduction} style={settingsPanel}>
                  <div style={settingsTitle}>Vrátit z výroby</div>
                  <div style={meta}>
                    {selectedReturnItem.name || selectedReturnItem.gpc_id} · ve výrobě {normalizeStockSummary(selectedReturnItem.stockSummary).production} ks
                  </div>
                  {selectedReturnItem.tenantSettings?.dmEnabled ? (
                    <div style={offerInfo}>
                      Načtěte DM kód vraceného kusu. V MVP zatím není detailní DM návrat implementovaný.
                    </div>
                  ) : null}

                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      Počet kusů
                      <input
                        type="number"
                        min="1"
                        value={returnForm.quantity}
                        onChange={(event) => updateReturnForm("quantity", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Datum návratu
                      <input
                        type="date"
                        value={returnForm.returnedAt}
                        onChange={(event) => updateReturnForm("returnedAt", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Provedl
                      <input
                        value={returnForm.performedBy}
                        onChange={(event) => updateReturnForm("performedBy", event.target.value)}
                        style={input}
                      />
                    </label>
                    <label style={fieldLabel}>
                      Středisko
                      <input value={returnForm.costCenter} onChange={(event) => updateReturnForm("costCenter", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Stroj
                      <input value={returnForm.machine} onChange={(event) => updateReturnForm("machine", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Zakázka
                      <input value={returnForm.job} onChange={(event) => updateReturnForm("job", event.target.value)} style={input} />
                    </label>
                  </div>

                  <label style={fieldLabel}>
                    Poznámka k návratu
                    <textarea value={returnForm.note} onChange={(event) => updateReturnForm("note", event.target.value)} style={textarea} />
                  </label>

                  <div style={settingsTitle}>Rozhodnutí po návratu</div>
                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      Co se s položkou stane dál
                      <select
                        value={returnForm.decision}
                        onChange={(event) => updateReturnForm("decision", event.target.value)}
                        style={input}
                      >
                        <option value="return_used">Zpět na sklad jako Použitý</option>
                        <option value="send_sharpening">Poslat na broušení</option>
                        <option value="scrap_carbide">Vyřadit / odkup tvrdokovu</option>
                        <option value="redirect_instruction">Přesměrovat podle instrukce / jiná řezná hrana</option>
                        <option value="temporary_block">Dočasně zablokovat</option>
                      </select>
                    </label>
                    {returnForm.decision === "send_sharpening" ? (
                      <>
                        <label style={fieldLabel}>
                          Brusič
                          <input value={returnForm.grinder} onChange={(event) => updateReturnForm("grinder", event.target.value)} style={input} />
                        </label>
                        <label style={fieldLabel}>
                          Provozní instrukce
                          <input
                            value={returnForm.serviceInstruction}
                            onChange={(event) => updateReturnForm("serviceInstruction", event.target.value)}
                            placeholder="Dát do červené krabice"
                            style={input}
                          />
                        </label>
                      </>
                    ) : null}
                    {returnForm.decision === "scrap_carbide" ? (
                      <label style={fieldLabel}>
                        Důvod vyřazení / recyklace
                        <input
                          value={returnForm.discardReason}
                          onChange={(event) => updateReturnForm("discardReason", event.target.value)}
                          placeholder="Vložit do černé krabice na odkup tvrdokovu"
                          style={input}
                        />
                      </label>
                    ) : null}
                    {returnForm.decision === "redirect_instruction" ? (
                      <label style={fieldLabel}>
                        Instrukce pro přesměrování
                        <input
                          value={returnForm.redirectInstruction}
                          onChange={(event) => updateReturnForm("redirectInstruction", event.target.value)}
                          placeholder="Vložit podle interní instrukce / jiná řezná hrana"
                          style={input}
                        />
                      </label>
                    ) : null}
                    {returnForm.decision === "temporary_block" ? (
                      <label style={fieldLabel}>
                        Důvod blokace
                        <input
                          value={returnForm.blockReason}
                          onChange={(event) => updateReturnForm("blockReason", event.target.value)}
                          placeholder="Čeká na kontrolu mistra / technologa"
                          style={input}
                        />
                      </label>
                    ) : null}
                  </div>

                  {returnForm.decision === "return_used" ? (
                    <div style={offerInfo}>Umístění není nastavené. Použitý nástroj může být stále použitelný pro méně náročné operace.</div>
                  ) : null}
                  {returnForm.decision === "send_sharpening" && !selectedReturnItem.tenantSettings?.sharpen?.enabled ? (
                    <div style={errorMessage}>
                      <div>Položka není nastavena jako brousitelná. Odeslání na broušení je výjimka a musí být potvrzené.</div>
                      <label style={{ ...checkLabel, marginTop: 8 }}>
                        <input
                          type="checkbox"
                          checked={returnForm.confirmSharpeningOverride}
                          onChange={(event) => updateReturnForm("confirmSharpeningOverride", event.target.checked)}
                        />
                        Potvrzuji výjimku pro odeslání nebrousitelné položky na broušení
                      </label>
                    </div>
                  ) : null}
                  {returnForm.decision === "scrap_carbide" ? (
                    <div style={offerInfo}>Vložit do černé bedýnky. U destiček / tvrdokovu vložit do černé krabice na odkup tvrdokovu.</div>
                  ) : null}

                  {returnMessage ? <div style={returnMessage.includes("vrácena") ? message : errorMessage}>{returnMessage}</div> : null}

                  <div style={actions}>
                    <button type="submit" style={btnImport}>Potvrdit návrat</button>
                    <button
                      type="button"
                      onClick={() => {
                        setReturnItemKey("");
                        setReturnForm(createReturnForm());
                        setReturnMessage("");
                      }}
                      style={btnSecondary}
                    >
                      Zavřít návrat položky
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          ) : null}

          {activeMainPanel === "gpc" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Vyhledat v GPC</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            <div style={hintBox}>
              Vyhledejte validovanou položku v GPC a převeďte ji do svého skladu.
            </div>
            <div style={muted}>
              GPC zůstává validovaná master databanka. Převzetím vznikne lokální tenant skladová položka v GSS.
            </div>
            <input
              value={gpcQuery}
              onChange={(event) => {
                setGpcQuery(event.target.value);
                setImportMessage("");
              }}
              placeholder="Hledat podle názvu, GPC ID, GTIN, výrobce nebo typu"
              style={input}
            />

            {importMessage ? <div style={message}>{importMessage}</div> : null}

            {normalizedGpcQuery && gpcResults.length === 0 ? (
              <div style={muted}>V GPC nebyla nalezena žádná položka.</div>
            ) : null}

            {gpcResults.length > 0 ? (
              <div style={resultList}>
                {gpcResults.map((tool) => {
                  const alreadyInWarehouse = warehouseItems.some((item) => item.gpc_id === tool.gpc_id);

                  return (
                    <div key={tool.gpc_id} style={resultItem}>
                      <div>
                        <div style={resultTitle}>{tool.name}</div>
                        <div style={meta}>
                          {tool.manufacturer || "Výrobce neuveden"} · {tool.type || "Typ neuveden"}
                        </div>
                        <div style={meta}>
                          GPC ID: {tool.gpc_id} {tool.gtin ? `· GTIN: ${tool.gtin}` : ""}
                        </div>
                        <div style={meta}>{formatBasicParameters(tool)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addGpcItemToGss(tool)}
                        disabled={alreadyInWarehouse}
                        style={alreadyInWarehouse ? btnDisabled : btnImport}
                      >
                        {alreadyInWarehouse ? "Již na skladu" : "Převzít do skladu"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          ) : null}

          {activeMainPanel === "dm" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Načíst DM kód</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            <div style={hintBox}>
              Ruční MVP vstup pro DM kód. Později bude napojený na čtečku a automaticky otevře konkrétní kus.
            </div>
            <div style={formGrid}>
              <label style={fieldLabel}>
                DM kód
                <input
                  value={dmCodeQuery}
                  onChange={(event) => {
                    setDmCodeQuery(event.target.value);
                    setDmSearchMessage("");
                  }}
                  placeholder="např. AH01-000045872-001"
                  style={input}
                />
              </label>
            </div>
            {dmSearchMessage ? <div style={dmSearchMessage.includes("nalezen") ? message : errorMessage}>{dmSearchMessage}</div> : null}
            <div style={actions}>
              <button type="button" onClick={searchDmCode} style={btnImport}>Vyhledat DM</button>
            </div>
            <div style={offerInfo}>
              M-technologies / Gogrou servisní přístup je v MVP připraven jako princip: servisní partner načte DM kód a pracuje pouze s tenant provozními daty konkrétního kusu.
            </div>
          </div>
          ) : null}

          {selectedDmContext ? (
            <div style={box}>
              <h2 style={subtitle}>DM detail</h2>
              <DmDetailContent
                item={selectedDmContext.item}
                dmItem={selectedDmContext.dmItem}
                dmServiceForm={dmServiceForm}
                dmServiceMessage={dmServiceMessage}
                onUpdateServiceForm={updateDmServiceForm}
                onSaveService={saveDmService}
                onClose={() => closeItemDetails(selectedDmContext.item)}
                onPlaceholder={showPlaceholder}
              />
            </div>
          ) : null}

          <div ref={warehouseSectionRef} style={warehouseHighlighted ? highlightedBox : box}>
            <h2 style={subtitle}>Skladové položky</h2>
            {!selectedWarehouseItem ? (
              <>
                <input
                  value={warehouseSearchQuery}
                  onChange={(event) => setWarehouseSearchQuery(event.target.value)}
                  placeholder="Vyhledat skladovou položku… např. Walter ; fréza ; D12 ; 4z"
                  style={input}
                />
                <div style={muted}>
                  Více kritérií oddělte čárkou nebo středníkem. Např. Walter ; fréza ; D12 ; 4z.
                  Později zde bude GINA/AI vyhledávání: např. Najdi frézu D12, 4 zuby, délka břitu min. 25.
                </div>
              </>
            ) : null}
            {warehouseItems.length === 0 ? (
              <div style={muted}>Tenant sklad zatím neobsahuje žádné položky převzaté z GPC.</div>
            ) : !selectedWarehouseItem && filteredWarehouseItems.length === 0 ? (
              <div style={muted}>Žádná skladová položka neodpovídá zadaným kritériím.</div>
            ) : (
              <div style={resultList}>
                {(selectedWarehouseItem ? [selectedWarehouseItem] : filteredWarehouseItems).map((item) => {
                  const itemKey = getItemKey(item);
                  const stock = normalizeStockSummary(item.stockSummary);
                  const activeReservations = getActiveReservations(item);
                  const overstockOffer = item.overstockOffer;
                  const overstockIsActive = Boolean(overstockOffer?.enabled && overstockOffer.status === "active");
                  const overstockAlert = getOverstockAlertMessage(overstockOffer);

                  if (!selectedWarehouseItem) {
                    return (
                      <div key={itemKey} style={warehouseRow}>
                        <button type="button" onClick={() => openWarehouseItemDetail(item)} style={warehouseRowMain}>
                          <div>
                            <div style={resultTitle}>{item.name || item.gpc_id || "Položka bez názvu"}</div>
                            <div style={meta}>{item.type || "Typ neuveden"} · {item.manufacturer || "Výrobce neuveden"}</div>
                            <div style={meta}>
                              {item.origin === "LOCAL"
                                ? `GSS lokální: ${item.localFields?.internalCode || itemKey}`
                                : `GPC ID: ${item.gpc_id || "bez vazby"}`}
                              {item.gtin ? ` · GTIN: ${item.gtin}` : ""}
                            </div>
                          </div>
                          <div style={warehouseRowNumbers}>
                            <span>Celkem {stock.total}</span>
                            <span>Dostupné {stock.available}</span>
                            <span>Rezervace {stock.reserved}</span>
                            <span>Výroba {stock.production}</span>
                            <span>Broušení {stock.sharpening}</span>
                          </div>
                          <div style={warehouseRowNumbers}>
                            <span>DM {item.tenantSettings?.dmEnabled ? "ano" : "ne"}</span>
                            <span>Min {item.tenantSettings?.min || "-"}</span>
                            <span>Max {item.tenantSettings?.max || "-"}</span>
                            <span>Warning {item.tenantSettings?.warning || "-"}</span>
                            <span>Nadnormativa {overstockOffer?.enabled ? getOverstockStatusLabel(overstockOffer.status) : "ne"}</span>
                          </div>
                        </button>
                        <button type="button" onClick={() => openWarehouseItemDetail(item)} style={btnSecondary}>Detail položky</button>
                      </div>
                    );
                  }

                  return (
                  <div key={itemKey} style={resultItem}>
                    <div>
                      <div style={detailHeader}>
                        <div>
                          <div style={settingsTitle}>Detail položky</div>
                          <div style={muted}>Po práci s položkou se můžete vrátit zpět na kompaktní skladový seznam.</div>
                        </div>
                        <button type="button" onClick={() => closeWarehouseItemDetail(item)} style={btnSecondary}>
                          Zpět na skladový seznam
                        </button>
                      </div>
                      <div style={resultTitle}>{item.name || item.gpc_id}</div>
                      {item.origin === "LOCAL" ? (
                        <div style={badgeWarning}>Lokální nevalidovaná položka</div>
                      ) : null}
                      <div style={meta}>
                        {item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}
                      </div>
                      <div style={meta}>
                        {item.origin === "LOCAL" ? `Interní kód: ${item.localFields?.internalCode || "neuveden"}` : `GPC ID: ${item.gpc_id || "bez vazby"}`} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                      </div>
                      {item.origin === "LOCAL" ? (
                        <div style={meta}>
                          Rozměr / poznámka: {item.localFields?.dimensionNote || "neuvedeno"} · Materiál: {item.localFields?.material || "neznámý"}
                        </div>
                      ) : null}
                      {item.validationStatus === "unvalidated" ? (
                        <div style={meta}>Validation: unvalidated · tenantOnly: ano</div>
                      ) : null}
                      <div style={meta}>
                        Zásoba: celkem {item.stockSummary?.total ?? 0} · dostupné {item.stockSummary?.available ?? 0} · rezervace {item.stockSummary?.reserved ?? 0} · výroba {item.stockSummary?.production ?? 0} · broušení {item.stockSummary?.sharpening ?? 0}
                      </div>
                      <div style={stateBreakdown}>
                        <span>Nový: {normalizeStockSummary(item.stockSummary).states.new}</span>
                        <span>Nový přebroušený: {normalizeStockSummary(item.stockSummary).states.resharpened_new}</span>
                        <span>Použitý: {normalizeStockSummary(item.stockSummary).states.used}</span>
                        <span>Na broušení: {normalizeStockSummary(item.stockSummary).states.sharpening}</span>
                        <span>Ve výrobě: {normalizeStockSummary(item.stockSummary).production}</span>
                      </div>
                      {activeReservations.length > 0 ? (
                        <div style={historyPanel}>
                          <div style={settingsTitle}>Rezervace</div>
                          {activeReservations.map((reservation) => (
                            <div key={reservation.id} style={historyItem}>
                              <div style={historyTitle}>
                                Zakázka {reservation.job} · {reservation.quantity} ks · {ISSUE_STATE_LABELS[reservation.state] || reservation.state}
                              </div>
                              <div style={meta}>
                                Rezervoval {reservation.reservedBy || "neuvedeno"} · platnost do {reservation.validUntil || "nenastaveno"}
                              </div>
                              {reservation.reason ? <div style={meta}>{reservation.reason}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div style={historyPanel}>
                        <div style={settingsTitle}>Nadnormativa</div>
                        <div style={meta}>
                          Nadnormativa {overstockOffer?.enabled ? getOverstockStatusLabel(overstockOffer.status) : "neaktivní"} · počet {overstockOffer?.quantity || 0} ks · cena {overstockOffer?.pricePerUnit || "nenastaveno"} {overstockOffer?.currency || ""}
                        </div>
                        <div style={overstockIsActive ? badgeWarning : meta}>
                          {overstockIsActive
                            ? `Aktivní nabídka: ${overstockOffer.quantity || 0} ks · výdej má prioritu a nabídka se může automaticky ponížit`
                            : "Nadnormativa teď nezasahuje do výdeje."}
                        </div>
                        <div style={meta}>Stav nabídky: {getOverstockStatusLabel(overstockOffer?.status || "draft")}</div>
                        {overstockAlert ? <div style={offerInfo}>{overstockAlert}</div> : null}
                      </div>
                      {item.stockSummary?.lastIntakeMetadata ? (
                        <div style={meta}>
                          Poslední příjem: {item.stockSummary.lastIntakeMetadata.documentTypeLabel || "doklad neuveden"} · {item.stockSummary.lastIntakeMetadata.receivedAt || "datum neuvedeno"} · provedl {item.stockSummary.lastIntakeMetadata.performedBy || "neuvedeno"}
                        </div>
                      ) : null}
                      {item.stockSummary?.lastReturnMetadata ? (
                        <div style={meta}>
                          Poslední návrat: {item.stockSummary.lastReturnMetadata.decisionLabel || "rozhodnutí neuvedeno"} · {item.stockSummary.lastReturnMetadata.returnedAt || "datum neuvedeno"} · provedl {item.stockSummary.lastReturnMetadata.performedBy || "neuvedeno"}
                        </div>
                      ) : null}
                      <div style={meta}>
                        Min: {item.tenantSettings?.min || "nenastaveno"} · Max: {item.tenantSettings?.max || "nenastaveno"} · Warning: {item.tenantSettings?.warning || "nenastaveno"}
                      </div>
                      <div style={meta}>
                        Dodavatel: {item.tenantSettings?.supplierName || "Gogrou"} · {item.tenantSettings?.supplierType || "Gogrou partner"} · Dodací násobek: {item.tenantSettings?.supplierPackQuantity || 1}
                      </div>
                      <div style={meta}>
                        Poznámka k broušení: {item.tenantSettings?.sharpen?.note || "nenastaveno"}
                      </div>
                      <div style={meta}>
                        Výkres / příloha: {item.tenantSettings?.drawingReference || "nenastaveno"} · Povlak: {item.tenantSettings?.coatingNote || "nenastaveno"}
                      </div>
                      <div style={meta}>
                        Lokální poznámka: {item.tenantSettings?.localNote || "nenastaveno"}
                      </div>
                      {item.tenantSettings?.blocked ? (
                        <div style={badgeWarning}>
                          Položka je blokovaná{item.tenantSettings?.blockReason ? ` · ${item.tenantSettings.blockReason}` : ""}
                        </div>
                      ) : null}
                      {item.lastPurchasePrice !== undefined && item.lastPurchasePrice !== null ? (
                        <div style={meta}>
                          Poslední pořizovací cena: {item.lastPurchasePrice} {item.lastPurchaseCurrency || "CZK"} · dodavatel {item.lastPurchaseSupplier || "neuveden"} · datum {item.lastPurchaseDate || "neuvedeno"}
                        </div>
                      ) : null}
                      <div style={offerInfo}>
                        Použitý nástroj může být stále použitelný pro méně náročné operace.
                      </div>
                      <div style={meta}>
                        DM tracking: {item.tenantSettings?.dmEnabled ? "zapnuto" : "vypnuto"} · Broušení: {item.tenantSettings?.sharpen?.enabled ? "zapnuto" : "vypnuto"} · Stav: {item.tenantSettings?.blocked ? "blokovaná" : "aktivní"}
                      </div>
                      <div style={itemActions}>
                        <button type="button" onClick={() => openItemSettings(item)} style={btnSecondary}>Nastavení položky</button>
                        <button type="button" onClick={() => openStockForm(item)} style={btnSecondary}>Naskladnit</button>
                        <button
                          type="button"
                          onClick={() => {
                            closeItemDetails(item);
                            openIssuePanel();
                            selectIssueItem(item);
                          }}
                          style={btnSecondary}
                        >
                          Výdej
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeItemDetails(item);
                            openReturnPanel();
                            selectReturnItem(item);
                          }}
                          style={btnSecondary}
                        >
                          Návrat z výroby
                        </button>
                        <button type="button" onClick={() => openReservationForm(item)} style={btnSecondary}>Rezervovat</button>
                        <button type="button" onClick={() => openOverstockForm(item)} style={btnSecondary}>Nadnormativa</button>
                        <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: detail</button>
                      </div>
                      {item.tenantSettings?.dmEnabled ? (
                        <div style={historyPanel}>
                          <div style={settingsTitle}>DM kusy</div>
                          {(item.dmItems || []).length === 0 ? (
                            <div style={muted}>Zatím nejsou vytvořené žádné DM kusy.</div>
                          ) : (
                            <div style={historyList}>
                              {(item.dmItems || []).map((dmItem) => (
                                <div key={dmItem.id || dmItem.dmCode} style={historyItem}>
                                  <div style={historyTitle}>{dmItem.dmCode}</div>
                                  <div style={meta}>
                                    Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)} · Umístění: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)}
                                  </div>
                                  <div style={meta}>
                                    D {dmItem.currentDiameter || "neuvedeno"} · L {dmItem.currentLength || "neuvedeno"} · přebroušení {dmItem.sharpeningCount ?? 0}/{dmItem.maxSharpeningCount ?? "nenastaveno"}
                                  </div>
                                  <div style={meta}>
                                    Blokace: {dmItem.status === "blocked" || dmItem.blockedReason ? "ano" : "ne"} · Rezervace: {dmItem.reservedForOrder || "ne"} · poslední servis: {dmItem.lastServiceAt || "neuvedeno"}
                                  </div>
                                  <button type="button" onClick={() => openDmDetail(item, dmItem)} style={btnSecondary}>Otevřít DM detail</button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={actions}>
                            <button type="button" onClick={() => openDmForm(item)} style={btnSecondary}>Vytvořit DM kusy</button>
                          </div>
                          {dmFormItemKey === getItemKey(item) ? (
                            <form onSubmit={createDmItems} style={settingsPanel}>
                              <div style={settingsTitle}>Vytvořit DM kusy</div>
                              <div style={formGrid}>
                                <label style={fieldLabel}>
                                  Počet kusů
                                  <input
                                    type="number"
                                    min="1"
                                    value={dmForm.quantity}
                                    onChange={(event) => updateDmForm("quantity", event.target.value)}
                                    style={input}
                                  />
                                </label>
                                <label style={fieldLabel}>
                                  Stav
                                  <select value={dmForm.status} onChange={(event) => updateDmForm("status", event.target.value)} style={input}>
                                    {DM_CREATE_STATUS_OPTIONS.map((status) => (
                                      <option key={status} value={status}>{labelFromMap(DM_STATUS_LABELS, status)}</option>
                                    ))}
                                  </select>
                                </label>
                                <label style={fieldLabel}>
                                  Výchozí průměr
                                  <input value={dmForm.currentDiameter} onChange={(event) => updateDmForm("currentDiameter", event.target.value)} style={input} />
                                </label>
                                <label style={fieldLabel}>
                                  Výchozí délka
                                  <input value={dmForm.currentLength} onChange={(event) => updateDmForm("currentLength", event.target.value)} style={input} />
                                </label>
                                <label style={fieldLabel}>
                                  Max počet přebroušení
                                  <input type="number" min="0" value={dmForm.maxSharpeningCount} onChange={(event) => updateDmForm("maxSharpeningCount", event.target.value)} style={input} />
                                </label>
                                <label style={fieldLabel}>
                                  Umístění
                                  <select value={dmForm.location} onChange={(event) => updateDmForm("location", event.target.value)} style={input}>
                                    <option value="main_warehouse">Hlavní sklad</option>
                                    <option value="production">Výroba</option>
                                    <option value="sharpening_collection">Sběr na broušení</option>
                                    <option value="unknown">Neznámé</option>
                                  </select>
                                </label>
                              </div>
                              {dmMessage ? <div style={dmMessage.includes("Vytvořeno") ? message : errorMessage}>{dmMessage}</div> : null}
                              <div style={actions}>
                                <button type="submit" style={btnImport}>Vytvořit DM kusy</button>
                                <button
                                  type="button"
                                  onClick={() => closeItemDetails(item)}
                                  style={btnSecondary}
                                >
                                  Zpět na detail položky
                                </button>
                              </div>
                            </form>
                          ) : null}
                        </div>
                      ) : null}
                      {stockItemKey === getItemKey(item) ? (
                        <form onSubmit={receiveStock} style={settingsPanel}>
                          <div style={settingsTitle}>Naskladnit položku</div>
                          <div style={muted}>
                            První skladový pohyb uloží počet kusů do konkrétního provozního stavu v GSS.
                          </div>

                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Počet kusů
                              <input
                                type="number"
                                min="1"
                                value={stockForm.quantity}
                                onChange={(event) => updateStockForm("quantity", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Stav naskladnění
                              <select
                                value={stockForm.condition}
                                onChange={(event) => updateStockForm("condition", event.target.value)}
                                style={input}
                              >
                                <option value="new">Nový</option>
                                <option value="resharpened_new">Nový přebroušený</option>
                                <option value="used">Použitý</option>
                                <option value="sharpening">Na broušení</option>
                              </select>
                            </label>
                            {(item.tenantSettings?.sharpen?.enabled || stockForm.condition === "sharpening") ? (
                              <>
                                <label style={fieldLabel}>
                                  Brusič
                                  <input
                                    value={stockForm.grinder}
                                    onChange={(event) => updateStockForm("grinder", event.target.value)}
                                    style={input}
                                  />
                                </label>
                                <label style={fieldLabel}>
                                  Provozní poznámka
                                  <input
                                    value={stockForm.note}
                                    onChange={(event) => updateStockForm("note", event.target.value)}
                                    placeholder="Dát do červené krabice"
                                    style={input}
                                  />
                                </label>
                              </>
                            ) : null}
                          </div>

                          <div style={settingsTitle}>Doklad / důvod příjmu</div>
                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Typ dokladu / důvod příjmu
                              <select
                                value={stockForm.documentType}
                                onChange={(event) => {
                                  const documentType = event.target.value;
                                  updateStockForm("documentType", documentType);
                                  if (documentType === "service_delivery_note_after_sharpening" && !stockForm.source.trim()) {
                                    updateStockForm("source", DEFAULT_GRINDER);
                                  }
                                }}
                                style={input}
                              >
                                <option value="supplier_delivery_note">Dodací list dodavatele</option>
                                <option value="supplier_invoice">Faktura dodavatele</option>
                                <option value="internal_receipt">Interní příjemka</option>
                                <option value="service_delivery_note_after_sharpening">Servisní dodací list po broušení</option>
                                <option value="production_return">Návrat z výroby</option>
                                <option value="manual_correction_inventory">Ruční korekce / inventura</option>
                              </select>
                            </label>
                            <label style={fieldLabel}>
                              Číslo dokladu
                              <input
                                value={stockForm.documentNumber}
                                onChange={(event) => updateStockForm("documentNumber", event.target.value)}
                                placeholder="volitelné pro MVP"
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Dodavatel / zdroj
                              <input
                                value={stockForm.source}
                                onChange={(event) => updateStockForm("source", event.target.value)}
                                placeholder="např. Gogrou, M-technologies, SANDVIK"
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Pořizovací cena za kus
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={stockForm.purchasePricePerUnit}
                                onChange={(event) => updateStockForm("purchasePricePerUnit", event.target.value)}
                                placeholder="volitelné"
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Měna
                              <input
                                value={stockForm.purchaseCurrency}
                                onChange={(event) => updateStockForm("purchaseCurrency", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Datum příjmu
                              <input
                                type="date"
                                value={stockForm.receivedAt}
                                onChange={(event) => updateStockForm("receivedAt", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Provedl
                              <input
                                value={stockForm.performedBy}
                                onChange={(event) => updateStockForm("performedBy", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Poznámka k příjmu
                              <textarea
                                value={stockForm.intakeNote}
                                onChange={(event) => updateStockForm("intakeNote", event.target.value)}
                                style={textarea}
                              />
                            </label>
                          </div>
                          <div style={offerInfo}>
                            Provedl bude později přihlášená osoba, výdejní automat, ERP nebo integrační zdroj.
                          </div>
                          {stockForm.purchasePricePerUnit.trim() && Number.isFinite(Number(stockForm.purchasePricePerUnit)) && Number(stockForm.purchasePricePerUnit) >= 0 && Number(stockForm.quantity) > 0 ? (
                            <div style={offerInfo}>
                              Celková hodnota příjmu: {Number(stockForm.purchasePricePerUnit) * Number(stockForm.quantity)} {stockForm.purchaseCurrency || "CZK"}.
                            </div>
                          ) : null}

                          {stockForm.condition === "sharpening" ? (
                            <div style={offerInfo}>
                              Stav Na broušení navyšuje `sharpening`, ale nezvyšuje dostupné kusy pro běžný výdej.
                            </div>
                          ) : (
                            <div style={offerInfo}>
                              Stav {STOCK_CONDITION_LABELS[stockForm.condition]} navyšuje dostupné kusy.
                            </div>
                          )}

                          {stockMessage ? <div style={stockMessage.includes("kladný") || stockMessage.includes("platnou") ? errorMessage : message}>{stockMessage}</div> : null}

                          <div style={actions}>
                            <button type="submit" style={btnImport}>Uložit naskladnění</button>
                            <button
                              type="button"
                              onClick={() => closeItemDetails(item)}
                              style={btnSecondary}
                            >
                              Zpět na detail položky
                            </button>
                          </div>
                        </form>
                      ) : null}
                      {reservationItemKey === getItemKey(item) ? (
                        <form onSubmit={reserveStock} style={settingsPanel}>
                          <div style={settingsTitle}>Rezervovat nástroj pro zakázku</div>
                          <div style={muted}>
                            Rezervace sníží dostupné množství a zablokuje kusy pro konkrétní zakázku.
                          </div>
                          {item.tenantSettings?.dmEnabled ? (
                            <div style={offerInfo}>
                              Při DM trackingu bude možné rezervovat konkrétní kus.
                            </div>
                          ) : null}

                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Zakázka
                              <input
                                value={reservationForm.job}
                                onChange={(event) => updateReservationForm("job", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Počet kusů
                              <input
                                type="number"
                                min="1"
                                value={reservationForm.quantity}
                                onChange={(event) => updateReservationForm("quantity", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Stav rezervovaného nástroje
                              <select
                                value={reservationForm.state}
                                onChange={(event) => updateReservationForm("state", event.target.value)}
                                style={input}
                              >
                                <option value="new">Nový</option>
                                <option value="resharpened_new">Nový přebroušený</option>
                                <option value="used">Použitý</option>
                              </select>
                            </label>
                            <label style={fieldLabel}>
                              Rezervoval
                              <input
                                value={reservationForm.reservedBy}
                                onChange={(event) => updateReservationForm("reservedBy", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Datum rezervace
                              <input
                                type="date"
                                value={reservationForm.reservedAt}
                                onChange={(event) => updateReservationForm("reservedAt", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Platnost rezervace do
                              <input
                                type="date"
                                value={reservationForm.validUntil}
                                onChange={(event) => updateReservationForm("validUntil", event.target.value)}
                                style={input}
                              />
                            </label>
                          </div>
                          <label style={fieldLabel}>
                            Důvod rezervace
                            <textarea
                              value={reservationForm.reason}
                              onChange={(event) => updateReservationForm("reason", event.target.value)}
                              style={textarea}
                            />
                          </label>

                          <div style={offerInfo}>
                            Rezervovaný nástroj nelze běžně vydat. Výdej rezervovaných nástrojů půjde později přes samostatný tok podle zakázky.
                          </div>
                          <div style={actions}>
                            <button type="button" onClick={() => setReservationMessage("Tato funkce bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: rezervované nástroje</button>
                            <button type="button" onClick={() => setReservationMessage("Tato funkce bude doplněna v další fázi.")} style={btnSecondary}>Připravuje se: zrušit rezervaci</button>
                          </div>

                          {reservationMessage ? <div style={reservationMessage.includes("vytvořena") ? message : errorMessage}>{reservationMessage}</div> : null}

                          <div style={actions}>
                            <button type="submit" style={btnImport}>Uložit rezervaci</button>
                            <button
                              type="button"
                              onClick={() => closeItemDetails(item)}
                              style={btnSecondary}
                            >
                              Zpět na detail položky
                            </button>
                          </div>
                        </form>
                      ) : null}
                      {overstockItemKey === getItemKey(item) ? (
                        <form onSubmit={saveOverstockOffer} style={settingsPanel}>
                          <div style={settingsTitle}>Nadnormativa</div>
                          <div style={muted}>
                            MVP nadnormativa pracuje pouze s volnými novými kusy. Jde o nabídku přebytku, ne tvrdou rezervaci; výroba má prioritu.
                          </div>
                          <div style={checkRow}>
                            <label style={checkLabel}>
                              <input
                                type="checkbox"
                                checked={overstockForm.enabled}
                                onChange={(event) => updateOverstockForm("enabled", event.target.checked)}
                              />
                              Nadnormativa aktivní
                            </label>
                          </div>
                          {overstockForm.enabled ? (
                            <>
                              <div style={formGrid}>
                                <label style={fieldLabel}>
                                  Počet kusů k nabídnutí
                                  <input
                                    type="number"
                                    min="1"
                                    value={overstockForm.quantity}
                                    onChange={(event) => updateOverstockForm("quantity", event.target.value)}
                                    style={input}
                                  />
                                </label>
                                <label style={fieldLabel}>
                                  Pevná cena za kus
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={overstockForm.pricePerUnit}
                                    onChange={(event) => updateOverstockForm("pricePerUnit", event.target.value)}
                                    style={input}
                                  />
                                </label>
                                <label style={fieldLabel}>
                                  Měna
                                  <input
                                    value={overstockForm.currency}
                                    onChange={(event) => updateOverstockForm("currency", event.target.value)}
                                    style={input}
                                  />
                                </label>
                                <label style={fieldLabel}>
                                  Stav nabídky
                                  <select
                                    value={overstockForm.status}
                                    onChange={(event) => updateOverstockForm("status", event.target.value)}
                                    style={input}
                                  >
                                    <option value="draft">rozpracovaná nabídka</option>
                                    <option value="active">aktivní nabídka</option>
                                    <option value="paused">pozastavená nabídka</option>
                                    <option value="sold">prodaná nabídka</option>
                                    <option value="cancelled">zrušená nabídka</option>
                                  </select>
                                </label>
                              </div>
                              <label style={fieldLabel}>
                                Poznámka k nabídce
                                <textarea
                                  value={overstockForm.note}
                                  onChange={(event) => updateOverstockForm("note", event.target.value)}
                                  style={textarea}
                                />
                              </label>
                              <div style={offerInfo}>
                                Volné nové kusy: {normalizeStockSummary(item.stockSummary).states.new + (Number(item.overstockReserved) || 0)} ks.
                              </div>
                              <div style={overstockForm.enabled && overstockForm.status === "active" ? badgeWarning : offerInfo}>
                                {overstockForm.enabled && overstockForm.status === "active"
                                  ? "Aktivní nabídka eviduje nabízené množství. Pokud výdej zasáhne do nových kusů, nabídka se automaticky poníží."
                                  : "Tento stav výdej neblokuje."}
                              </div>
                            </>
                          ) : null}

                          {overstockMessage ? <div style={overstockMessage.includes("uložena") ? message : errorMessage}>{overstockMessage}</div> : null}

                          <div style={actions}>
                            <button type="submit" style={btnImport}>Uložit nadnormativu</button>
                            <button
                              type="button"
                              onClick={() => closeItemDetails(item)}
                              style={btnSecondary}
                            >
                              Zpět na detail položky
                            </button>
                          </div>
                        </form>
                      ) : null}
                      {settingsItemKey === getItemKey(item) && settingsForm ? (
                        <form onSubmit={saveItemSettings} style={settingsPanel}>
                          <div style={settingsTitle}>Tenant nastavení položky</div>
                          <div style={muted}>
                            Tato nastavení patří do GSS a nemění GPC master data.
                          </div>

                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Minimální zásoba
                              <input
                                type="number"
                                min="0"
                                value={settingsForm.min}
                                onChange={(event) => updateSettingsForm("min", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Maximální zásoba
                              <input
                                type="number"
                                min="0"
                                value={settingsForm.max}
                                onChange={(event) => updateSettingsForm("max", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Warning hranice
                              <input
                                type="number"
                                min="0"
                                value={settingsForm.warning}
                                onChange={(event) => updateSettingsForm("warning", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Dodací násobek
                              <input
                                type="number"
                                min="1"
                                value={settingsForm.supplierPackQuantity}
                                onChange={(event) => updateSettingsForm("supplierPackQuantity", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Max počet přebroušení
                              <input
                                type="number"
                                min="0"
                                value={settingsForm.sharpenCycles}
                                onChange={(event) => updateSettingsForm("sharpenCycles", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Dodavatel položky
                              <input
                                value={settingsForm.supplierName}
                                onChange={(event) => updateSettingsForm("supplierName", event.target.value)}
                                placeholder="např. SANDVIK, WALTER, SECO, MTTM"
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Typ dodavatele
                              <select
                                value={settingsForm.supplierType}
                                onChange={(event) => updateSettingsForm("supplierType", event.target.value)}
                                style={input}
                              >
                                <option value="Gogrou partner">Gogrou partner</option>
                                <option value="Standard supplier">Standardní dodavatel</option>
                                <option value="Internal supplier">Interní dodavatel</option>
                              </select>
                            </label>
                          </div>

                          <div style={checkRow}>
                            <label style={checkLabel}>
                              <input
                                type="checkbox"
                                checked={settingsForm.dmEnabled}
                                onChange={(event) => updateSettingsForm("dmEnabled", event.target.checked)}
                              />
                              DM tracking zapnuto
                            </label>
                            <label style={checkLabel}>
                              <input
                                type="checkbox"
                                checked={settingsForm.sharpenEnabled}
                                onChange={(event) => updateSettingsForm("sharpenEnabled", event.target.checked)}
                              />
                              Brousitelná
                            </label>
                            <label style={checkLabel}>
                              <input
                                type="checkbox"
                                checked={settingsForm.blocked}
                                onChange={(event) => updateSettingsForm("blocked", event.target.checked)}
                              />
                              Položka blokovaná
                            </label>
                          </div>

                          <div style={offerInfo}>
                            Při zapnutém DM trackingu se budou sledovat jednotlivé kusy.
                          </div>

                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Poznámka k broušení
                              <textarea
                                value={settingsForm.sharpenNote}
                                onChange={(event) => updateSettingsForm("sharpenNote", event.target.value)}
                                style={textarea}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Výkres / odkaz na přílohu
                              <textarea
                                value={settingsForm.drawingReference}
                                onChange={(event) => updateSettingsForm("drawingReference", event.target.value)}
                                placeholder="budoucí příloha nebo odkaz"
                                style={textarea}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Povlak / poznámka k povlaku
                              <textarea
                                value={settingsForm.coatingNote}
                                onChange={(event) => updateSettingsForm("coatingNote", event.target.value)}
                                placeholder="budoucí samostatné pole podle operace"
                                style={textarea}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Důvod blokace
                              <textarea
                                value={settingsForm.blockReason}
                                onChange={(event) => updateSettingsForm("blockReason", event.target.value)}
                                style={textarea}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Lokální poznámka zákazníka
                              <textarea
                                value={settingsForm.localNote}
                                onChange={(event) => updateSettingsForm("localNote", event.target.value)}
                                style={textarea}
                              />
                            </label>
                          </div>

                          {settingsMessage ? <div style={message}>{settingsMessage}</div> : null}

                          <div style={actions}>
                            <button type="submit" style={btnImport}>Uložit nastavení</button>
                            <button
                              type="button"
                              onClick={() => closeItemDetails(item)}
                              style={btnSecondary}
                            >
                              Zpět na detail položky
                            </button>
                          </div>
                        </form>
                      ) : null}
                      <div style={historyPanel}>
                        <div style={settingsTitle}>Historie pohybů</div>
                        {item.movementHistory?.length ? (
                          <div style={historyList}>
                            {item.movementHistory.slice(0, 10).map((movement) => (
                              <div key={movement.id} style={historyItem}>
                                <div style={historyTitle}>
                                  {labelFromMap(MOVEMENT_TYPE_LABELS, movement.type)} · {movement.quantity} ks · {getMovementStateLabel(movement.state)}
                                </div>
                                <div style={meta}>
                                  {formatMovementDate(movement.createdAt)} · provedl {movement.performedBy || "neuvedeno"}
                                </div>
                                {movement.note ? <div style={meta}>{movement.note}</div> : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={muted}>Zatím bez skladových pohybů.</div>
                        )}
                      </div>
                    </div>
                    <div style={stockSummary}>
                      <div>Celkem: {normalizeStockSummary(item.stockSummary).total}</div>
                      <div>Dostupné: {normalizeStockSummary(item.stockSummary).available}</div>
                      <div>Rezervace: {normalizeStockSummary(item.stockSummary).reserved}</div>
                      <div>Výroba: {normalizeStockSummary(item.stockSummary).production}</div>
                      <div>Broušení: {normalizeStockSummary(item.stockSummary).sharpening}</div>
                      <div>Ještě ve firmě: {normalizeStockSummary(item.stockSummary).sharpeningBreakdown.in_company}</div>
                      <div>V brusírně: {normalizeStockSummary(item.stockSummary).sharpeningBreakdown.at_grinder}</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {activeMainPanel === "movements" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Poslední skladové pohyby</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            {movementHistory.length > 0 ? (
              <div style={historyList}>
                {movementHistory.slice(0, 20).map((movement) => (
                  <div key={movement.id} style={historyItem}>
                    <div style={historyTitle}>
                      {labelFromMap(MOVEMENT_TYPE_LABELS, movement.type)} · {movement.itemName || "Položka"} · {movement.quantity} ks
                    </div>
                    <div style={meta}>
                      Stav: {getMovementStateLabel(movement.state)} · {formatMovementDate(movement.createdAt)} · provedl {movement.performedBy || "neuvedeno"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={muted}>Zatím nejsou evidované žádné skladové pohyby.</div>
            )}
          </div>
          ) : null}

          {activeMainPanel === "overstock" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Nadnormativní zásoby</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            <div style={muted}>
              Zde bude možné označit skladové položky jako nadnormativní a nabídnout je ostatním firmám.
            </div>
            <div style={offerInfo}>
              V aktuálním MVP nadnormativa neblokuje výrobu. Pokud výdej zasáhne do aktivní nabídky, nabízené množství se automaticky poníží.
            </div>
            <div style={hintBox}>
              Budoucí upozornění odpovědné osobě: sklad se blíží množství nabízenému jako nadnormativa.
            </div>
            <div style={actions}>
              <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: na položku</button>
              <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: ignorovat</button>
              <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: hlásit znovu po dalším pohybu</button>
            </div>
            {dmItemCount > 0 ? (
              <div style={offerInfo}>
                V budoucnu bude možné rezervovat konkrétní DM kusy.
              </div>
            ) : null}
            <div style={actions}>
              <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: připravit nabídku</button>
            </div>
          </div>
          ) : null}

          {activeMainPanel === "local" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Lokální nevalidované položky</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
            </div>
            <div style={hintBox}>
              Lokální položky slouží pro rychlé zavedení položek, které ještě nejsou validované v GPC.
            </div>
            <div style={muted}>
              Lokální položka existuje pouze v tenant GSS, nemění GPC a funguje okamžitě pro provoz firmy.
            </div>
            <div style={offerInfo}>
              Později bude možné odeslat položku k validaci, propojit ji s GPC a doplnit technická data a výrobce.
            </div>
            <div style={actions}>
              <button type="button" onClick={openLocalItemForm} style={btnPrimary}>Přidat lokální položku</button>
            </div>

            {showLocalItemForm ? (
              <form ref={localItemSectionRef} onSubmit={addLocalItemToGss} style={formBox}>
                <div style={formGrid}>
                  <label style={fieldLabel}>
                    Název položky
                    <input
                      value={localItemForm.name}
                      onChange={(event) => updateLocalItemForm("name", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Výrobce
                    <input
                      value={localItemForm.manufacturer}
                      onChange={(event) => updateLocalItemForm("manufacturer", event.target.value)}
                      placeholder="neznámý, pokud není známý"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Typ položky
                    <select
                      value={localItemForm.type}
                      onChange={(event) => updateLocalItemForm("type", event.target.value)}
                      style={input}
                    >
                      <option value="">Vyberte typ</option>
                      <option value="Vrták">Vrták</option>
                      <option value="Fréza">Fréza</option>
                      <option value="Břitová destička">Břitová destička</option>
                      <option value="Ostatní">Ostatní</option>
                    </select>
                  </label>
                  <label style={fieldLabel}>
                    GTIN volitelné
                    <input
                      value={localItemForm.gtin}
                      onChange={(event) => updateLocalItemForm("gtin", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Interní kód zákazníka
                    <input
                      value={localItemForm.internalCode}
                      onChange={(event) => updateLocalItemForm("internalCode", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Rozměr / poznámka
                    <input
                      value={localItemForm.dimensionNote}
                      onChange={(event) => updateLocalItemForm("dimensionNote", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Průměr
                    <input
                      value={localItemForm.diameter}
                      onChange={(event) => updateLocalItemForm("diameter", event.target.value)}
                      placeholder="povinné pro vrták / frézu"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Délka
                    <input
                      value={localItemForm.length}
                      onChange={(event) => updateLocalItemForm("length", event.target.value)}
                      placeholder="nebo poznámka k rozměru"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Materiál
                    <input
                      value={localItemForm.material}
                      onChange={(event) => updateLocalItemForm("material", event.target.value)}
                      placeholder="neznámý, pokud není známý"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Tvar / typ destičky
                    <input
                      value={localItemForm.insertShape}
                      onChange={(event) => updateLocalItemForm("insertShape", event.target.value)}
                      placeholder="povinné pro břitovou destičku"
                      style={input}
                    />
                  </label>
                </div>

                <div style={checkRow}>
                  <label style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={localItemForm.dmEnabled}
                      onChange={(event) => updateLocalItemForm("dmEnabled", event.target.checked)}
                    />
                    DM tracking
                  </label>
                  <label style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={localItemForm.sharpenEnabled}
                      onChange={(event) => updateLocalItemForm("sharpenEnabled", event.target.checked)}
                    />
                    Brousitelná
                  </label>
                </div>

                <div style={muted}>
                  Povinně: název, typ, výrobce nebo neznámý a alespoň jeden identifikátor: GTIN, interní kód nebo rozměr / poznámka.
                </div>
                {localItemMessage ? <div style={localItemMessage.includes("nutné") ? errorMessage : message}>{localItemMessage}</div> : null}

                <div style={actions}>
                  <button type="submit" style={btnImport}>Vytvořit lokální položku</button>
                  <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na akce</button>
                </div>
              </form>
            ) : localItemMessage ? (
              <div style={message}>{localItemMessage}</div>
            ) : null}
          </div>
          ) : null}

          <div style={box}>
            <h2 style={subtitle}>Doporučené další kroky</h2>
            <div style={steps}>
              <div>Převzít první položku z GPC</div>
              <div>Nastavit min/max</div>
              <div>Aktivovat DM tracking</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  padding: 32,
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 8,
};

const lead = {
  maxWidth: 860,
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.7,
  marginBottom: 24,
};

const box = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const highlightedBox = {
  ...box,
  border: "1px solid rgba(34,197,94,0.65)",
  background: "rgba(34,197,94,0.08)",
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const summaryItem = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
};

const summaryLabel = {
  fontSize: 11,
  opacity: 0.55,
  marginBottom: 4,
};

const summaryValue = {
  fontSize: 15,
  fontWeight: 900,
};

const input = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
  marginTop: 12,
};

const textarea = {
  ...input,
  minHeight: 72,
  resize: "vertical",
};

const meta = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.62,
};

const message = {
  marginTop: 10,
  fontSize: 13,
  border: "1px solid rgba(34,197,94,0.35)",
  borderRadius: 8,
  padding: "9px 10px",
  background: "rgba(34,197,94,0.1)",
  color: "#d1fae5",
};

const errorMessage = {
  marginTop: 10,
  fontSize: 13,
  border: "1px solid rgba(239,68,68,0.45)",
  borderRadius: 8,
  padding: "9px 10px",
  background: "rgba(239,68,68,0.12)",
  color: "#fecaca",
};

const resultList = {
  display: "grid",
  gap: 10,
  marginTop: 12,
};

const resultItem = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
};

const highlightedResultItem = {
  ...resultItem,
  border: "1px solid rgba(34,197,94,0.55)",
  background: "rgba(34,197,94,0.08)",
};

const warehouseRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
};

const warehouseRowMain = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1.4fr) minmax(220px, 1fr) minmax(220px, 1fr)",
  gap: 10,
  alignItems: "center",
  background: "transparent",
  border: 0,
  color: "#fff",
  padding: 0,
  textAlign: "left",
  cursor: "pointer",
};

const warehouseRowNumbers = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  fontSize: 12,
  color: "rgba(255,255,255,0.76)",
};

const detailHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const resultTitle = {
  fontSize: 15,
  fontWeight: 900,
};

const stockSummary = {
  minWidth: 150,
  fontSize: 12,
  lineHeight: 1.5,
  opacity: 0.72,
};

const itemActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const stateBreakdown = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
  fontSize: 12,
  color: "rgba(255,255,255,0.78)",
};

const formBox = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: 12,
  marginTop: 14,
};

const settingsPanel = {
  ...formBox,
  border: "1px solid rgba(59,130,246,0.28)",
  background: "rgba(59,130,246,0.06)",
};

const settingsTitle = {
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 8,
};

const dmHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  marginBottom: 12,
};

const historyPanel = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
  marginTop: 12,
};

const historyList = {
  display: "grid",
  gap: 8,
};

const historyItem = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: 9,
  background: "rgba(255,255,255,0.03)",
};

const historyTitle = {
  fontSize: 13,
  fontWeight: 900,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const fieldLabel = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 800,
  color: "rgba(255,255,255,0.82)",
};

const checkRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
  marginBottom: 12,
};

const checkLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 800,
};

const actions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 14,
};

const btnPrimary = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};

const btnSecondary = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
};

const btnImport = {
  display: "inline-flex",
  padding: "11px 16px",
  borderRadius: 8,
  background: "rgba(34,197,94,0.24)",
  border: "1px solid rgba(34,197,94,0.65)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const btnDisabled = {
  display: "inline-flex",
  padding: "11px 16px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.5)",
  fontWeight: 900,
  cursor: "not-allowed",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const badgeWarning = {
  display: "inline-flex",
  marginTop: 6,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(245,158,11,0.45)",
  background: "rgba(245,158,11,0.12)",
  color: "#fde68a",
  fontSize: 11,
  fontWeight: 900,
};

const steps = {
  display: "grid",
  gap: 8,
  fontSize: 14,
  opacity: 0.78,
};

const offerInfo = {
  marginTop: 8,
  fontSize: 13,
  opacity: 0.68,
};

const hintBox = {
  border: "1px solid rgba(59,130,246,0.4)",
  borderRadius: 8,
  padding: "10px 12px",
  background: "rgba(59,130,246,0.12)",
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 10,
};

const muted = {
  opacity: 0.65,
};

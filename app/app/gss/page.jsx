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

const getPurchaseProposalStorageKey = (organizationId) => `gss_purchase_proposal_${organizationId}_MAIN`;

const readPurchaseProposal = (organizationId) => {
  if (!organizationId) {
    return null;
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(getPurchaseProposalStorageKey(organizationId)) || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writePurchaseProposal = (organizationId, proposal) => {
  if (!organizationId) {
    return;
  }

  if (!proposal) {
    localStorage.removeItem(getPurchaseProposalStorageKey(organizationId));
    return;
  }

  localStorage.setItem(getPurchaseProposalStorageKey(organizationId), JSON.stringify(proposal));
};

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

  const source = raw.split(/[;,\s]+/);

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
const DM_ISSUE_AVAILABLE_STATUSES = ["new", "resharpened_new", "used"];
const DM_MARKING_STATUS_LABELS = {
  unmarked: "DM vytvořen, fyzicky neznačeno",
  marked: "DM fyzicky označen",
};

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

const createSharpeningDispatchForm = (dmItem = {}) => ({
  servicePartner: dmItem.sharpeningDispatchMetadata?.servicePartner || DEFAULT_GRINDER,
  collectionBox: dmItem.sharpeningDispatchMetadata?.collectionBox || "",
  note: dmItem.sharpeningDispatchMetadata?.note || "",
  dispatchedAt: dmItem.sharpeningDispatchMetadata?.dispatchedAt || getTodayDate(),
  performedBy: dmItem.sharpeningDispatchMetadata?.performedBy || DEFAULT_INTAKE_OPERATOR,
});

const getDmCurrentDimensionsForLabel = (dmItem = {}) => ({
  diameter: dmItem.currentDiameter || dmItem.lastServiceMetadata?.currentDiameter || "",
  length: dmItem.currentLength || dmItem.lastServiceMetadata?.currentLength || "",
  overallLength: dmItem.currentOverallLength || dmItem.lastServiceMetadata?.currentOverallLength || dmItem.overallLength || "",
});

const formatLabelDimension = (value) => value || "neuvedeno";

const createServiceTerminalForm = (dmItem = {}) => {
  const dimensions = getDmCurrentDimensionsForLabel(dmItem);

  return {
    currentDiameter: dimensions.diameter,
    currentLength: dimensions.length,
    currentOverallLength: dimensions.overallLength,
    additionalParameters: dmItem.lastServiceMetadata?.additionalParameters || "",
    serviceNote: dmItem.serviceNote || dmItem.lastServiceMetadata?.serviceNote || "",
    performedBy: DEFAULT_GRINDER,
    serviceDate: getTodayDate(),
  };
};

const createSharpeningReturnForm = () => ({
  dmQuery: "",
  receivedAt: getTodayDate(),
  performedBy: DEFAULT_INTAKE_OPERATOR,
  note: "",
  location: "main_warehouse",
  confirmWithoutService: false,
});

const createStockForm = () => ({
  receiptSourceType: "manual",
  quantity: "",
  condition: "new",
  grinder: DEFAULT_GRINDER,
  note: "",
  purchasePricePerUnit: "",
  purchaseCurrency: "CZK",
  documentType: "supplier_delivery_note",
  documentNumber: "",
  sourceDocumentNumber: "",
  purchaseProposalId: "",
  orderProposalId: "",
  externalOrderNumber: "",
  systemOrderNumber: "",
  systemOrderSupplier: "",
  systemOrderPurchaseChannel: "",
  systemOrderManufacturer: "",
  systemOrderOrderedQuantity: "",
  systemOrderReceivedQuantity: "",
  systemOrderRemainingQuantity: "",
  source: "",
  receivedAt: getTodayDate(),
  performedBy: DEFAULT_INTAKE_OPERATOR,
  intakeNote: "",
});

const createReservationForm = () => ({
  job: "",
  machine: "",
  reservedFor: "",
  quantity: "",
  state: "resharpened_new",
  dmQuery: "",
  reason: "",
  reservedBy: DEFAULT_INTAKE_OPERATOR,
  reservedAt: getTodayDate(),
  validUntil: "",
});

const generateReleaseCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
};

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
  dmQuery: "",
  costCenter: "",
  machine: "",
  job: "",
  note: "",
  releaseCode: "",
  overrideReason: "",
});

const createReturnForm = () => ({
  quantity: "",
  dmQuery: "",
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
    (item.dmItems || []).map((dmItem) => [
      dmItem.dmCode,
      dmItem.quickId,
      dmItem.status,
      dmItem.location,
      dmItem.currentDiameter,
      dmItem.currentLength,
      dmItem.currentOverallLength,
    ]),
    stock.lastIntakeMetadata?.documentNumber,
    stock.lastIntakeMetadata?.source,
  ].flatMap(flattenSearchValues).map(normalizeSearch).join(" ");
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

const getDmStockSummary = (item) => {
  const stock = createEmptyStockSummary();

  (item.dmItems || []).forEach((dmItem) => {
    const status = dmItem.status || "new";
    const sentToGrindingShop = dmItem.sharpeningDispatchStatus === "sent" || dmItem.location === "grinding_shop";

    if (status !== "scrapped") {
      stock.total += 1;
    }

    if (status === "new") {
      stock.available += 1;
      stock.states.new += 1;
      return;
    }

    if (status === "resharpened_new") {
      stock.available += 1;
      stock.states.resharpened_new += 1;
      return;
    }

    if (status === "used") {
      stock.available += 1;
      stock.states.used += 1;
      return;
    }

    if (status === "reserved") {
      stock.reserved += 1;
      return;
    }

    if (status === "production") {
      stock.production += 1;
      return;
    }

    if (status === "sharpening") {
      stock.sharpening += 1;
      stock.states.sharpening += 1;
      if (sentToGrindingShop) {
        stock.sharpeningBreakdown.at_grinder += 1;
      } else {
        stock.sharpeningBreakdown.in_company += 1;
      }
      return;
    }

    if (status === "in_grinding_shop") {
      stock.sharpening += 1;
      stock.states.sharpening += 1;
      stock.sharpeningBreakdown.at_grinder += 1;
    }
  });

  return stock;
};

const getItemStockSummary = (item) =>
  item.tenantSettings?.dmEnabled ? getDmStockSummary(item) : normalizeStockSummary(item.stockSummary);

const getDmSummaryCounts = (item) => {
  const dmItems = item.dmItems || [];

  return {
    total: dmItems.filter((dmItem) => dmItem.status !== "scrapped").length,
    available: dmItems.filter((dmItem) => DM_ISSUE_AVAILABLE_STATUSES.includes(dmItem.status)).length,
    new: dmItems.filter((dmItem) => dmItem.status === "new").length,
    resharpened_new: dmItems.filter((dmItem) => dmItem.status === "resharpened_new").length,
    used: dmItems.filter((dmItem) => dmItem.status === "used").length,
    reserved: dmItems.filter((dmItem) => dmItem.status === "reserved").length,
    production: dmItems.filter((dmItem) => dmItem.status === "production").length,
    sharpening: dmItems.filter((dmItem) => dmItem.status === "sharpening" || dmItem.status === "in_grinding_shop").length,
    blocked: dmItems.filter((dmItem) => dmItem.status === "blocked" || dmItem.blockedReason).length,
    unmarked: dmItems.filter((dmItem) => (dmItem.markingStatus || "unmarked") === "unmarked").length,
  };
};

const getFilteredDmItems = (item, filter) => {
  const dmItems = item.dmItems || [];

  if (!filter || filter === "all") {
    return dmItems;
  }

  if (filter === "available") {
    return dmItems.filter((dmItem) => DM_ISSUE_AVAILABLE_STATUSES.includes(dmItem.status));
  }

  if (filter === "sharpening") {
    return dmItems.filter((dmItem) => dmItem.status === "sharpening" || dmItem.status === "in_grinding_shop");
  }

  if (filter === "blocked") {
    return dmItems.filter((dmItem) => dmItem.status === "blocked" || dmItem.blockedReason);
  }

  if (filter === "unmarked") {
    return dmItems.filter((dmItem) => (dmItem.markingStatus || "unmarked") === "unmarked");
  }

  return dmItems.filter((dmItem) => dmItem.status === filter);
};

const syncDmStockSummary = (item) =>
  item.tenantSettings?.dmEnabled
    ? {
        ...item,
        stockSummary: {
          ...normalizeStockSummary(item.stockSummary),
          ...getDmStockSummary(item),
        },
      }
    : item;

const getAllDmCodes = (items) => new Set(
  items.flatMap((item) => (item.dmItems || []).map((dmItem) => dmItem.dmCode))
);

const getAllQuickIds = (items) => new Set(
  items.flatMap((item) => (item.dmItems || []).map((dmItem) => dmItem.quickId).filter(Boolean))
);

const generateQuickId = (existingQuickIds) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let quickId = "";

  do {
    const letterPart = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const numberPart = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    quickId = `${letterPart} ${numberPart}`;
  } while (existingQuickIds.has(quickId));

  existingQuickIds.add(quickId);
  return quickId;
};

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

const createToolLabelText = (item, dmItem) => {
  const dimensions = getDmCurrentDimensionsForLabel(dmItem);

  return [
    `QID: ${dmItem.quickId || "není vygenerováno"}`,
    `Název: ${item.name || item.gpc_id || "Položka"}`,
    `Výrobce: ${item.manufacturer || "neuvedeno"}`,
    `Typ: ${item.type || item.category || "neuvedeno"}`,
    "",
    `D: ${formatLabelDimension(dimensions.diameter)} mm`,
    `L1: ${formatLabelDimension(dimensions.length)} mm`,
    `L2: ${formatLabelDimension(dimensions.overallLength)} mm`,
    "",
    `DM: ${dmItem.dmCode || "neuvedeno"}`,
    `Stav: ${labelFromMap(DM_STATUS_LABELS, dmItem.status)}`,
    "",
    `Servis: ${dmItem.lastServiceAt || "neuvedeno"}`,
    `Partner: ${dmItem.lastServiceMetadata?.performedBy || DEFAULT_GRINDER}`,
    dmItem.serviceNote ? `Poznámka: ${dmItem.serviceNote}` : "",
  ].filter(Boolean).join("\n");
};

const createDmLabelText = (item, dmItem) => createToolLabelText(item, dmItem);

const createServiceLabelText = (item, dmItem) => createToolLabelText(item, dmItem);

function ToolLabelPreview({ item, dmItem, source }) {
  const [copyMessage, setCopyMessage] = useState("");
  const dimensions = getDmCurrentDimensionsForLabel(dmItem);
  const labelText = createToolLabelText(item, dmItem);

  const copyLabelText = async () => {
    await navigator.clipboard.writeText(labelText);
    setCopyMessage("✓ Štítek zkopírován");
    window.setTimeout(() => setCopyMessage(""), 1800);
  };

  return (
    <div style={labelPanel}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .gss-print-label, .gss-print-label * {
            visibility: visible !important;
          }
          .gss-print-label {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 96mm !important;
            min-height: 58mm !important;
            margin: 0 !important;
            padding: 6mm !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }
          .gss-no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="gss-print-label" style={labelCard}>
        <div style={labelQid}>{dmItem.quickId || "QID není"}</div>
        <div style={labelItemName}>{item.name || item.gpc_id || "Položka"}</div>
        <div style={labelMetaLine}>{item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}</div>
        <div style={labelDimensions}>
          <div>D = {formatLabelDimension(dimensions.diameter)}</div>
          <div>L1 = {formatLabelDimension(dimensions.length)}</div>
          <div>L2 = {formatLabelDimension(dimensions.overallLength)}</div>
        </div>
        <div style={labelMetaLine}>Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)}</div>
        <div style={labelSmall}>DM: {dmItem.dmCode || "neuvedeno"}</div>
        <div style={labelSmall}>Servis: {dmItem.lastServiceAt || "neuvedeno"} · {dmItem.lastServiceMetadata?.performedBy || DEFAULT_GRINDER}</div>
        {dmItem.serviceNote ? <div style={labelSmall}>Poznámka: {dmItem.serviceNote}</div> : null}
        {source ? <div style={labelSmall}>Zdroj: {source}</div> : null}
      </div>
      <div className="gss-no-print" style={actions}>
        <button type="button" onClick={copyLabelText} style={btnSecondary}>Kopírovat štítek</button>
        {copyMessage ? <span style={message}>{copyMessage}</span> : null}
      </div>
    </div>
  );
}

const createDmMarkingText = (dmItem) => [
  `DM kód pro laser: ${dmItem.dmCode || "neuvedeno"}`,
  `QID pro štítek: ${dmItem.quickId || "není vygenerováno"}`,
].join("\n");

function ClearableSearchInput({ value, onChange, onClear, placeholder }) {
  const inputRef = useRef(null);

  const clearValue = () => {
    onClear();
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div style={searchInputWrap}>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={searchInput}
      />
      {value ? (
        <button type="button" onClick={clearValue} style={searchClearButton} aria-label="Vymazat hledání">
          X
        </button>
      ) : null}
    </div>
  );
}

const getGpcSourceForItem = (item) => {
  if (!item || item.origin !== "GPC") {
    return null;
  }

  return tools.find((tool) =>
    (item.gpc_id && tool.gpc_id === item.gpc_id) ||
    (item.gtin && tool.gtin === item.gtin)
  ) || null;
};

const getGpcTechnicalRows = (tool) => {
  if (!tool) {
    return [];
  }

  const rows = [];
  Object.entries(tool.geometry || {}).forEach(([key, value]) => rows.push([key, value]));
  Object.entries(tool.cutting || {}).forEach(([key, value]) => rows.push([key, value]));
  Object.entries(tool.tool_features || {}).forEach(([key, value]) => rows.push([key, value]));
  Object.entries(tool.tu?.geometry || {}).forEach(([key, param]) => rows.push([`${key} ${param.label || ""}`.trim(), `${param.value ?? "neuvedeno"}${param.unit ? ` ${param.unit}` : ""}`]));
  Object.entries(tool.tu?.features || {}).forEach(([key, param]) => rows.push([`${key} ${param.label || ""}`.trim(), `${param.value ?? "neuvedeno"}${param.unit ? ` ${param.unit}` : ""}`]));

  return rows;
};

function GpcDetailPanel({ item }) {
  const gpcSource = getGpcSourceForItem(item);
  const technicalRows = getGpcTechnicalRows(gpcSource);

  if (!item?.gpc_id) {
    return (
      <div style={gpcDetailPanel}>
        <div style={gpcDetailTitle}>GPC DETAIL</div>
        <div style={muted}>Tato položka je lokální nevalidovaná položka a zatím není propojena s GPC.</div>
      </div>
    );
  }

  return (
    <div style={gpcDetailPanel}>
      <div style={gpcDetailTitle}>GPC DETAIL</div>
      <div style={technicalGrid}>
        <div style={technicalRow}><span>GPC ID</span><strong>{item.gpc_id || "neuvedeno"}</strong></div>
        <div style={technicalRow}><span>GTIN</span><strong>{item.gtin || "neuvedeno"}</strong></div>
        <div style={technicalRow}><span>Výrobce</span><strong>{gpcSource?.manufacturer || item.manufacturer || "neuvedeno"}</strong></div>
        <div style={technicalRow}><span>Kategorie</span><strong>{gpcSource?.type || item.type || "neuvedeno"}</strong></div>
        <div style={technicalRow}><span>Typ položky</span><strong>{gpcSource?.type || item.type || "neuvedeno"}</strong></div>
        <div style={technicalRow}><span>Výkresy / přílohy</span><strong>{gpcSource?.image_drawing || item.tenantSettings?.drawingReference || "bude načteno z GPC / ToolsUnited"}</strong></div>
        <div style={technicalRow}><span>Budoucí ToolsUnited data</span><strong>{gpcSource?.toolsUnitedUrl || "bude doplněno v další fázi"}</strong></div>
        <div style={technicalRow}><span>Budoucí odkazy na výrobce</span><strong>{gpcSource?.manufacturerUrl || "bude doplněno v další fázi"}</strong></div>
      </div>
      <div style={settingsTitle}>Parametry z GPC</div>
      {technicalRows.length > 0 ? (
        <div style={technicalGrid}>
          {technicalRows.slice(0, 18).map(([label, value]) => (
            <div key={label} style={technicalRow}>
              <span>{label}</span>
              <strong>{String(value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div style={offerInfo}>GPC detail bude načten z GPC / ToolsUnited v další fázi.</div>
      )}
    </div>
  );
}

const createSharpeningDispatchText = (item, dmItem, form = {}) => [
  "Dodací podklad broušení",
  `Datum: ${form.dispatchedAt || dmItem.sharpeningDispatchMetadata?.dispatchedAt || getTodayDate()}`,
  `Zákazník: ${form.customerName || "neuvedeno"}`,
  `Brusírna: ${form.servicePartner || dmItem.sharpeningDispatchMetadata?.servicePartner || DEFAULT_GRINDER}`,
  `Box / bedýnka: ${form.collectionBox || dmItem.sharpeningDispatchMetadata?.collectionBox || "neuvedeno"}`,
  `Položka: ${item.name || item.gpc_id || "Položka"}`,
  `QID: ${dmItem.quickId || "není vygenerováno"}`,
  `DM: ${dmItem.dmCode || "neuvedeno"}`,
  `Pokyny k broušení: ${item.tenantSettings?.sharpen?.note || dmItem.serviceNote || "neuvedeno"}`,
  `Výkres / příloha: ${dmItem.drawingUrl || item.tenantSettings?.drawingReference || "neuvedeno"}`,
  `Povlak: ${dmItem.coating || item.tenantSettings?.coatingNote || "neuvedeno"}`,
  `Poznámka zákazníka: ${form.note || dmItem.sharpeningDispatchMetadata?.note || "neuvedeno"}`,
].join("\n");

function DmCurrentDimensions({ dmItem, compact = false }) {
  if (!dmItem) {
    return null;
  }

  const hasServiceDimensions = Boolean(dmItem.lastServiceMetadata);
  const boxStyle = hasServiceDimensions ? serviceDimensionBox : compactDimensionBox;
  const dimensions = getDmCurrentDimensionsForLabel(dmItem);

  return (
    <div style={boxStyle}>
      <div style={hasServiceDimensions ? serviceDimensionTitle : meta}>
        {hasServiceDimensions ? "Aktuální rozměry po broušení:" : "Aktuální rozměry:"}
      </div>
      <div style={compact ? dimensionInline : dimensionGrid}>
        <strong>D = {formatLabelDimension(dimensions.diameter)}</strong>
        <strong>L1 = {formatLabelDimension(dimensions.length)}</strong>
        <strong>L2 = {formatLabelDimension(dimensions.overallLength)}</strong>
      </div>
    </div>
  );
}

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

const findDmItemInWarehouseByCodeOrQuickId = (items, query) => {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return null;
  }

  for (const item of items) {
    const dmItem = (item.dmItems || []).find((candidate) =>
      normalizeSearch(candidate.dmCode) === normalizedQuery || normalizeSearch(candidate.quickId) === normalizedQuery
    );
    if (dmItem) {
      return { item, dmItem };
    }
  }

  return null;
};

const findDmItemInItemByCodeOrQuickId = (item, query) => {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return null;
  }

  return (item.dmItems || []).find((dmItem) =>
    normalizeSearch(dmItem.dmCode) === normalizedQuery || normalizeSearch(dmItem.quickId) === normalizedQuery
  ) || null;
};

const isDmItemAvailableForIssue = (dmItem) =>
  Boolean(dmItem) && DM_ISSUE_AVAILABLE_STATUSES.includes(dmItem.status) && !dmItem.blockedReason;

const parsePositiveNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const roundUpToPack = (quantity, packQuantity) => Math.ceil(quantity / packQuantity) * packQuantity;

const parseOrderQuantity = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getPurchaseStatus = (available, min) => {
  if (available === 0) {
    return "Kritický stav";
  }

  if (available < min) {
    return "Pod minimem";
  }

  return "OK";
};

const normalizePurchaseGroupValue = (value, fallback) => {
  const normalized = String(value || "").trim();
  return normalized || fallback;
};

const getPurchaseChannel = (item) => {
  const supplierType = String(item.tenantSettings?.supplierType || "").toLowerCase();
  const supplierName = String(item.tenantSettings?.supplierName || "").toLowerCase();

  if (supplierName.includes("mazak") || supplierType.includes("toolshop")) {
    return "MAZAK Toolshop";
  }

  if (supplierName.includes("m-technologies") || supplierName.includes("mtechnologies")) {
    return "M-technologies";
  }

  if (supplierType.includes("standard")) {
    return "vlastní dodavatel zákazníka";
  }

  if (supplierType.includes("internal")) {
    return "jiný dodavatel";
  }

  return "Gogrou";
};

const RECEIPT_SOURCE_LABELS = {
  manual: "Běžný příjem",
  gss_system_order: "Příjem ze systémové objednávky GSS",
  external_order_erp: "Příjem z externí objednávky / ERP",
  sharpening_return: "Příjem z broušení",
  inventory_correction: "Korekční příjem / inventura",
};

const OPEN_PURCHASE_PROPOSAL_STATUSES = new Set(["draft", "exported", "sent"]);

const createSystemOrderNumber = (proposal) => {
  const rawId = String(proposal?.systemOrderNumber || proposal?.orderNumber || proposal?.id || "").replace(/[^a-zA-Z0-9]/g, "");
  const suffix = rawId.slice(0, 8).toUpperCase() || "MVP";

  return `GSS-${suffix}`;
};

const getProposalSuggestedQuantity = (proposalItem) =>
  parseOrderQuantity(proposalItem?.suggestedQuantity, parseOrderQuantity(proposalItem?.recommendedQuantity, 0));

const getProposalOrderedQuantity = (proposalItem) => {
  const suggestedQuantity = getProposalSuggestedQuantity(proposalItem);

  if (proposalItem?.orderedQuantity !== undefined) {
    return parseOrderQuantity(proposalItem.orderedQuantity, suggestedQuantity);
  }

  if (proposalItem?.editedQuantity !== undefined) {
    return parseOrderQuantity(proposalItem.editedQuantity, suggestedQuantity);
  }

  return suggestedQuantity;
};

const normalizePurchaseProposalItem = (proposalItem) => {
  const suggestedQuantity = getProposalSuggestedQuantity(proposalItem);
  const orderedQuantity = getProposalOrderedQuantity(proposalItem);
  const receivedQuantity = parseOrderQuantity(proposalItem.receivedQuantity, 0);
  const remainingQuantity = Math.max(orderedQuantity - receivedQuantity, 0);

  return {
    ...proposalItem,
    suggestedQuantity,
    originalSuggestedQuantity: proposalItem.originalSuggestedQuantity ?? suggestedQuantity,
    orderedQuantity,
    editedQuantity: orderedQuantity,
    receivedQuantity,
    remainingQuantity,
    quantityAdjustedByUser: orderedQuantity !== suggestedQuantity,
    fulfillmentStatus: remainingQuantity <= 0 ? "fulfilled" : "open",
  };
};

const getOpenSystemOrdersForItem = (proposal, itemId) => {
  if (!proposal || !OPEN_PURCHASE_PROPOSAL_STATUSES.has(proposal.status) || !itemId) {
    return [];
  }

  return (proposal.items || [])
    .filter((proposalItem) => proposalItem.itemId === itemId && !proposalItem.excluded)
    .map((proposalItem) => {
      const suggestedQuantity = getProposalSuggestedQuantity(proposalItem);
      const orderedQuantity = getProposalOrderedQuantity(proposalItem);
      const receivedQuantity = parseOrderQuantity(proposalItem.receivedQuantity, 0);
      const remainingQuantity = proposalItem.remainingQuantity !== undefined
        ? parseOrderQuantity(proposalItem.remainingQuantity, Math.max(orderedQuantity - receivedQuantity, 0))
        : Math.max(orderedQuantity - receivedQuantity, 0);

      return {
        id: `${proposal.id}:${proposalItem.itemId}`,
        purchaseProposalId: proposal.id,
        orderProposalId: proposal.id,
        systemOrderNumber: createSystemOrderNumber(proposal),
        createdAt: proposal.createdAt,
        supplier: normalizePurchaseGroupValue(proposalItem.supplierName, "Gogrou"),
        manufacturer: normalizePurchaseGroupValue(proposalItem.manufacturer, "Neurčený výrobce"),
        suggestedQuantity,
        orderedQuantity,
        receivedQuantity,
        remainingQuantity,
        quantityAdjustedByUser: Boolean(proposalItem.quantityAdjustedByUser),
        purchaseChannel: normalizePurchaseGroupValue(proposalItem.purchaseChannel, "Gogrou"),
      };
    })
    .filter((order) => order.remainingQuantity > 0)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const createPurchaseGroupKey = ({ manufacturer, supplierName, purchaseChannel }) =>
  [
    normalizePurchaseGroupValue(manufacturer, "Neurčený výrobce"),
    normalizePurchaseGroupValue(supplierName, "Gogrou"),
    normalizePurchaseGroupValue(purchaseChannel, "Gogrou"),
  ].join("::");

const groupPurchaseProposalItems = (items) => {
  const groups = new Map();

  items.forEach((item) => {
    const groupKey = item.purchaseGroupKey || createPurchaseGroupKey(item);
    const existing = groups.get(groupKey) || {
      groupKey,
      manufacturer: normalizePurchaseGroupValue(item.manufacturer, "Neurčený výrobce"),
      supplierName: normalizePurchaseGroupValue(item.supplierName, "Gogrou"),
      purchaseChannel: normalizePurchaseGroupValue(item.purchaseChannel, "Gogrou"),
      items: [],
    };

    existing.items.push(item);
    groups.set(groupKey, existing);
  });

  return Array.from(groups.values());
};

const createPurchaseProposalItem = (item) => {
  const stock = getItemStockSummary(item);
  const min = parsePositiveNumber(item.tenantSettings?.min);
  const max = parsePositiveNumber(item.tenantSettings?.max);

  if (!min || !max || stock.available >= min) {
    return null;
  }

  const supplierPackQuantity = parsePositiveNumber(item.tenantSettings?.supplierPackQuantity, 1);
  const neededQuantity = Math.max(max - stock.available, 0);
  const recommendedQuantity = roundUpToPack(neededQuantity, supplierPackQuantity);
  const manufacturer = normalizePurchaseGroupValue(item.manufacturer, "Neurčený výrobce");
  const supplierName = normalizePurchaseGroupValue(item.tenantSettings?.supplierName, "Gogrou");
  const purchaseChannel = getPurchaseChannel(item);

  return {
    itemId: getItemKey(item),
    itemName: item.name || item.gpc_id || "Položka",
    gpc_id: item.gpc_id || "",
    gtin: item.gtin || "",
    manufacturer,
    supplierName,
    supplierType: item.tenantSettings?.supplierType || "Gogrou partner",
    purchaseChannel,
    purchaseGroupKey: createPurchaseGroupKey({ manufacturer, supplierName, purchaseChannel }),
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
  onGenerateQuickId,
  onMarkDmItem,
  onPrintLabel,
  onClose,
  onPlaceholder,
}) {
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const maxSharpeningCount = dmItem.maxSharpeningCount ?? item.tenantSettings?.sharpen?.cycles;
  const hasSharpeningLimit = maxSharpeningCount !== "" && maxSharpeningCount !== null && maxSharpeningCount !== undefined;
  const reachedSharpeningLimit = hasSharpeningLimit && Number(dmItem.sharpeningCount || 0) >= Number(maxSharpeningCount);
  const detailDimensions = getDmCurrentDimensionsForLabel(dmItem);
  const displayDiameter = formatLabelDimension(detailDimensions.diameter);
  const displayLength = formatLabelDimension(detailDimensions.length);
  const labelText = createDmLabelText(item, dmItem);
  const markingStatus = dmItem.markingStatus || "unmarked";
  const markingText = createDmMarkingText(dmItem);

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

      <div style={quickIdBox}>
        <div style={summaryLabel}>QID</div>
        <div style={quickIdValue}>QID: {dmItem.quickId || "není vygenerováno"}</div>
        {!dmItem.quickId ? (
          <button type="button" onClick={onGenerateQuickId} style={btnSecondary}>Vygenerovat QID</button>
        ) : null}
      </div>

      <div style={formBox}>
        <div style={settingsTitle}>Fyzické označení DM kusu</div>
        <div style={markingStatus === "marked" ? message : offerInfo}>
          {markingStatus === "marked"
            ? `DM fyzicky označen.${dmItem.markedAt ? ` Datum označení: ${dmItem.markedAt}` : ""}`
            : "DM vytvořen v systému, fyzické označení zatím neprovedeno."}
        </div>
        <textarea readOnly value={markingText} style={textarea} />
        {markingStatus !== "marked" ? (
          <div style={actions}>
            <button type="button" onClick={onMarkDmItem} style={btnImport}>Označit jako fyzicky označené</button>
          </div>
        ) : null}
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
      <DmCurrentDimensions dmItem={dmItem} />

      <div style={stateBreakdown}>
        <span>Povlak: {dmItem.coating || "neuvedeno"}</span>
        <span>Výkres: {dmItem.drawingUrl || "neuvedeno"}</span>
        <span>Rezervace: {dmItem.reservedForOrder || "ne"}</span>
        <span>Odeslání na broušení: {dmItem.sharpeningDispatchStatus || (dmItem.status === "sharpening" ? "waiting" : "ne")}</span>
        <span>Poslední servis: {dmItem.lastServiceAt || "neuvedeno"}</span>
        <span>Aktuální stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)}</span>
        <span>Aktuální lokace: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)}</span>
      </div>
      {dmItem.lastIssueMetadata ? (
        <div style={offerInfo}>
          Poslední výdej: {dmItem.lastIssueMetadata.issuedAt || "datum neuvedeno"} · zakázka {dmItem.lastIssueMetadata.job || "neuvedeno"} · stroj {dmItem.lastIssueMetadata.machine || "neuvedeno"} · středisko {dmItem.lastIssueMetadata.costCenter || "neuvedeno"}
        </div>
      ) : null}
      {dmItem.lastReturnMetadata ? (
        <div style={offerInfo}>
          Poslední návrat: {dmItem.lastReturnMetadata.returnedAt || "datum neuvedeno"} · {dmItem.lastReturnMetadata.decisionLabel || "rozhodnutí neuvedeno"} · provedl {dmItem.lastReturnMetadata.performedBy || "neuvedeno"} · poznámka {dmItem.lastReturnMetadata.note || "bez poznámky"}
        </div>
      ) : null}
      {dmItem.reservationMetadata ? (
        <div style={offerInfo}>
          Rezervace: zakázka {dmItem.reservationMetadata.job || "neuvedeno"} · stroj {dmItem.reservationMetadata.machine || "neuvedeno"} · pro {dmItem.reservationMetadata.reservedFor || "neuvedeno"} · Release Code {dmItem.reservationMetadata.releaseCode || "není"} · vytvořeno {dmItem.reservationMetadata.reservedAt || "neuvedeno"} · rezervoval {dmItem.reservationMetadata.reservedBy || "neuvedeno"} · platnost do {dmItem.reservationMetadata.validUntil || "nenastaveno"}
        </div>
      ) : null}
      {dmItem.sharpeningDispatchMetadata ? (
        <div style={offerInfo}>
          Broušení: odesláno {dmItem.sharpeningDispatchMetadata.dispatchedAt || "datum neuvedeno"} · brusírna {dmItem.sharpeningDispatchMetadata.servicePartner || "neuvedeno"} · místo {dmItem.sharpeningDispatchMetadata.collectionBox || "neuvedeno"} · provedl {dmItem.sharpeningDispatchMetadata.performedBy || "neuvedeno"}
        </div>
      ) : null}
      {dmItem.serviceNote ? <div style={offerInfo}>{dmItem.serviceNote}</div> : null}

      <div style={hintBox}>
        Zákazník po načtení DM okamžitě vidí aktuální hodnoty po ostření. GPC master data se nemění.
      </div>

      <div style={formBox}>
        <div style={settingsTitle}>Štítek nástroje</div>
        <div style={muted}>
          Print-friendly náhled pro ruční tisk, laser nebo dočasnou štítkovou šablonu. QID je největší prvek štítku.
        </div>
        <div style={actions}>
          <button type="button" onClick={() => setShowLabelPreview((current) => !current)} style={btnSecondary}>
            {showLabelPreview ? "Skrýt štítek" : "Zobrazit štítek"}
          </button>
          <button type="button" onClick={() => onPrintLabel("detail kusu")} style={btnImport}>Tisk štítku</button>
        </div>
        {showLabelPreview ? (
          <>
            <ToolLabelPreview item={item} dmItem={dmItem} source="detail kusu" />
            <textarea readOnly value={labelText} style={textarea} />
          </>
        ) : null}
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
  const [warehouseSortMode, setWarehouseSortMode] = useState("frequent");
  const [showItemHistory, setShowItemHistory] = useState(false);
  const [gpcDetailItemKey, setGpcDetailItemKey] = useState("");
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
  const [dmListFilter, setDmListFilter] = useState("");
  const [sharpeningDispatchTarget, setSharpeningDispatchTarget] = useState(null);
  const [sharpeningDispatchForm, setSharpeningDispatchForm] = useState(createSharpeningDispatchForm());
  const [sharpeningDispatchMessage, setSharpeningDispatchMessage] = useState("");
  const [serviceTerminalQuery, setServiceTerminalQuery] = useState("");
  const [serviceTerminalMessage, setServiceTerminalMessage] = useState("");
  const [serviceTerminalForm, setServiceTerminalForm] = useState(createServiceTerminalForm());
  const [showServiceLabelPreview, setShowServiceLabelPreview] = useState(false);
  const [sharpeningReturnForm, setSharpeningReturnForm] = useState(createSharpeningReturnForm());
  const [sharpeningReturnMessage, setSharpeningReturnMessage] = useState("");
  const [sharpeningReturnGroup, setSharpeningReturnGroup] = useState("");
  const [reservationItemKey, setReservationItemKey] = useState("");
  const [reservationForm, setReservationForm] = useState(createReservationForm());
  const [reservationMessage, setReservationMessage] = useState("");
  const [reservationDmGroup, setReservationDmGroup] = useState("");
  const [overstockItemKey, setOverstockItemKey] = useState("");
  const [overstockForm, setOverstockForm] = useState(createOverstockOfferForm());
  const [overstockMessage, setOverstockMessage] = useState("");
  const [purchaseProposal, setPurchaseProposal] = useState(null);
  const [purchaseDraftEdits, setPurchaseDraftEdits] = useState({});
  const [purchaseProposalMessage, setPurchaseProposalMessage] = useState("");
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const [activeMainPanel, setActiveMainPanel] = useState("");
  const [showIssuePanel, setShowIssuePanel] = useState(false);
  const [issueQuery, setIssueQuery] = useState("");
  const [issueItemKey, setIssueItemKey] = useState("");
  const [issueForm, setIssueForm] = useState(createIssueForm());
  const [issueMessage, setIssueMessage] = useState("");
  const [issueDmGroup, setIssueDmGroup] = useState("");
  const [selectedIssueDmCodes, setSelectedIssueDmCodes] = useState([]);
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [returnQuery, setReturnQuery] = useState("");
  const [returnItemKey, setReturnItemKey] = useState("");
  const [returnForm, setReturnForm] = useState(createReturnForm());
  const [returnMessage, setReturnMessage] = useState("");
  const [returnDmGroupOpen, setReturnDmGroupOpen] = useState(false);
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
    setPurchaseProposal(organizationId ? readPurchaseProposal(organizationId) : null);
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
  const issueSearchTokens = tokenizeWarehouseSearch(issueQuery);
  const issueResults = issueSearchTokens.length > 0
    ? warehouseItems.filter((item) => itemMatchesWarehouseQuery(item, issueSearchTokens)).slice(0, 12)
    : [];
  const selectedIssueItem = warehouseItems.find((item) => getItemKey(item) === issueItemKey);
  const selectedIssueStock = selectedIssueItem
    ? releaseLegacyOverstockReservation(getItemStockSummary(selectedIssueItem), selectedIssueItem.overstockReserved)
    : null;
  const selectedIssueDmItem = selectedIssueItem?.tenantSettings?.dmEnabled
    ? findDmItemInItemByCodeOrQuickId(selectedIssueItem, issueForm.dmQuery)
    : null;
  const selectedIssueDmAvailable = isDmItemAvailableForIssue(selectedIssueDmItem);
  const selectedIssueDmReserved = Boolean(selectedIssueDmItem?.status === "reserved");
  const selectedIssueDmItems = selectedIssueItem?.tenantSettings?.dmEnabled
    ? (selectedIssueItem.dmItems || []).filter((dmItem) => selectedIssueDmCodes.includes(dmItem.dmCode))
    : [];
  const issueDmGroupItems = selectedIssueItem?.tenantSettings?.dmEnabled && issueDmGroup
    ? issueDmGroup === "reserved"
      ? getFilteredDmItems(selectedIssueItem, "reserved")
      : getFilteredDmItems(selectedIssueItem, issueDmGroup).filter(isDmItemAvailableForIssue)
    : [];
  const normalizedReturnQuery = normalizeSearch(returnQuery);
  const returnResults = normalizedReturnQuery
    ? warehouseItems.filter((item) => itemMatchesWarehouseQuery(item, normalizedReturnQuery)).slice(0, 12)
    : [];
  const selectedReturnItem = warehouseItems.find((item) => getItemKey(item) === returnItemKey);
  const selectedReturnDmItem = selectedReturnItem?.tenantSettings?.dmEnabled
    ? findDmItemInItemByCodeOrQuickId(selectedReturnItem, returnForm.dmQuery)
    : null;
  const selectedReturnDmValid = Boolean(selectedReturnDmItem && selectedReturnDmItem.status === "production");
  const returnProductionDmItems = selectedReturnItem?.tenantSettings?.dmEnabled
    ? getFilteredDmItems(selectedReturnItem, "production")
    : [];
  const selectedReservationItem = warehouseItems.find((item) => getItemKey(item) === reservationItemKey);
  const selectedReservationStock = selectedReservationItem
    ? getItemStockSummary(selectedReservationItem)
    : null;
  const selectedReservationDmItem = selectedReservationItem?.tenantSettings?.dmEnabled
    ? findDmItemInItemByCodeOrQuickId(selectedReservationItem, reservationForm.dmQuery)
    : null;
  const selectedReservationDmAvailable = isDmItemAvailableForIssue(selectedReservationDmItem);
  const reservationDmGroupItems = selectedReservationItem?.tenantSettings?.dmEnabled && reservationDmGroup
    ? getFilteredDmItems(selectedReservationItem, reservationDmGroup).filter(isDmItemAvailableForIssue)
    : [];
  const movementHistory = collectMovementHistory(warehouseItems);
  const purchaseCandidates = warehouseItems.map(createPurchaseProposalItem).filter(Boolean);
  const purchaseDraftItems = purchaseCandidates.map((item) => {
    const draftEdit = purchaseDraftEdits[item.itemId] || {};

    return normalizePurchaseProposalItem({
      ...item,
      ...draftEdit,
      orderedQuantity: draftEdit.orderedQuantity ?? item.recommendedQuantity,
      editedQuantity: draftEdit.orderedQuantity ?? item.recommendedQuantity,
      excluded: draftEdit.excluded ?? item.excluded,
      note: draftEdit.note ?? item.note,
    });
  });
  const purchaseCandidateGroups = groupPurchaseProposalItems(purchaseDraftItems);
  const selectedDmContext = selectedDmDetail ? findDmItemInWarehouse(warehouseItems, selectedDmDetail.dmCode) : null;
  const serviceTerminalContext = serviceTerminalQuery
    ? findDmItemInWarehouseByCodeOrQuickId(warehouseItems, serviceTerminalQuery)
    : null;
  const serviceTerminalDmReady = Boolean(
    serviceTerminalContext?.dmItem?.status === "sharpening" &&
    serviceTerminalContext?.dmItem?.sharpeningDispatchStatus === "sent"
  );
  const sharpeningReturnContext = sharpeningReturnForm.dmQuery
    ? findDmItemInWarehouseByCodeOrQuickId(warehouseItems, sharpeningReturnForm.dmQuery)
    : null;
  const sharpeningReturnGroups = {
    sent: warehouseItems.flatMap((item) => (item.dmItems || [])
      .filter((dmItem) => dmItem.status === "sharpening" && dmItem.sharpeningDispatchStatus === "sent")
      .map((dmItem) => ({ item, dmItem }))),
    serviced: warehouseItems.flatMap((item) => (item.dmItems || [])
      .filter((dmItem) => dmItem.status === "sharpening" && dmItem.sharpeningDispatchStatus === "serviced")
      .map((dmItem) => ({ item, dmItem }))),
  };
  const selectedSharpeningReturnGroupItems = sharpeningReturnGroup ? sharpeningReturnGroups[sharpeningReturnGroup] || [] : [];
  const warehouseSearchTokens = tokenizeWarehouseSearch(warehouseSearchQuery);
  const filteredWarehouseItems = warehouseSearchTokens.length > 0
    ? warehouseItems.filter((item) => itemMatchesWarehouseQuery(item, warehouseSearchTokens))
    : warehouseItems;
  const sortedWarehouseItems = [...filteredWarehouseItems].sort((left, right) => {
    if (warehouseSortMode === "recent") {
      return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
    }

    const leftMovements = (left.movementHistory || []).length;
    const rightMovements = (right.movementHistory || []).length;
    return rightMovements - leftMovements;
  });
  const selectedWarehouseItem = selectedWarehouseItemKey
    ? warehouseItems.find((item) => getItemKey(item) === selectedWarehouseItemKey) || null
    : null;
  const sharpeningDispatchContext = sharpeningDispatchTarget
    ? (() => {
        const item = warehouseItems.find((candidate) => getItemKey(candidate) === sharpeningDispatchTarget.itemKey);
        const dmItem = item ? (item.dmItems || []).find((candidate) => candidate.dmCode === sharpeningDispatchTarget.dmCode) : null;
        return item && dmItem ? { item, dmItem } : null;
      })()
    : null;
  const hasOpenTerminalProcess = Boolean(activeMainPanel || showIssuePanel || showReturnPanel || showLocalItemForm || selectedDmContext);
  const showHomeSections = !hasOpenTerminalProcess && !selectedWarehouseItem;
  const showWarehouseSection = !hasOpenTerminalProcess;

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

  const scrollWarehouseToTop = () => {
    window.setTimeout(() => {
      warehouseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const backToMainGss = () => {
    closeMainPanel();
    setSelectedWarehouseItemKey("");
    setWarehouseHighlighted(false);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const openWarehouseItemDetail = (item) => {
    setSelectedWarehouseItemKey(getItemKey(item));
    setShowItemHistory(false);
    setGpcDetailItemKey("");
    setDmListFilter("");
    scrollWarehouseToTop();
  };

  const closeWarehouseItemDetail = (item) => {
    closeItemDetails(item);
    setSelectedWarehouseItemKey("");
    setShowItemHistory(false);
    setGpcDetailItemKey("");
    setDmListFilter("");
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
    setSelectedIssueDmCodes([]);
    setServiceTerminalMessage("");
    setShowServiceLabelPreview(false);
    setSharpeningReturnMessage("");
    setSelectedWarehouseItemKey("");
    setShowItemHistory(false);
    setGpcDetailItemKey("");
    setDmListFilter("");
  };

  const openMainPanel = (panel) => {
    setActiveMainPanel(panel);
    setShowIssuePanel(panel === "issue");
    setShowReturnPanel(panel === "return");
    setShowLocalItemForm(panel === "local");
    setPlaceholderMessage("");
    setServiceTerminalMessage("");
    setSharpeningReturnMessage("");

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
    setSelectedWarehouseItemKey(getItemKey(item));
    setGpcDetailItemKey("");
    setSettingsItemKey(getItemKey(item));
    setSettingsForm(createSettingsForm(item));
    setSettingsMessage("");
    scrollWarehouseToTop();
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
    setActiveMainPanel("");
    setShowIssuePanel(false);
    setShowReturnPanel(false);
    setSelectedWarehouseItemKey(getItemKey(item));
    setGpcDetailItemKey("");
    setStockItemKey(getItemKey(item));
    setStockForm(createStockForm());
    setStockMessage("");
    scrollWarehouseToTop();
  };

  const updateStockForm = (field, value) => {
    setStockForm((current) => ({
      ...current,
      [field]: value,
    }));
    setStockMessage("");
  };

  const selectSystemOrderForReceipt = (systemOrder) => {
    const prefillQuantity = systemOrder.remainingQuantity > 0
      ? systemOrder.remainingQuantity
      : systemOrder.orderedQuantity;

    setStockForm((current) => ({
      ...current,
      receiptSourceType: "gss_system_order",
      quantity: String(prefillQuantity || ""),
      sourceDocumentNumber: systemOrder.systemOrderNumber,
      documentNumber: current.documentNumber || systemOrder.systemOrderNumber,
      purchaseProposalId: systemOrder.purchaseProposalId,
      orderProposalId: systemOrder.orderProposalId,
      externalOrderNumber: "",
      systemOrderNumber: systemOrder.systemOrderNumber,
      systemOrderSupplier: systemOrder.supplier,
      systemOrderPurchaseChannel: systemOrder.purchaseChannel,
      systemOrderManufacturer: systemOrder.manufacturer,
      systemOrderOrderedQuantity: String(systemOrder.orderedQuantity),
      systemOrderReceivedQuantity: String(systemOrder.receivedQuantity),
      systemOrderRemainingQuantity: String(systemOrder.remainingQuantity),
      source: current.source || systemOrder.supplier,
    }));
    setStockMessage("");
  };

  const updatePurchaseDraftItem = (itemId, field, value) => {
    setPurchaseDraftEdits((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        [field]: value,
      },
    }));
    setPurchaseProposalMessage("");
  };

  const openReservationForm = (item) => {
    closeItemDetails(item);
    setActiveMainPanel("");
    setShowIssuePanel(false);
    setShowReturnPanel(false);
    setSelectedWarehouseItemKey(getItemKey(item));
    setGpcDetailItemKey("");
    setReservationItemKey(getItemKey(item));
    setReservationForm(createReservationForm());
    setReservationMessage("");
    setReservationDmGroup("");
    setDmListFilter("");
    scrollWarehouseToTop();
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
    setActiveMainPanel("");
    setShowIssuePanel(false);
    setShowReturnPanel(false);
    setSelectedWarehouseItemKey(getItemKey(item));
    setGpcDetailItemKey("");
    setOverstockItemKey(getItemKey(item));
    setOverstockForm(createOverstockOfferForm(item));
    setOverstockMessage("");
    scrollWarehouseToTop();
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

    if (!reservationForm.job.trim() || !reservationForm.reason.trim()) {
      setReservationMessage("Pro rezervaci je nutné zadat zakázku a důvod rezervace.");
      return;
    }

    if (selectedItem.tenantSettings?.dmEnabled) {
      const selectedDmItem = findDmItemInItemByCodeOrQuickId(selectedItem, reservationForm.dmQuery);
      if (!selectedDmItem) {
        setReservationMessage("Vyberte konkrétní DM/QID kus k rezervaci.");
        return;
      }

      if (!isDmItemAvailableForIssue(selectedDmItem)) {
        setReservationMessage("Vybraný DM/QID kus není dostupný k rezervaci.");
        return;
      }

      const releaseCode = generateReleaseCode();
      const reservation = {
        id: crypto.randomUUID(),
        status: "active",
        job: reservationForm.job.trim(),
        machine: reservationForm.machine.trim(),
        reservedFor: reservationForm.reservedFor.trim(),
        quantity: 1,
        state: selectedDmItem.status,
        stateLabel: ISSUE_STATE_LABELS[selectedDmItem.status] || labelFromMap(DM_STATUS_LABELS, selectedDmItem.status),
        reason: reservationForm.reason.trim(),
        reservedBy: reservationForm.reservedBy.trim() || DEFAULT_INTAKE_OPERATOR,
        reservedAt: reservationForm.reservedAt || getTodayDate(),
        validUntil: reservationForm.validUntil,
        dmCode: selectedDmItem.dmCode,
        quickId: selectedDmItem.quickId || "",
        releaseCode,
        createdAt: new Date().toISOString(),
      };

      const nextItems = warehouseItems.map((item) => {
        if (getItemKey(item) !== reservationItemKey) {
          return item;
        }

        const nextDmItems = (item.dmItems || []).map((dmItem) => {
          if (dmItem.dmCode !== selectedDmItem.dmCode) {
            return dmItem;
          }

          return {
            ...dmItem,
            status: "reserved",
            location: dmItem.location || "main_warehouse",
            reservedForOrder: reservation.job,
            reservationMetadata: {
              reservationId: reservation.id,
              previousStatus: selectedDmItem.status,
              job: reservation.job,
              machine: reservation.machine,
              reservedFor: reservation.reservedFor,
              reason: reservation.reason,
              reservedBy: reservation.reservedBy,
              reservedAt: reservation.reservedAt,
              validUntil: reservation.validUntil,
              releaseCode,
            },
            history: [
              createDmHistoryRecord({
                type: "reservation_created",
                performedBy: reservation.reservedBy,
                note: reservation.reason,
                metadata: {
                  reservationId: reservation.id,
                  job: reservation.job,
                  machine: reservation.machine,
                  previousStatus: selectedDmItem.status,
                  releaseCode,
                },
              }),
              ...(dmItem.history || []),
            ],
          };
        });

        const nextItem = syncDmStockSummary({
          ...item,
          dmItems: nextDmItems,
          reservations: [reservation, ...(item.reservations || [])],
          updatedAt: new Date().toISOString(),
        });

        return appendMovement(nextItem, createMovementRecord({
          organizationId,
          item,
          type: "reservation_created",
          quantity: 1,
          state: selectedDmItem.status,
          performedBy: reservation.reservedBy,
          note: reservation.reason,
          metadata: {
            reservationId: reservation.id,
            job: reservation.job,
            machine: reservation.machine,
            reservedFor: reservation.reservedFor,
            dmCode: reservation.dmCode,
            quickId: reservation.quickId,
            stateLabel: reservation.stateLabel,
            reservedAt: reservation.reservedAt,
            validUntil: reservation.validUntil,
            releaseCode,
          },
        }));
      });

      setWarehouseItems(nextItems);
      writeWarehouse(organizationId, nextItems);
      setReservationItemKey("");
      setReservationForm(createReservationForm());
      setReservationDmGroup("");
      setReservationMessage("");
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
    setReservationDmGroup("");
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
      writePurchaseProposal(organizationId, null);
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
      supplier: "grouped_by_manufacturer_supplier_channel",
      groupingRule: "manufacturer + supplierName + purchaseChannel",
      status: "draft",
      items: purchaseDraftItems.map(normalizePurchaseProposalItem),
      groups: groupPurchaseProposalItems(purchaseDraftItems).map((group) => ({
        groupKey: group.groupKey,
        manufacturer: group.manufacturer,
        supplierName: group.supplierName,
        purchaseChannel: group.purchaseChannel,
        itemCount: group.items.length,
      })),
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
        quantity: proposalItem.orderedQuantity,
        state: "new",
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: `Objednávkový návrh do max zásoby pro nový nástroj.`,
        metadata: {
          purchaseProposalId: proposal.id,
          available: proposalItem.available,
          min: proposalItem.min,
          max: proposalItem.max,
          suggestedQuantity: proposalItem.suggestedQuantity,
          originalSuggestedQuantity: proposalItem.originalSuggestedQuantity,
          orderedQuantity: proposalItem.orderedQuantity,
          quantityAdjustedByUser: proposalItem.quantityAdjustedByUser,
          receivedQuantity: proposalItem.receivedQuantity,
          remainingQuantity: proposalItem.remainingQuantity,
          supplierPackQuantity: proposalItem.supplierPackQuantity,
          supplierName: proposalItem.supplierName,
          supplierType: proposalItem.supplierType,
          purchaseChannel: proposalItem.purchaseChannel,
          purchaseGroupKey: proposalItem.purchaseGroupKey,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setPurchaseProposal(proposal);
    writePurchaseProposal(organizationId, proposal);
    setPurchaseProposalMessage("Objednávkový návrh byl vytvořen a rozdělen podle výrobce, dodavatele a nákupního kanálu.");
  };

  const updatePurchaseProposalItem = (itemId, field, value) => {
    setPurchaseProposal((current) => {
      if (!current) {
        return current;
      }

      const nextProposal = {
        ...current,
        items: current.items.map((item) => {
          if (item.itemId !== itemId) {
            return item;
          }

          if (field === "editedQuantity") {
            return normalizePurchaseProposalItem({
              ...item,
              orderedQuantity: value,
              editedQuantity: value,
            });
          }

          return {
            ...item,
            [field]: value,
          };
        }),
      };

      writePurchaseProposal(organizationId, nextProposal);
      return nextProposal;
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
      setReservationDmGroup("");
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

    if (sharpeningDispatchTarget?.itemKey === itemKey) {
      setSharpeningDispatchTarget(null);
      setSharpeningDispatchForm(createSharpeningDispatchForm());
      setSharpeningDispatchMessage("");
    }

    if (selectedDmDetail?.itemId === itemKey) {
      closeDmDetail();
    }
  };

  const openTerminalForItem = (panel, item) => {
    closeItemDetails(item);
    setSelectedWarehouseItemKey("");

    if (panel === "issue") {
      openIssuePanel();
      selectIssueItem(item);
      return;
    }

    if (panel === "return") {
      openReturnPanel();
      selectReturnItem(item);
      return;
    }

    if (panel === "intake") {
      setActiveMainPanel("");
      openStockForm(item);
      return;
    }

    if (panel === "reservation") {
      setActiveMainPanel("");
      openReservationForm(item);
      return;
    }

    if (panel === "overstock") {
      setActiveMainPanel("");
      openOverstockForm(item);
      return;
    }

    openMainPanel(panel);
  };

  const updateDmServiceForm = (field, value) => {
    setDmServiceForm((current) => ({
      ...current,
      [field]: value,
    }));
    setDmServiceMessage("");
  };

  const openSharpeningDispatchForm = (item, dmItem) => {
    setSharpeningDispatchTarget({
      itemKey: getItemKey(item),
      dmCode: dmItem.dmCode,
    });
    setSharpeningDispatchForm(createSharpeningDispatchForm(dmItem));
    setSharpeningDispatchMessage("");
  };

  const updateSharpeningDispatchForm = (field, value) => {
    setSharpeningDispatchForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSharpeningDispatchMessage("");
  };

  const updateServiceTerminalForm = (field, value) => {
    setServiceTerminalForm((current) => ({
      ...current,
      [field]: value,
    }));
    setServiceTerminalMessage("");
  };

  const updateSharpeningReturnForm = (field, value) => {
    setSharpeningReturnForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "dmQuery" ? { confirmWithoutService: false } : {}),
    }));
    setSharpeningReturnMessage("");
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
    const existingQuickIds = getAllQuickIds(warehouseItems);
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
        quickId: generateQuickId(existingQuickIds),
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
        sharpeningDispatchStatus: dmForm.status === "sharpening" ? "waiting" : "",
        sharpeningDispatchMetadata: null,
        markingStatus: "unmarked",
        markedAt: "",
        history: [
          createDmHistoryRecord({
            type: "dm_created",
            note: "DM kus vytvořen v GSS MVP.",
            metadata: {
              status: dmForm.status,
              location: dmForm.location,
              currentDiameter: dmForm.currentDiameter.trim(),
              currentLength: dmForm.currentLength.trim(),
              markingStatus: "unmarked",
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

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: [...(item.dmItems || []), ...newDmItems],
        updatedAt: now,
      });

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
          quickIds: newDmItems.map((dmItem) => dmItem.quickId),
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

  const generateQuickIdForSelectedDm = () => {
    if (!selectedDmDetail) {
      setDmServiceMessage("Vyberte DM kus.");
      return;
    }

    const existingQuickIds = getAllQuickIds(warehouseItems);
    const nextQuickId = generateQuickId(existingQuickIds);
    const now = new Date().toISOString();
    const historyRecord = createDmHistoryRecord({
      type: "quick_id_generated",
      note: `QID ${nextQuickId} vygenerováno pro DM kus.`,
      metadata: {
        quickId: nextQuickId,
      },
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== selectedDmDetail.itemId) {
        return item;
      }

      return {
        ...item,
        dmItems: (item.dmItems || []).map((dmItem) => {
          if (dmItem.dmCode !== selectedDmDetail.dmCode) {
            return dmItem;
          }

          if (dmItem.quickId) {
            return dmItem;
          }

          return {
            ...dmItem,
            quickId: nextQuickId,
            history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
            updatedAt: now,
          };
        }),
        updatedAt: now,
      };
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setDmServiceMessage(`QID ${nextQuickId} bylo vygenerováno.`);
  };

  const markDmItemAsPhysicallyMarked = (itemKey, dmCode) => {
    const now = new Date().toISOString();
    const historyRecord = createDmHistoryRecord({
      type: "dm_marked",
      note: "DM kus označen jako fyzicky značený.",
      metadata: {
        markingStatus: "marked",
        markedAt: now,
      },
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== itemKey) {
        return item;
      }

      return {
        ...item,
        dmItems: (item.dmItems || []).map((dmItem) => {
          if (dmItem.dmCode !== dmCode) {
            return dmItem;
          }

          return {
            ...dmItem,
            markingStatus: "marked",
            markedAt: now,
            history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
            updatedAt: now,
          };
        }),
        updatedAt: now,
      };
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setDmServiceMessage("DM kus byl označen jako fyzicky označený.");
  };

  const saveSharpeningDispatch = (event) => {
    event.preventDefault();

    if (!sharpeningDispatchTarget) {
      setSharpeningDispatchMessage("Vyberte DM kus k odeslání na broušení.");
      return;
    }

    const selectedItem = warehouseItems.find((item) => getItemKey(item) === sharpeningDispatchTarget.itemKey);
    const selectedDmItem = selectedItem
      ? (selectedItem.dmItems || []).find((dmItem) => dmItem.dmCode === sharpeningDispatchTarget.dmCode)
      : null;

    if (!selectedItem || !selectedDmItem) {
      setSharpeningDispatchMessage("DM kus nebyl nalezen.");
      return;
    }

    if (selectedDmItem.status !== "sharpening") {
      setSharpeningDispatchMessage("Odeslat lze pouze DM kus ve stavu Na broušení.");
      return;
    }

    const servicePartner = sharpeningDispatchForm.servicePartner.trim() || DEFAULT_GRINDER;
    const dispatchedAt = sharpeningDispatchForm.dispatchedAt || getTodayDate();
    const performedBy = sharpeningDispatchForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR;
    const metadata = {
      servicePartner,
      collectionBox: sharpeningDispatchForm.collectionBox.trim(),
      note: sharpeningDispatchForm.note.trim(),
      dispatchedAt,
      performedBy,
      dispatchText: createSharpeningDispatchText(selectedItem, selectedDmItem, {
        ...sharpeningDispatchForm,
        servicePartner,
        dispatchedAt,
        performedBy,
        customerName: organization.name || "",
      }),
    };
    const historyRecord = createDmHistoryRecord({
      type: "sharpening_dispatched",
      performedBy,
      note: metadata.note || `Odesláno na broušení: ${servicePartner}`,
      metadata,
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== sharpeningDispatchTarget.itemKey) {
        return item;
      }

      const nextDmItems = (item.dmItems || []).map((dmItem) => {
        if (dmItem.dmCode !== sharpeningDispatchTarget.dmCode) {
          return dmItem;
        }

        return {
          ...dmItem,
          status: "sharpening",
          location: "grinding_shop",
          sharpeningDispatchStatus: "sent",
          sharpeningDispatchMetadata: metadata,
          history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        updatedAt: new Date().toISOString(),
      });

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "send_to_sharpening",
        quantity: 1,
        state: "sharpening",
        performedBy,
        note: metadata.note || `Odesláno na broušení: ${servicePartner}`,
        metadata: {
          dmCode: selectedDmItem.dmCode,
          quickId: selectedDmItem.quickId,
          sharpeningDispatchStatus: "sent",
          servicePartner,
          collectionBox: metadata.collectionBox,
          dispatchedAt,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setSharpeningDispatchMessage("DM kus byl označen jako odeslaný na broušení.");
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

  const loadServiceTerminalDm = () => {
    const found = findDmItemInWarehouseByCodeOrQuickId(warehouseItems, serviceTerminalQuery);
    if (!found) {
      setServiceTerminalMessage("DM kus nebyl nalezen.");
      setServiceTerminalForm(createServiceTerminalForm());
      setShowServiceLabelPreview(false);
      return;
    }

    setServiceTerminalForm(createServiceTerminalForm(found.dmItem));
    setShowServiceLabelPreview(false);
    if (found.dmItem.status !== "sharpening" || found.dmItem.sharpeningDispatchStatus !== "sent") {
      setServiceTerminalMessage("Kus není vedený jako odeslaný na broušení.");
      return;
    }

    setServiceTerminalMessage("DM kus byl načten do servisního terminálu.");
  };

  const saveServiceTerminalChanges = (event) => {
    event.preventDefault();

    const found = findDmItemInWarehouseByCodeOrQuickId(warehouseItems, serviceTerminalQuery);
    if (!found) {
      setServiceTerminalMessage("DM kus nebyl nalezen.");
      return;
    }

    if (found.dmItem.status !== "sharpening" || found.dmItem.sharpeningDispatchStatus !== "sent") {
      setServiceTerminalMessage("Kus není vedený jako odeslaný na broušení.");
      return;
    }

    const performedBy = serviceTerminalForm.performedBy.trim() || DEFAULT_GRINDER;
    const serviceDate = serviceTerminalForm.serviceDate || getTodayDate();
    const nextSharpeningCount = Number(found.dmItem.sharpeningCount || 0) + 1;
    const serviceMetadata = {
      servicedAt: serviceDate,
      performedBy,
      previousDiameter: found.dmItem.currentDiameter,
      previousLength: found.dmItem.currentLength,
      previousOverallLength: found.dmItem.currentOverallLength || found.dmItem.overallLength || "",
      currentDiameter: serviceTerminalForm.currentDiameter.trim(),
      currentLength: serviceTerminalForm.currentLength.trim(),
      currentOverallLength: serviceTerminalForm.currentOverallLength.trim(),
      additionalParameters: serviceTerminalForm.additionalParameters.trim(),
      serviceNote: serviceTerminalForm.serviceNote.trim(),
      sharpeningCount: nextSharpeningCount,
    };
    const historyRecord = createDmHistoryRecord({
      type: "sharpening_serviced",
      performedBy,
      note: serviceMetadata.serviceNote || "Servis zapsal nové parametry po broušení.",
      metadata: serviceMetadata,
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== getItemKey(found.item)) {
        return item;
      }

      const nextDmItems = (item.dmItems || []).map((dmItem) => {
        if (dmItem.dmCode !== found.dmItem.dmCode) {
          return dmItem;
        }

        return {
          ...dmItem,
          currentDiameter: serviceMetadata.currentDiameter,
          currentLength: serviceMetadata.currentLength,
          currentOverallLength: serviceMetadata.currentOverallLength,
          sharpeningCount: nextSharpeningCount,
          serviceNote: serviceMetadata.serviceNote,
          lastServiceAt: serviceDate,
          lastMeasuredAt: serviceDate,
          lastServiceMetadata: serviceMetadata,
          status: "sharpening",
          location: "grinding_shop",
          sharpeningDispatchStatus: "serviced",
          history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        updatedAt: new Date().toISOString(),
      });

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "dm_service_updated",
        quantity: 1,
        state: "sharpening",
        performedBy,
        note: serviceMetadata.serviceNote || "Servis zapsal nové parametry po broušení.",
        metadata: {
          dmCode: found.dmItem.dmCode,
          quickId: found.dmItem.quickId,
          sharpeningDispatchStatus: "serviced",
          currentDiameter: serviceMetadata.currentDiameter,
          currentLength: serviceMetadata.currentLength,
          currentOverallLength: serviceMetadata.currentOverallLength,
          sharpeningCount: nextSharpeningCount,
          serviceDate,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    const updated = findDmItemInWarehouseByCodeOrQuickId(nextItems, serviceTerminalQuery);
    if (updated) {
      setServiceTerminalForm(createServiceTerminalForm(updated.dmItem));
    }
    setShowServiceLabelPreview(true);
    setServiceTerminalMessage("Servisní změny byly uloženy. Připravte štítek a zákazník může kus přijmout zpět.");
  };

  const printDmLabel = (item, dmItem, source = "detail kusu") => {
    if (!item || !dmItem) {
      return;
    }

    const now = new Date().toISOString();
    const performedBy = source === "servisní terminál" ? (serviceTerminalForm.performedBy.trim() || DEFAULT_GRINDER) : DEFAULT_INTAKE_OPERATOR;
    const dimensions = getDmCurrentDimensionsForLabel(dmItem);
    const historyRecord = createDmHistoryRecord({
      type: "label_printed",
      performedBy,
      note: `Štítek pro QID ${dmItem.quickId || "bez QID"} byl připraven k tisku.`,
      metadata: {
        quickId: dmItem.quickId || "",
        dmCode: dmItem.dmCode || "",
        currentDiameter: dimensions.diameter,
        currentLength: dimensions.length,
        currentOverallLength: dimensions.overallLength,
        printedAt: now,
        performedBy,
        source,
      },
    });
    const nextItems = warehouseItems.map((warehouseItem) => {
      if (getItemKey(warehouseItem) !== getItemKey(item)) {
        return warehouseItem;
      }

      return {
        ...warehouseItem,
        dmItems: (warehouseItem.dmItems || []).map((candidate) => (
          candidate.dmCode === dmItem.dmCode
            ? {
                ...candidate,
                history: [historyRecord, ...(candidate.history || [])].slice(0, 100),
                updatedAt: now,
              }
            : candidate
        )),
        updatedAt: now,
      };
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    window.setTimeout(() => window.print(), 0);
  };

  const receiveFromSharpening = (event) => {
    event.preventDefault();

    const found = findDmItemInWarehouseByCodeOrQuickId(warehouseItems, sharpeningReturnForm.dmQuery);
    if (!found) {
      setSharpeningReturnMessage("DM/QID kus nebyl nalezen.");
      return;
    }

    if (found.dmItem.status !== "sharpening") {
      setSharpeningReturnMessage("Přijmout z broušení lze pouze DM kus ve stavu Na broušení.");
      return;
    }

    const serviceIsMissing = found.dmItem.sharpeningDispatchStatus !== "serviced";
    if (serviceIsMissing && !sharpeningReturnForm.confirmWithoutService) {
      setSharpeningReturnMessage("U tohoto kusu nejsou uložené servisní rozměry z brusírny.");
      return;
    }

    const performedBy = sharpeningReturnForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR;
    const receivedAt = sharpeningReturnForm.receivedAt || getTodayDate();
    const returnMetadata = {
      receivedAt,
      performedBy,
      note: sharpeningReturnForm.note.trim(),
      location: sharpeningReturnForm.location || "main_warehouse",
      acceptedWithoutServiceDimensions: serviceIsMissing,
    };
    const historyRecord = createDmHistoryRecord({
      type: "sharpening_returned",
      performedBy,
      note: returnMetadata.note || "DM kus přijat zpět z broušení.",
      metadata: returnMetadata,
    });

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== getItemKey(found.item)) {
        return item;
      }

      const nextDmItems = (item.dmItems || []).map((dmItem) => {
        if (dmItem.dmCode !== found.dmItem.dmCode) {
          return dmItem;
        }

        return {
          ...dmItem,
          status: "resharpened_new",
          location: returnMetadata.location,
          sharpeningDispatchStatus: "returned",
          sharpeningReturnMetadata: returnMetadata,
          history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        updatedAt: new Date().toISOString(),
      });

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "intake",
        quantity: 1,
        state: "resharpened_new",
        performedBy,
        note: returnMetadata.note || "Příjem konkrétního DM/QID kusu zpět z broušení.",
        metadata: {
          dmCode: found.dmItem.dmCode,
          quickId: found.dmItem.quickId,
          source: "sharpening_return",
          sharpeningDispatchStatus: "returned",
          receivedAt,
          acceptedWithoutServiceDimensions: serviceIsMissing,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setSharpeningReturnForm(createSharpeningReturnForm());
    setSharpeningReturnGroup("");
    setSharpeningReturnMessage("DM kus byl přijat zpět jako Nový přebroušený.");
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
          sharpeningDispatchStatus: "returned",
          history: [historyRecord, ...(dmItem.history || [])].slice(0, 100),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        updatedAt: new Date().toISOString(),
      });

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

    const selectedStockItem = warehouseItems.find((item) => getItemKey(item) === stockItemKey);
    if (selectedStockItem?.tenantSettings?.dmEnabled && stockForm.condition === "resharpened_new") {
      setStockMessage("U DM položky se přebroušený kus přijímá přes Příjem z broušení konkrétního DM/QID kusu.");
      return;
    }

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

    const receiptSourceType = stockForm.receiptSourceType || "manual";
    const selectedProposalLine = receiptSourceType === "gss_system_order" && purchaseProposal?.id === stockForm.purchaseProposalId.trim()
      ? (purchaseProposal.items || []).find((proposalItem) => proposalItem.itemId === stockItemKey)
      : null;
    const suggestedQuantity = selectedProposalLine
      ? getProposalSuggestedQuantity(selectedProposalLine)
      : parseOrderQuantity(stockForm.systemOrderOrderedQuantity, 0);
    const orderedQuantity = selectedProposalLine
      ? getProposalOrderedQuantity(selectedProposalLine)
      : parseOrderQuantity(stockForm.systemOrderOrderedQuantity, suggestedQuantity);
    const receivedQuantityBefore = selectedProposalLine
      ? parseOrderQuantity(selectedProposalLine.receivedQuantity, 0)
      : parseOrderQuantity(stockForm.systemOrderReceivedQuantity, 0);
    const remainingQuantityBefore = selectedProposalLine
      ? parseOrderQuantity(selectedProposalLine.remainingQuantity, Math.max(orderedQuantity - receivedQuantityBefore, 0))
      : parseOrderQuantity(stockForm.systemOrderRemainingQuantity, Math.max(orderedQuantity - receivedQuantityBefore, 0));
    const receivedQuantityAfter = receiptSourceType === "gss_system_order"
      ? receivedQuantityBefore + quantity
      : receivedQuantityBefore;
    const remainingQuantityAfter = receiptSourceType === "gss_system_order"
      ? Math.max(orderedQuantity - receivedQuantityAfter, 0)
      : remainingQuantityBefore;
    const quantityAdjustedByUser = selectedProposalLine
      ? Boolean(selectedProposalLine.quantityAdjustedByUser)
      : orderedQuantity !== suggestedQuantity;
    const receiptMetadata = {
      receiptSourceType,
      receiptSourceTypeLabel: RECEIPT_SOURCE_LABELS[receiptSourceType] || receiptSourceType,
      sourceDocumentNumber: stockForm.sourceDocumentNumber.trim(),
      purchaseProposalId: stockForm.purchaseProposalId.trim(),
      orderProposalId: stockForm.orderProposalId.trim() || stockForm.purchaseProposalId.trim(),
      externalOrderNumber: stockForm.externalOrderNumber.trim(),
      systemOrderNumber: stockForm.systemOrderNumber.trim() || stockForm.sourceDocumentNumber.trim(),
      supplier: stockForm.systemOrderSupplier.trim() || stockForm.source.trim(),
      purchaseChannel: stockForm.systemOrderPurchaseChannel.trim(),
      manufacturer: stockForm.systemOrderManufacturer.trim(),
      suggestedQuantity,
      originalSuggestedQuantity: selectedProposalLine?.originalSuggestedQuantity ?? suggestedQuantity,
      orderedQuantity,
      receivedQuantityBefore,
      receivedQuantityAfter,
      remainingQuantityBefore,
      remainingQuantityAfter,
      receivedFromThisMovement: receiptSourceType === "gss_system_order" ? quantity : 0,
      quantityAdjustedByUser,
    };
    const existingCodes = getAllDmCodes(warehouseItems);
    const existingQuickIds = getAllQuickIds(warehouseItems);
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
      const dmPrefix = getDmPrefix(organization);
      const dmGid = getDmGid(item);
      let nextDmSequence = getNextDmSequence(warehouseItems, dmPrefix, dmGid);
      const dmStatus = stockForm.condition || "new";
      const dmLocation = dmStatus === "sharpening" ? "sharpening_collection" : "main_warehouse";
      const newDmItems = item.tenantSettings?.dmEnabled
        ? Array.from({ length: quantity }, () => {
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
              quickId: generateQuickId(existingQuickIds),
              itemId: getItemKey(item),
              gid: dmGid,
              sequence: Number(dmCode.slice(-3)),
              gpc_id: item.gpc_id || "",
              origin: item.origin || "LOCAL",
              status: dmStatus,
              location: dmLocation,
              currentDiameter: "",
              currentLength: "",
              sharpeningCount: 0,
              maxSharpeningCount: item.tenantSettings?.sharpen?.cycles ? Number(item.tenantSettings.sharpen.cycles) : null,
              lastServiceAt: "",
              lastMeasuredAt: "",
              lastMeasurementProtocol: "",
              serviceNote: "",
              coating: item.tenantSettings?.coatingNote || "",
              drawingUrl: item.tenantSettings?.drawingReference || "",
              blockedReason: "",
              reservedForOrder: "",
              sharpeningDispatchStatus: dmStatus === "sharpening" ? "waiting" : "",
              sharpeningDispatchMetadata: null,
              markingStatus: "unmarked",
              markedAt: "",
              history: [
                createDmHistoryRecord({
                  type: "dm_created_from_intake",
                  note: "DM kus vytvořen automaticky při naskladnění.",
                  metadata: {
                    status: dmStatus,
                    location: dmLocation,
                    markingStatus: "unmarked",
                    documentType: stockForm.documentType,
                    documentNumber: stockForm.documentNumber.trim(),
                    ...receiptMetadata,
                  },
                }),
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          })
        : [];
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
          ...receiptMetadata,
        },
      };

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: item.tenantSettings?.dmEnabled ? [...(item.dmItems || []), ...newDmItems] : item.dmItems,
        lastPurchasePrice: purchasePricePerUnit,
        lastPurchaseCurrency: purchaseCurrency,
        lastPurchaseDate: purchaseDate,
        lastPurchaseSupplier: purchaseSupplier,
        stockSummary: nextStock,
        updatedAt: new Date().toISOString(),
      });

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
          ...receiptMetadata,
          dmCodes: newDmItems.map((dmItem) => dmItem.dmCode),
          quickIds: newDmItems.map((dmItem) => dmItem.quickId),
          grinder: isSharpening ? stockForm.grinder.trim() || DEFAULT_GRINDER : "",
          stockNote: stockForm.note.trim(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    if (receiptSourceType === "gss_system_order" && stockForm.purchaseProposalId.trim()) {
      setPurchaseProposal((current) => {
        if (!current || current.id !== stockForm.purchaseProposalId.trim()) {
          return current;
        }

        const nextProposalItems = (current.items || []).map((proposalItem) => {
          if (proposalItem.itemId !== stockItemKey) {
            return proposalItem;
          }

          const currentSuggestedQuantity = getProposalSuggestedQuantity(proposalItem);
          const currentOrderedQuantity = getProposalOrderedQuantity(proposalItem);
          const currentReceivedQuantity = parseOrderQuantity(proposalItem.receivedQuantity, 0);
          const nextReceivedQuantity = currentReceivedQuantity + quantity;
          const nextRemainingQuantity = Math.max(currentOrderedQuantity - nextReceivedQuantity, 0);

          return normalizePurchaseProposalItem({
            ...proposalItem,
            suggestedQuantity: currentSuggestedQuantity,
            orderedQuantity: currentOrderedQuantity,
            editedQuantity: currentOrderedQuantity,
            receivedQuantity: nextReceivedQuantity,
            remainingQuantity: nextRemainingQuantity,
            fulfillmentStatus: nextRemainingQuantity <= 0 ? "fulfilled" : "open",
            fulfilledAt: nextRemainingQuantity <= 0 ? new Date().toISOString() : proposalItem.fulfilledAt,
          });
        });
        const includedItems = nextProposalItems.filter((proposalItem) => !proposalItem.excluded);
        const allIncludedFulfilled = includedItems.length > 0 && includedItems.every((proposalItem) => proposalItem.fulfillmentStatus === "fulfilled" || parseOrderQuantity(proposalItem.remainingQuantity, 0) <= 0);

        const nextProposal = {
          ...current,
          status: allIncludedFulfilled ? "fulfilled" : current.status,
          fulfilledAt: allIncludedFulfilled ? new Date().toISOString() : current.fulfilledAt,
          items: nextProposalItems,
        };

        writePurchaseProposal(organizationId, nextProposal);
        return nextProposal;
      });
    }
    setStockItemKey("");
    setStockForm(createStockForm());
    setStockMessage("");
  };

  const selectIssueItem = (item) => {
    setIssueItemKey(getItemKey(item));
    setIssueForm(createIssueForm());
    setIssueMessage("");
    setIssueDmGroup("");
    setSelectedIssueDmCodes([]);
  };

  const updateIssueForm = (field, value) => {
    setIssueForm((current) => ({
      ...current,
      [field]: value,
    }));
    setIssueMessage("");
  };

  const toggleIssueDmSelection = (dmItem) => {
    if (!dmItem || dmItem.status === "reserved" || !isDmItemAvailableForIssue(dmItem)) {
      return;
    }

    setIssueForm((current) => ({
      ...current,
      dmQuery: "",
      releaseCode: "",
      overrideReason: "",
    }));
    setIssueMessage("");
    setSelectedIssueDmCodes((current) => (
      current.includes(dmItem.dmCode)
        ? current.filter((dmCode) => dmCode !== dmItem.dmCode)
        : [...current, dmItem.dmCode]
    ));
  };

  const issueToProduction = (event) => {
    event.preventDefault();

    if (!selectedIssueItem) {
      setIssueMessage("Vyberte položku k výdeji.");
      return;
    }

    const isDmIssue = Boolean(selectedIssueItem.tenantSettings?.dmEnabled);
    const selectedDmItem = isDmIssue ? findDmItemInItemByCodeOrQuickId(selectedIssueItem, issueForm.dmQuery) : null;
    const selectedDmItems = isDmIssue
      ? selectedIssueDmCodes.length > 0
        ? (selectedIssueItem.dmItems || []).filter((dmItem) => selectedIssueDmCodes.includes(dmItem.dmCode))
        : selectedDmItem ? [selectedDmItem] : []
      : [];

    if (isDmIssue && selectedDmItems.length === 0) {
      setIssueMessage("Vyberte konkrétní DM/QID kusy nebo načtěte jeden DM/QID kus.");
      return;
    }

    if (isDmIssue && issueForm.dmQuery.trim() && !selectedDmItem && selectedIssueDmCodes.length === 0) {
      setIssueMessage("DM/QID kus nebyl nalezen.");
      return;
    }

    if (isDmIssue && selectedDmItems.some((dmItem) => dmItem.status === "reserved")) {
      setIssueMessage("Kus je rezervovaný. Použijte potvrzenou akci Vydat rezervovaný kus.");
      return;
    }

    if (isDmIssue && selectedDmItems.some((dmItem) => !isDmItemAvailableForIssue(dmItem))) {
      setIssueMessage("Některý vybraný kus není dostupný pro výdej.");
      return;
    }

    const quantity = isDmIssue ? selectedDmItems.length : Number(issueForm.quantity);
    const dmIssueStateCounts = isDmIssue
      ? selectedDmItems.reduce((counts, dmItem) => ({
          ...counts,
          [dmItem.status]: (counts[dmItem.status] || 0) + 1,
        }), {})
      : {};
    const issueState = isDmIssue
      ? Object.keys(dmIssueStateCounts).length === 1 ? selectedDmItems[0].status : "mixed"
      : issueForm.preferredState;

    if (!isDmIssue && (!Number.isFinite(quantity) || quantity <= 0)) {
      setIssueMessage("Zadejte kladný počet kusů pro výdej.");
      return;
    }

    const currentStock = releaseLegacyOverstockReservation(
      getItemStockSummary(selectedIssueItem),
      selectedIssueItem.overstockReserved
    );
    if (quantity > currentStock.available) {
      setIssueMessage("Nelze vydat více kusů, než je dostupné množství.");
      return;
    }

    if (!isDmIssue && quantity > currentStock.states[issueState]) {
      setIssueMessage("Ve vybraném stavu není dostatek kusů k výdeji.");
      return;
    }

    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== issueItemKey) {
        return item;
      }

      const stock = releaseLegacyOverstockReservation(
        getItemStockSummary(item),
        item.overstockReserved
      );
      const currentOffer = item.overstockOffer;
      const offerQuantity = Number(currentOffer?.quantity) || 0;
      const issuedNewQuantity = isDmIssue ? dmIssueStateCounts.new || 0 : issueState === "new" ? quantity : 0;
      const nextStateQuantity = isDmIssue ? stock.states.new - issuedNewQuantity : stock.states[issueState] - quantity;
      const offerIsAffected = currentOffer?.enabled && currentOffer.status === "active" && issuedNewQuantity > 0 && offerQuantity > nextStateQuantity;
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
      const issuedDmCodes = [];
      const issuedQuickIds = [];
      const selectedDmCodeSet = new Set(selectedDmItems.map((dmItem) => dmItem.dmCode));
      const nextDmItems = item.tenantSettings?.dmEnabled
        ? (item.dmItems || []).map((dmItem) => {
            if (!selectedDmCodeSet.has(dmItem.dmCode)) {
              return dmItem;
            }

            issuedDmCodes.push(dmItem.dmCode);
            issuedQuickIds.push(dmItem.quickId);

            return {
              ...dmItem,
              status: "production",
              location: "production",
              lastIssueMetadata: {
                issuedAt: new Date().toISOString(),
                performedBy: DEFAULT_INTAKE_OPERATOR,
                costCenter: issueForm.costCenter.trim(),
                machine: issueForm.machine.trim(),
                job: issueForm.job.trim(),
                note: issueForm.note.trim(),
              },
              history: [
                createDmHistoryRecord({
                  type: "dm_issue_to_production",
                  note: issueForm.note.trim() || `DM kus vydán do výroby na zakázku ${issueForm.job.trim() || "neuvedeno"}.`,
                  metadata: {
                    previousStatus: issueState,
                    previousDmStatus: dmItem.status,
                    job: issueForm.job.trim(),
                    costCenter: issueForm.costCenter.trim(),
                    machine: issueForm.machine.trim(),
                  },
                }),
                ...(dmItem.history || []),
              ].slice(0, 100),
              updatedAt: new Date().toISOString(),
            };
          })
        : item.dmItems;
      const nextItem = syncDmStockSummary({
        ...item,
        overstockOffer: nextOverstockOffer,
        overstockReserved: 0,
        dmItems: nextDmItems,
        stockSummary: {
          ...stock,
          available: stock.available - quantity,
          production: stock.production + quantity,
          states: {
            ...stock.states,
            ...(isDmIssue
              ? Object.fromEntries(Object.entries(dmIssueStateCounts).map(([state, count]) => [state, Math.max((stock.states[state] || 0) - count, 0)]))
              : { [issueState]: nextStateQuantity }),
          },
          lastIssueMetadata: {
            type: "issue_to_production",
            quantity,
            preferredState: issueState,
            preferredStateLabel: ISSUE_STATE_LABELS[issueState] || "Více stavů",
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
      });

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "issue_to_production",
        quantity,
        state: issueState,
        performedBy: DEFAULT_INTAKE_OPERATOR,
        note: `${issueForm.note.trim()}${overstockIssueNote}`.trim(),
        metadata: {
          preferredState: issueState,
          preferredStateLabel: ISSUE_STATE_LABELS[issueState] || "Více stavů",
          costCenter: issueForm.costCenter.trim(),
          machine: issueForm.machine.trim(),
          job: issueForm.job.trim(),
          issuedDmCode: selectedDmItems.length === 1 ? selectedDmItems[0]?.dmCode : undefined,
          issuedQuickId: selectedDmItems.length === 1 ? selectedDmItems[0]?.quickId : undefined,
          overstockOfferAdjusted: offerIsAffected,
          overstockOfferPreviousQuantity: offerIsAffected ? offerQuantity : undefined,
          overstockOfferNextQuantity: offerIsAffected ? nextOfferQuantity : undefined,
          issuedDmCodes,
          issuedQuickIds,
          issuedAt: new Date().toISOString(),
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    const affectedItem = nextItems.find((item) => getItemKey(item) === issueItemKey);
    const overstockWasAdjusted = Boolean(affectedItem?.stockSummary?.lastIssueMetadata?.overstockOfferAdjusted);
    const dmIssueSuffix = selectedDmItems.length > 0
      ? selectedDmItems.length === 1
        ? ` QID ${selectedDmItems[0].quickId || "bez QID"} / DM ${selectedDmItems[0].dmCode} odešel do výroby.`
        : ` Vydáno ${selectedDmItems.length} konkrétních DM/QID kusů do výroby.`
      : "";
    setSelectedIssueDmCodes([]);
    setIssueForm(createIssueForm());
    setIssueMessage(overstockWasAdjusted
      ? `Položka byla vydána do výroby.${dmIssueSuffix} Výdej zasáhl do nadnormativní nabídky. Nabízené množství bylo automaticky poníženo.`
      : `Položka byla vydána do výroby.${dmIssueSuffix}`);
  };

  const issueReservedDmToProduction = () => {
    if (!selectedIssueItem) {
      setIssueMessage("Vyberte položku pro výdej.");
      return;
    }

    const selectedDmItem = selectedIssueItem.tenantSettings?.dmEnabled
      ? findDmItemInItemByCodeOrQuickId(selectedIssueItem, issueForm.dmQuery)
      : null;

    if (!selectedDmItem) {
      setIssueMessage("DM/QID kus nebyl nalezen.");
      return;
    }

    if (selectedDmItem.status !== "reserved") {
      setIssueMessage("Vybraný kus není rezervovaný.");
      return;
    }

    const reservationMetadata = selectedDmItem.reservationMetadata || {};
    const expectedReleaseCode = String(reservationMetadata.releaseCode || "").trim().toUpperCase();
    const enteredReleaseCode = issueForm.releaseCode.trim().toUpperCase();
    const releaseCodeMatches = Boolean(expectedReleaseCode) && enteredReleaseCode === expectedReleaseCode;
    const overrideReason = issueForm.overrideReason.trim();
    const useOverride = !releaseCodeMatches && Boolean(overrideReason);

    if (!releaseCodeMatches && !useOverride) {
      setIssueMessage("Zadejte platný Release Code nebo důvod override výdeje.");
      return;
    }

    const performedBy = DEFAULT_INTAKE_OPERATOR;
    const issuedAt = new Date().toISOString();
    const overrideMetadata = useOverride
      ? {
          performedBy,
          performedAt: issuedAt,
          reason: overrideReason,
        }
      : null;
    const releaseMetadata = releaseCodeMatches
      ? {
          performedBy,
          performedAt: issuedAt,
          releaseCode: enteredReleaseCode,
        }
      : null;
    const nextItems = warehouseItems.map((item) => {
      if (getItemKey(item) !== issueItemKey) {
        return item;
      }

      const nextDmItems = (item.dmItems || []).map((dmItem) => {
        if (dmItem.dmCode !== selectedDmItem.dmCode) {
          return dmItem;
        }

        const issueMetadata = {
          issuedAt,
          performedBy,
          costCenter: issueForm.costCenter.trim(),
          machine: issueForm.machine.trim() || reservationMetadata.machine || "",
          job: issueForm.job.trim() || reservationMetadata.job || dmItem.reservedForOrder || "",
          note: issueForm.note.trim(),
          fromReservation: true,
          reservationId: reservationMetadata.reservationId,
          releaseMethod: useOverride ? "override" : "release_code",
          overrideMetadata,
          releaseMetadata,
        };

        return {
          ...dmItem,
          status: "production",
          location: "production",
          lastReservationMetadata: reservationMetadata,
          reservationMetadata: null,
          reservedForOrder: "",
          lastIssueMetadata: issueMetadata,
          history: [
            createDmHistoryRecord({
              type: useOverride ? "reservation_override_issue_to_production" : "reservation_released_by_code",
              performedBy,
              note: useOverride
                ? `Rezervace obejita override výdejem. Důvod: ${overrideReason}`
                : "Rezervace uvolněna Release Code a vydána do výroby.",
              metadata: {
                previousStatus: "reserved",
                reservationMetadata,
                ...issueMetadata,
              },
            }),
            ...(dmItem.history || []),
          ].slice(0, 100),
          updatedAt: issuedAt,
        };
      });

      const nextReservations = (item.reservations || []).map((reservation) => (
        reservation.id === reservationMetadata.reservationId
          ? {
              ...reservation,
              status: "issued",
              issuedAt,
              releaseMethod: useOverride ? "override" : "release_code",
              overrideMetadata,
              releaseMetadata,
            }
          : reservation
      ));
      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        reservations: nextReservations,
        updatedAt: issuedAt,
      });

      return appendMovement(nextItem, createMovementRecord({
        organizationId,
        item,
        type: "issue_to_production",
        quantity: 1,
        state: "reserved",
        performedBy,
        note: issueForm.note.trim() || "Výdej rezervovaného DM kusu do výroby.",
        metadata: {
          fromReservation: true,
          reservationId: reservationMetadata.reservationId,
          job: issueForm.job.trim() || reservationMetadata.job || "",
          machine: issueForm.machine.trim() || reservationMetadata.machine || "",
          dmCode: selectedDmItem.dmCode,
          quickId: selectedDmItem.quickId,
          previousStatus: reservationMetadata.previousStatus || "",
          releaseMethod: useOverride ? "override" : "release_code",
          overrideMetadata,
          releaseMetadata,
          issuedAt,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setIssueForm(createIssueForm());
    setIssueDmGroup("");
    setIssueMessage(useOverride
      ? `Rezervovaný kus QID ${selectedDmItem.quickId || "bez QID"} / DM ${selectedDmItem.dmCode} byl vydán override výdejem.`
      : `Rezervovaný kus QID ${selectedDmItem.quickId || "bez QID"} / DM ${selectedDmItem.dmCode} byl uvolněn kódem a vydán do výroby.`);
  };

  const reportStockDifference = () => {
    if (!selectedIssueItem) {
      setIssueMessage("Vyberte položku pro ohlášení rozdílu ve skladu.");
      return;
    }

    const stock = getItemStockSummary(selectedIssueItem);
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
    setReturnDmGroupOpen(false);
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

    const isDmReturn = Boolean(selectedReturnItem.tenantSettings?.dmEnabled);
    const selectedDmItem = isDmReturn ? findDmItemInItemByCodeOrQuickId(selectedReturnItem, returnForm.dmQuery) : null;

    if (isDmReturn && !returnForm.dmQuery.trim()) {
      setReturnMessage("Načtěte nebo zadejte DM/QID kus.");
      return;
    }

    if (isDmReturn && !selectedDmItem) {
      setReturnMessage("DM/QID kus nebyl nalezen.");
      return;
    }

    if (isDmReturn && selectedDmItem.status !== "production") {
      setReturnMessage("Kus není vedený ve výrobě.");
      return;
    }

    const quantity = isDmReturn ? 1 : Number(returnForm.quantity);
    if (!isDmReturn && (!Number.isFinite(quantity) || quantity <= 0)) {
      setReturnMessage("Zadejte kladný počet kusů pro návrat.");
      return;
    }

    const currentStock = getItemStockSummary(selectedReturnItem);
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

      const stock = getItemStockSummary(item);
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

      const nextDmStatus = returnForm.decision === "return_used"
        ? "used"
        : returnForm.decision === "send_sharpening"
          ? "sharpening"
          : returnForm.decision === "scrap_carbide"
            ? "scrapped"
            : "blocked";
      const nextDmLocation = returnForm.decision === "return_used"
        ? "main_warehouse"
        : returnForm.decision === "send_sharpening"
          ? "sharpening_collection"
          : "black_box";
      const returnedDmCodes = [];
      const nextDmItems = item.tenantSettings?.dmEnabled
        ? (item.dmItems || []).map((dmItem) => {
            if (dmItem.dmCode !== selectedDmItem.dmCode) {
              return dmItem;
            }

            returnedDmCodes.push(dmItem.dmCode);

            const returnMetadata = {
              returnedAt: returnForm.returnedAt || getTodayDate(),
              decision: returnForm.decision,
              decisionLabel: RETURN_DECISION_LABELS[returnForm.decision],
              performedBy: returnForm.performedBy.trim() || DEFAULT_INTAKE_OPERATOR,
              note: returnForm.note.trim(),
              costCenter: returnForm.costCenter.trim(),
              machine: returnForm.machine.trim(),
              job: returnForm.job.trim(),
            };

            return {
              ...dmItem,
              status: nextDmStatus,
              location: nextDmLocation,
              sharpeningDispatchStatus: nextDmStatus === "sharpening" ? "waiting" : dmItem.sharpeningDispatchStatus,
              sharpeningDispatchMetadata: nextDmStatus === "sharpening" ? null : dmItem.sharpeningDispatchMetadata,
              blockedReason: nextDmStatus === "blocked" ? returnForm.blockReason.trim() || returnForm.redirectInstruction.trim() || "Čeká na kontrolu." : dmItem.blockedReason,
              lastReturnMetadata: returnMetadata,
              history: [
                createDmHistoryRecord({
                  type: "dm_return_from_production",
                  note: returnForm.note.trim() || returnForm.serviceInstruction.trim() || returnForm.discardReason.trim() || returnForm.redirectInstruction.trim() || returnForm.blockReason.trim(),
                  metadata: {
                    ...returnMetadata,
                    decision: returnForm.decision,
                    previousStatus: "production",
                    nextStatus: nextDmStatus,
                    nextLocation: nextDmLocation,
                    job: returnForm.job.trim(),
                  },
                }),
                ...(dmItem.history || []),
              ].slice(0, 100),
              updatedAt: new Date().toISOString(),
            };
          })
        : item.dmItems;

      const nextItem = syncDmStockSummary({
        ...item,
        dmItems: nextDmItems,
        stockSummary: nextStock,
        updatedAt: new Date().toISOString(),
      });
      const movementType = returnForm.decision === "send_sharpening" ? "send_to_sharpening" : "return_from_production";
      const movementState = item.tenantSettings?.dmEnabled ? nextDmStatus : returnForm.decision === "send_sharpening" ? "sharpening" : "used";

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
          returnedDmCodes,
          returnedQuickId: selectedDmItem?.quickId,
        },
      }));
    });

    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    const dmReturnSuffix = selectedDmItem ? ` QID ${selectedDmItem.quickId || "bez QID"} / DM ${selectedDmItem.dmCode} byl vrácen z výroby.` : "";
    setReturnMessage(`Položka byla vrácena z výroby.${dmReturnSuffix}`);
  };

  return (
    <div style={wrap}>
      <div style={contextBar}>
        <div>
          <h1 style={compactTitle}>GSS</h1>
          <div style={contextText}>
            Firma: <strong>{organization.name}</strong> | Sklad: <strong>Hlavní sklad</strong> | Prefix: {organization.prefix || "neuvedeno"} | Stav: {labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")}
          </div>
        </div>
        <div style={contextActions}>
          <a href="/admin/organizations" style={btnTiny}>Správa firmy</a>
          <button type="button" onClick={showPlaceholder} style={btnTiny}>Kontakty</button>
          <button type="button" onClick={showPlaceholder} style={btnTiny}>Moduly / předplatné</button>
          <button type="button" onClick={showPlaceholder} style={btnTiny}>Správa skladů</button>
        </div>
      </div>
      {placeholderMessage ? <div style={errorMessage}>{placeholderMessage}</div> : null}

      {!hasGssModule ? (
        <div style={box}>
          <h2 style={subtitle}>GSS modul není pro tuto organizaci aktivní.</h2>
          <div style={muted}>
            Aktivaci modulu zatím řeší interní Gogrou správa organizací. Později bude napojená na subscription a billing.
          </div>
        </div>
      ) : (
        <>
          {showHomeSections ? (
            <div style={homeGrid}>
              <section style={box}>
                <div style={sectionEyebrow}>TERMINÁL</div>
                <h2 style={subtitle}>TERMINÁL</h2>
                <div style={leadSmall}>
                  Provádění skladových a provozních akcí nad položkami. Příjem, výdej, rezervace, návraty, broušení a další operace. Po výběru akce stačí najít položku nebo načíst kód.
                </div>
                <div style={toggleRow}>
                  <button type="button" style={btnTinyActive}>Dlaždice</button>
                  <button type="button" onClick={showPlaceholder} style={btnTiny}>Seznam</button>
                </div>
                <div style={terminalGrid}>
                  <button type="button" onClick={() => openMainPanel("intake")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Příjem</strong>
                    <span style={terminalTileText}>Nové kusy, příjem bez objednávky nebo budoucí příjem z objednávky.</span>
                  </button>
                  <button type="button" onClick={openIssuePanel} style={terminalTile}>
                    <strong style={terminalTileTitle}>Výdej</strong>
                    <span style={terminalTileText}>Výdej do výroby, včetně konkrétních DM/QID kusů a rezervací.</span>
                  </button>
                  <button type="button" onClick={openReturnPanel} style={terminalTile}>
                    <strong style={terminalTileTitle}>Návrat z výroby</strong>
                    <span style={terminalTileText}>Rozhodnutí po návratu: použitý kus, broušení, blokace nebo vyřazení.</span>
                  </button>
                  <button type="button" onClick={() => openMainPanel("reservation")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Rezervace</strong>
                    <span style={terminalTileText}>Rezervace konkrétního kusu pro zakázku nebo technologii.</span>
                  </button>
                  <button type="button" onClick={() => openMainPanel("sharpeningDispatch")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Odeslat na broušení</strong>
                    <span style={terminalTileText}>Výběr kusů ve stavu Na broušení a příprava podkladu.</span>
                  </button>
                  <button type="button" onClick={() => openMainPanel("sharpeningReturn")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Příjem z broušení</strong>
                    <span style={terminalTileText}>Návrat konkrétního DM/QID kusu po servisu.</span>
                  </button>
                  <button type="button" onClick={() => openMainPanel("serviceTerminal")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Servisní terminál</strong>
                    <span style={terminalTileText}>Zápis rozměrů po broušení a příprava štítku M-technologies.</span>
                  </button>
                  <button type="button" onClick={() => openMainPanel("dm")} style={terminalTile}>
                    <strong style={terminalTileTitle}>Načíst DM/QID</strong>
                    <span style={terminalTileText}>Rychlé načtení konkrétního kusu přes DM kód nebo QID.</span>
                  </button>
                </div>
                {placeholderMessage ? <div style={errorMessage}>{placeholderMessage}</div> : null}
              </section>

              <section style={box}>
                <div style={sectionEyebrow}>SKLADOVÉ POLOŽKY</div>
                <h2 style={subtitle}>SKLADOVÉ POLOŽKY</h2>
                <div style={leadSmall}>
                  Vyhledávání, kontrola zásob, nastavení a historie položek. Práce s kartami položek, aktivace nových položek z GPC a správa vlastních nevalidovaných položek.
                </div>
                <div style={summaryGrid}>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>Položky</div>
                    <div style={summaryValue}>{warehouseItems.length}</div>
                  </div>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>DM kusy</div>
                    <div style={summaryValue}>{dmItemCount}</div>
                  </div>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>Storage</div>
                    <div style={summaryValue}>MAIN</div>
                  </div>
                </div>
                <div style={actions}>
                  <button type="button" onClick={openWarehouseSection} style={btnPrimary}>Otevřít skladové položky</button>
                  <button type="button" onClick={() => openMainPanel("gpc")} style={btnSecondary}>Vyhledat v GPC</button>
                  <button type="button" onClick={openLocalItemForm} style={btnSecondary}>Přidat lokální položku</button>
                  <button type="button" onClick={() => openMainPanel("purchase")} style={btnSecondary}>Objednávkový návrh</button>
                  <button type="button" onClick={() => openMainPanel("overstock")} style={btnSecondary}>Nadnormativní zásoby</button>
                  <button type="button" onClick={() => openMainPanel("movements")} style={btnSecondary}>Poslední pohyby</button>
                </div>
              </section>
            </div>
          ) : null}

          {activeMainPanel === "intake" ? (
            <div style={box}>
              <div style={detailHeader}>
                <div>
                  <h2 style={subtitle}>Příjem</h2>
                  <div style={muted}>Příjem na sklad se v MVP provádí z detailu konkrétní položky přes akci Naskladnit.</div>
                </div>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
              </div>
              <div style={summaryGrid}>
                <div style={summaryItem}>
                  <div style={settingsTitle}>Bez objednávky</div>
                  <div style={meta}>
                    Najděte skladovou položku a otevřete stejné akční prostředí Naskladnit jako z detailu položky.
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
              <ClearableSearchInput
                value={warehouseSearchQuery}
                onChange={setWarehouseSearchQuery}
                onClear={() => setWarehouseSearchQuery("")}
                placeholder="Najít položku k příjmu… např. Walter ; fréza ; D12"
              />
              <div style={resultList}>
                {sortedWarehouseItems.slice(0, 8).map((item) => (
                  <div key={getItemKey(item)} style={resultItem}>
                    <div>
                      <div style={resultTitle}>{item.name || item.gpc_id || "Položka bez názvu"}</div>
                      <div style={meta}>{item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}</div>
                    </div>
                    <button type="button" onClick={() => openStockForm(item)} style={btnImport}>Naskladnit tuto položku</button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeMainPanel === "reservation" ? (
            <div style={box}>
              <div style={detailHeader}>
                <div>
                  <h2 style={subtitle}>Rezervace</h2>
                  <div style={muted}>Rezervace se v MVP provádí z detailu konkrétní skladové položky. U DM položky se vždy vybírá konkrétní DM/QID kus.</div>
                </div>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
              </div>
              <ClearableSearchInput
                value={warehouseSearchQuery}
                onChange={setWarehouseSearchQuery}
                onClear={() => setWarehouseSearchQuery("")}
                placeholder="Najít položku k rezervaci… např. Walter ; fréza ; D12"
              />
              <div style={resultList}>
                {sortedWarehouseItems.slice(0, 8).map((item) => (
                  <div key={getItemKey(item)} style={resultItem}>
                    <div>
                      <div style={resultTitle}>{item.name || item.gpc_id || "Položka bez názvu"}</div>
                      <div style={meta}>{item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}</div>
                    </div>
                    <button type="button" onClick={() => openReservationForm(item)} style={btnImport}>Rezervovat tuto položku</button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeMainPanel === "sharpeningDispatch" ? (
            <div style={box}>
              <div style={detailHeader}>
                <div>
                  <h2 style={subtitle}>Odeslat na broušení</h2>
                  <div style={muted}>Vyberte položku a konkrétní DM/QID kus ve stavu Na broušení. U kusu se připraví podklad pro servisního partnera.</div>
                </div>
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
              </div>
              <div style={resultList}>
                {warehouseItems.flatMap((item) => (item.dmItems || [])
                  .filter((dmItem) => dmItem.status === "sharpening")
                  .map((dmItem) => ({ item, dmItem }))).slice(0, 12).map(({ item, dmItem }) => (
                  <div key={`${getItemKey(item)}-${dmItem.dmCode}`} style={resultItem}>
                    <div>
                      <div style={resultTitle}>QID {dmItem.quickId || "není"} · {item.name || item.gpc_id || "Položka"}</div>
                      <div style={meta}>DM: {dmItem.dmCode} · Odeslání: {dmItem.sharpeningDispatchStatus || "waiting"}</div>
                      <DmCurrentDimensions dmItem={dmItem} compact />
                    </div>
                    <button type="button" onClick={() => openSharpeningDispatchForm(item, dmItem)} style={btnImport}>Odeslat na broušení</button>
                  </div>
                ))}
              </div>
              {warehouseItems.flatMap((item) => (item.dmItems || []).filter((dmItem) => dmItem.status === "sharpening")).length === 0 ? (
                <div style={muted}>Žádné DM kusy nejsou aktuálně ve stavu Na broušení.</div>
              ) : null}
              {sharpeningDispatchContext ? (
                <form onSubmit={saveSharpeningDispatch} style={formBox}>
                  <div style={settingsTitle}>Podklad pro broušení: QID {sharpeningDispatchContext.dmItem.quickId || "není"} · DM {sharpeningDispatchContext.dmItem.dmCode}</div>
                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      Brusírna / servisní partner
                      <input value={sharpeningDispatchForm.servicePartner} onChange={(event) => updateSharpeningDispatchForm("servicePartner", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Box / bedýnka / sběrné místo
                      <input value={sharpeningDispatchForm.collectionBox} onChange={(event) => updateSharpeningDispatchForm("collectionBox", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Datum odeslání
                      <input type="date" value={sharpeningDispatchForm.dispatchedAt} onChange={(event) => updateSharpeningDispatchForm("dispatchedAt", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Provedl
                      <input value={sharpeningDispatchForm.performedBy} onChange={(event) => updateSharpeningDispatchForm("performedBy", event.target.value)} style={input} />
                    </label>
                  </div>
                  <label style={fieldLabel}>
                    Poznámka
                    <textarea value={sharpeningDispatchForm.note} onChange={(event) => updateSharpeningDispatchForm("note", event.target.value)} style={textarea} />
                  </label>
                  {sharpeningDispatchMessage ? <div style={sharpeningDispatchMessage.includes("odeslán") ? message : errorMessage}>{sharpeningDispatchMessage}</div> : null}
                  {sharpeningDispatchTarget.dispatchText ? <textarea readOnly value={sharpeningDispatchTarget.dispatchText} style={textarea} /> : null}
                  <div style={actions}>
                    <button type="submit" style={btnImport}>Potvrdit odeslání</button>
                    <button type="button" onClick={() => setSharpeningDispatchTarget(null)} style={btnSecondary}>Zpět na Terminál</button>
                  </div>
                </form>
              ) : null}
            </div>
          ) : null}

          {activeMainPanel === "purchase" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Objednávkový návrh</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
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
            <div style={hintBox}>
              Objednávkový návrh se v GSS nesmí míchat do jednoho společného seznamu. Soft MVP ho seskupuje podle kombinace výrobce / značka z GPC + dodavatel nastavený v GSS + nákupní kanál.
            </div>

            {purchaseCandidates.length > 0 ? (
              <div style={resultList}>
                {purchaseCandidateGroups.map((group) => (
                  <div key={group.groupKey} style={settingsPanel}>
                    <div style={settingsTitle}>
                      Návrh: {group.manufacturer} + {group.supplierName}
                    </div>
                    <div style={meta}>Nákupní kanál: {group.purchaseChannel} · položek: {group.items.length}</div>
                    {group.items.map((item) => (
                      <div key={item.itemId} style={resultItem}>
                        <div>
                          <div style={resultTitle}>{item.itemName}</div>
                          <div style={meta}>
                            {item.manufacturer} · Dodavatel: {item.supplierName} · {item.supplierType} · kanál: {item.purchaseChannel}
                          </div>
                          <div style={meta}>
                            {item.gpc_id ? `GPC ID: ${item.gpc_id}` : "Bez GPC vazby"} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                          </div>
                          <div style={stateBreakdown}>
                            <span>Available: {item.available}</span>
                            <span>Min: {item.min}</span>
                            <span>Max: {item.max}</span>
                            <span>Dodací násobek: {item.supplierPackQuantity}</span>
                            <span>Systém navrhl: {getProposalSuggestedQuantity(item)}</span>
                            <span>Objednat: {getProposalOrderedQuantity(item)}</span>
                            <span>{item.status}</span>
                          </div>
                          <div style={formGrid}>
                            <label style={fieldLabel}>
                              Objednané množství
                              <input
                                type="number"
                                min="0"
                                value={item.orderedQuantity}
                                onChange={(event) => updatePurchaseDraftItem(item.itemId, "orderedQuantity", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Poznámka
                              <input
                                value={item.note}
                                onChange={(event) => updatePurchaseDraftItem(item.itemId, "note", event.target.value)}
                                style={input}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <div style={meta}>
                  Pravidlo: výrobce / značka + dodavatel položky + nákupní kanál. Každá skupina je samostatný návrh pro budoucí odeslání/export.
                </div>
                <div style={resultList}>
                  {groupPurchaseProposalItems(purchaseProposal.items).map((group) => (
                    <div key={group.groupKey} style={settingsPanel}>
                      <div style={settingsTitle}>
                        {group.manufacturer} + {group.supplierName}
                      </div>
                      <div style={meta}>Nákupní kanál: {group.purchaseChannel} · tento návrh nemíchá jiné dodavatele</div>
                      {group.items.map((item) => (
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
                            <div style={meta}>
                              {item.supplierName} · {item.supplierType} · kanál: {item.purchaseChannel} · systém navrhl {getProposalSuggestedQuantity(item)} ks · objednáno {getProposalOrderedQuantity(item)} ks · přijato {parseOrderQuantity(item.receivedQuantity, 0)} ks · zbývá {parseOrderQuantity(item.remainingQuantity, Math.max(getProposalOrderedQuantity(item) - parseOrderQuantity(item.receivedQuantity, 0), 0))} ks
                            </div>
                            <div style={formGrid}>
                              <label style={fieldLabel}>
                                Objednané množství
                                <input
                                  type="number"
                                  min="0"
                                  value={item.orderedQuantity ?? item.editedQuantity ?? item.recommendedQuantity}
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
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
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

              <ClearableSearchInput
                value={issueQuery}
                onChange={(value) => {
                  setIssueQuery(value);
                  setIssueMessage("");
                }}
                onClear={() => {
                  setIssueQuery("");
                  setIssueMessage("");
                }}
                placeholder="Hledat podle názvu, GPC ID, GTIN, interního kódu, výrobce, typu nebo rozměru"
              />

              {issueSearchTokens.length > 0 && issueResults.length === 0 ? (
                <div style={muted}>Nebyla nalezena žádná tenant skladová položka.</div>
              ) : null}

              {issueResults.length > 0 ? (
                <div style={resultList}>
                  {issueResults.map((item) => {
                    const stock = releaseLegacyOverstockReservation(getItemStockSummary(item), item.overstockReserved);
                    const selected = getItemKey(item) === issueItemKey;

                    return (
                      <div key={getItemKey(item)} style={selected ? highlightedResultItem : resultItem}>
                        <div>
                          <div style={itemWorkTitle}>{item.name || item.gpc_id}</div>
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
                  <div style={itemWorkTitle}>{selectedIssueItem.name || selectedIssueItem.gpc_id}</div>
                  <div style={meta}>Dostupné {selectedIssueStock.available} ks · {selectedIssueItem.manufacturer || "Výrobce neuveden"} · {selectedIssueItem.type || "Typ neuveden"}</div>
                  {selectedIssueItem.origin === "LOCAL" ? (
                    <div style={badgeWarning}>Lokální nevalidovaná položka · lze vydat do výroby jako tenant skladovou položku</div>
                  ) : null}
                  <div style={stateBreakdown}>
                    <span>Dostupné celkem: {selectedIssueStock.available}</span>
                    <span>Nový: {selectedIssueStock.states.new}</span>
                        <span>Nový přebroušený: {selectedIssueStock.states.resharpened_new}</span>
                        <span>Použitý: {selectedIssueStock.states.used}</span>
                        <span>Rezervované: {selectedIssueStock.reserved}</span>
                      </div>
                  <div style={hintBox}>
                    {selectedIssueItem.tenantSettings?.dmEnabled
                      ? "U DM položky musí být před výdejem vybrán konkrétní DM/QID kus."
                      : `Vybraný stav: ${ISSUE_STATE_LABELS[issueForm.preferredState]} · dostupné v tomto stavu: ${selectedIssueStock.states[issueForm.preferredState]} ks`}
                  </div>
                  {selectedIssueItem.tenantSettings?.dmEnabled ? (
                    <div style={offerInfo}>
                      Vyberte konkrétní kus přes skupinu níže, nebo zadejte / načtěte DM kód či QID čtečkou. GSS vydá pouze konkrétně identifikovaný kus, nikdy automaticky první dostupný kus.
                    </div>
                  ) : null}

                  {selectedIssueItem.tenantSettings?.dmEnabled ? (
                    <div style={formBox}>
                      <div style={settingsTitle}>Dostupné DM skupiny</div>
                      <div style={hintBox}>Vybráno {selectedIssueDmItems.length} kusů. Běžný hromadný výdej nezahrnuje rezervované kusy.</div>
                      <div style={stateBreakdown}>
                        <span>Celkem: {selectedIssueStock.available}</span>
                        <button
                          type="button"
                          onClick={() => setIssueDmGroup(issueDmGroup === "new" ? "" : "new")}
                          style={issueDmGroup === "new" ? btnImport : btnSecondary}
                        >
                          Nový: {selectedIssueStock.states.new}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIssueDmGroup(issueDmGroup === "resharpened_new" ? "" : "resharpened_new")}
                          style={issueDmGroup === "resharpened_new" ? btnImport : btnSecondary}
                        >
                          Nový přebroušený: {selectedIssueStock.states.resharpened_new}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIssueDmGroup(issueDmGroup === "used" ? "" : "used")}
                          style={issueDmGroup === "used" ? btnImport : btnSecondary}
                        >
                          Použitý: {selectedIssueStock.states.used}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIssueDmGroup(issueDmGroup === "reserved" ? "" : "reserved")}
                          style={issueDmGroup === "reserved" ? btnImport : btnSecondary}
                        >
                          Rezervované: {selectedIssueStock.reserved}
                        </button>
                      </div>
                      {issueDmGroup ? (
                        <div style={historyList}>
                          {issueDmGroupItems.length === 0 ? (
                            <div style={muted}>V této skupině nejsou dostupné DM kusy.</div>
                          ) : issueDmGroupItems.map((dmItem) => {
                            const dmSelected = selectedIssueDmCodes.includes(dmItem.dmCode);
                            const dmReserved = dmItem.status === "reserved";

                            return (
                            <div key={dmItem.id || dmItem.dmCode} style={dmSelected ? selectedDmIssueItem : historyItem}>
                              <div style={historyTitle}>QID: {dmItem.quickId || "není vygenerováno"}</div>
                              <div style={meta}>DM: {dmItem.dmCode}</div>
                              <div style={meta}>
                                Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)} · Označení: {labelFromMap(DM_MARKING_STATUS_LABELS, dmItem.markingStatus || "unmarked")}
                              </div>
                              {dmItem.status === "reserved" ? (
                                <>
                                  <div style={badgeWarning}>Release Code: {dmItem.reservationMetadata?.releaseCode || "není uložen"}</div>
                                  <div style={meta}>
                                    Původní stav: {labelFromMap(DM_STATUS_LABELS, dmItem.reservationMetadata?.previousStatus)} · Zakázka: {dmItem.reservationMetadata?.job || "neuvedeno"} · Stroj: {dmItem.reservationMetadata?.machine || "neuvedeno"} · Pro: {dmItem.reservationMetadata?.reservedFor || "neuvedeno"}
                                  </div>
                                  <div style={meta}>
                                    Vytvořeno: {dmItem.reservationMetadata?.reservedAt || "neuvedeno"} · Rezervoval: {dmItem.reservationMetadata?.reservedBy || "neuvedeno"} · Platnost do: {dmItem.reservationMetadata?.validUntil || "nenastaveno"}
                                  </div>
                                </>
                              ) : null}
                              <DmCurrentDimensions dmItem={dmItem} compact />
                              <div style={meta}>Lokace: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)}</div>
                              <div style={meta}>
                                Poslední servis: {dmItem.lastServiceAt || "neuvedeno"} · Poslední výdej: {dmItem.lastIssueMetadata?.job || dmItem.lastIssueMetadata?.machine || dmItem.lastIssueMetadata?.costCenter ? `zakázka ${dmItem.lastIssueMetadata?.job || "neuvedeno"} · stroj ${dmItem.lastIssueMetadata?.machine || "neuvedeno"}` : "neuvedeno"}
                              </div>
                              {dmItem.reservationMetadata?.reason ? <div style={meta}>Poznámka rezervace: {dmItem.reservationMetadata.reason}</div> : null}
                              <div style={actions}>
                                {dmReserved ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedIssueDmCodes([]);
                                      updateIssueForm("dmQuery", dmItem.quickId || dmItem.dmCode);
                                    }}
                                    style={btnImport}
                                  >
                                    Vybrat rezervovaný kus
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleIssueDmSelection(dmItem)}
                                    style={dmSelected ? btnImport : btnSecondary}
                                  >
                                    {dmSelected ? "Vybráno - odebrat" : "Vybrat k výdeji"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );})}
                        </div>
                      ) : null}
                      {selectedIssueDmItems.length > 0 ? (
                        <div style={message}>
                          Vybráno {selectedIssueDmItems.length} kusů:
                          <div style={stateBreakdown}>
                            {selectedIssueDmItems.map((dmItem) => (
                              <span key={dmItem.dmCode}>QID {dmItem.quickId || "bez QID"} / DM {dmItem.dmCode}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={formGrid}>
                    {selectedIssueItem.tenantSettings?.dmEnabled ? (
                      <label style={fieldLabel}>
                        Načíst / zadat DM nebo QID
                        <input
                          value={issueForm.dmQuery}
                          onChange={(event) => {
                            setSelectedIssueDmCodes([]);
                            updateIssueForm("dmQuery", event.target.value);
                          }}
                          placeholder="např. AH01-000045872-001 nebo KPL 14852"
                          style={input}
                        />
                      </label>
                    ) : (
                      <>
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
                      </>
                    )}
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

                  {selectedIssueItem.tenantSettings?.dmEnabled && issueForm.dmQuery.trim() && !selectedIssueDmItem ? (
                    <div style={errorMessage}>DM/QID kus nebyl nalezen.</div>
                  ) : null}
                  {selectedIssueItem.tenantSettings?.dmEnabled && selectedIssueDmItem && !selectedIssueDmAvailable && !selectedIssueDmReserved ? (
                    <div style={errorMessage}>Kus není dostupný pro výdej.</div>
                  ) : null}
                  {selectedIssueItem.tenantSettings?.dmEnabled && selectedIssueDmReserved ? (
                    <div style={hintBox}>
                      <div style={settingsTitle}>Vybraný rezervovaný kus</div>
                      <div style={stateBreakdown}>
                        <span>QID: {selectedIssueDmItem.quickId || "není vygenerováno"}</span>
                        <span>DM: {selectedIssueDmItem.dmCode}</span>
                        <span>Původní stav: {labelFromMap(DM_STATUS_LABELS, selectedIssueDmItem.reservationMetadata?.previousStatus)}</span>
                        <span>Zakázka: {selectedIssueDmItem.reservationMetadata?.job || "neuvedeno"}</span>
                        <span>Stroj: {selectedIssueDmItem.reservationMetadata?.machine || "neuvedeno"}</span>
                        <span>Pro: {selectedIssueDmItem.reservationMetadata?.reservedFor || "neuvedeno"}</span>
                        <span>Release Code: {selectedIssueDmItem.reservationMetadata?.releaseCode || "není uložen"}</span>
                        <span>Vytvořeno: {selectedIssueDmItem.reservationMetadata?.reservedAt || "neuvedeno"}</span>
                        <span>Rezervoval: {selectedIssueDmItem.reservationMetadata?.reservedBy || "neuvedeno"}</span>
                      </div>
                      <DmCurrentDimensions dmItem={selectedIssueDmItem} />
                      {selectedIssueDmItem.reservationMetadata?.reason ? <div style={offerInfo}>{selectedIssueDmItem.reservationMetadata.reason}</div> : null}
                      <div style={formBox}>
                        <div style={settingsTitle}>Vydat pomocí Release Code</div>
                        <div style={muted}>Rezervace chrání proti neúmyslnému výdeji. Pro standardní výdej z rezervace zadejte Release Code.</div>
                        <label style={fieldLabel}>
                          Release Code
                          <input
                            value={issueForm.releaseCode}
                            onChange={(event) => updateIssueForm("releaseCode", event.target.value.toUpperCase())}
                            placeholder="např. A7K2"
                            style={input}
                          />
                        </label>
                      </div>
                      <div style={formBox}>
                        <div style={settingsTitle}>Override výdej</div>
                        <div style={muted}>Použijte pouze pokud je nutné rezervaci obejít. Důvod se uloží do historie kusu.</div>
                        <label style={fieldLabel}>
                          Důvod override výdeje
                          <textarea
                            value={issueForm.overrideReason}
                            onChange={(event) => updateIssueForm("overrideReason", event.target.value)}
                            placeholder="Např. výroba má prioritu, rezervující osoba souhlasila telefonicky."
                            style={textarea}
                          />
                        </label>
                      </div>
                      <div style={actions}>
                        <button type="button" onClick={issueReservedDmToProduction} style={btnImport}>Vydat rezervovaný kus</button>
                      </div>
                    </div>
                  ) : null}
                  {selectedIssueItem.tenantSettings?.dmEnabled && selectedIssueDmItem && selectedIssueDmAvailable ? (
                    <div style={hintBox}>
                      <div style={settingsTitle}>Vybraný kus k výdeji</div>
                      <div style={stateBreakdown}>
                        <span>QID: {selectedIssueDmItem.quickId || "není vygenerováno"}</span>
                        <span>DM: {selectedIssueDmItem.dmCode}</span>
                        <span>Stav: {labelFromMap(DM_STATUS_LABELS, selectedIssueDmItem.status)}</span>
                        <span>Lokace: {labelFromMap(DM_LOCATION_LABELS, selectedIssueDmItem.location)}</span>
                      </div>
                      <DmCurrentDimensions dmItem={selectedIssueDmItem} />
                    </div>
                  ) : null}

                  <div style={offerInfo}>
                    V MVP jsou dimenze textová pole. Později se budou vybírat z hodnot definovaných v administraci firmy.
                  </div>
                  <div style={offerInfo}>
                    Výdej sníží dostupné množství, zvýší množství ve výrobě a nikdy nevydává kusy ve stavu Na broušení.
                  </div>
                  <div style={hintBox}>
                    Výdej nad systémovou zásobu není v MVP povolený. Pokud fyzicky vidíte více kusů než systém, použijte Ohlásit rozdíl ve skladu. Budoucí override pro vyšší roli bude doplněn později.
                  </div>

                  {issueMessage ? <div style={issueMessage.includes("vydána") || issueMessage.includes("vydán") || issueMessage.includes("uvolněn") || issueMessage.includes("ohlášen") ? message : errorMessage}>{issueMessage}</div> : null}

                  <div style={actions}>
                    <button
                      type="submit"
                      disabled={selectedIssueItem.tenantSettings?.dmEnabled && selectedIssueDmItems.length === 0 && !selectedIssueDmAvailable}
                      style={selectedIssueItem.tenantSettings?.dmEnabled && selectedIssueDmItems.length === 0 && !selectedIssueDmAvailable ? btnDisabled : btnImport}
                    >
                      {selectedIssueItem.tenantSettings?.dmEnabled
                        ? selectedIssueDmItems.length > 0 ? "Vydat vybrané kusy" : "Vydat tento kus"
                        : "Vydat do výroby"}
                    </button>
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
                        setIssueDmGroup("");
                        setSelectedIssueDmCodes([]);
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
                <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
              </div>
              <div style={hintBox}>
                Návrat z výroby je samostatný GSS pohyb. Po návratu musí být vždy rozhodnuto, co se s položkou stane dál.
              </div>
              <div style={muted}>
                U položek bez DM trackingu se pracuje s agregovaným množstvím. U DM položek musí být návrat vždy navázaný na konkrétní DM/QID kus.
              </div>

              <ClearableSearchInput
                value={returnQuery}
                onChange={(value) => {
                  setReturnQuery(value);
                  setReturnMessage("");
                }}
                onClear={() => {
                  setReturnQuery("");
                  setReturnMessage("");
                }}
                placeholder="Hledat podle názvu, GPC ID, GTIN, interního kódu, výrobce, typu nebo rozměru"
              />

              {normalizedReturnQuery && returnResults.length === 0 ? (
                <div style={muted}>Nebyla nalezena žádná tenant skladová položka.</div>
              ) : null}

              {returnResults.length > 0 ? (
                <div style={resultList}>
                  {returnResults.map((item) => {
                    const stock = getItemStockSummary(item);
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
                  <div style={itemWorkTitle}>{selectedReturnItem.name || selectedReturnItem.gpc_id}</div>
                  <div style={meta}>Ve výrobě {getItemStockSummary(selectedReturnItem).production} ks · {selectedReturnItem.manufacturer || "Výrobce neuveden"} · {selectedReturnItem.type || "Typ neuveden"}</div>
                  {selectedReturnItem.tenantSettings?.dmEnabled ? (
                    <div style={offerInfo}>
                      Vyberte konkrétní kus ze seznamu `Ve výrobě`, nebo zadejte / načtěte DM kód či QID čtečkou. GSS vrátí pouze konkrétně identifikovaný kus vedený ve výrobě.
                    </div>
                  ) : null}

                  {selectedReturnItem.tenantSettings?.dmEnabled ? (
                    <div style={formBox}>
                      <div style={settingsTitle}>Kusy ve výrobě</div>
                      <div style={stateBreakdown}>
                        <button
                          type="button"
                          onClick={() => setReturnDmGroupOpen((current) => !current)}
                          style={returnDmGroupOpen ? btnImport : btnSecondary}
                        >
                          Ve výrobě: {returnProductionDmItems.length}
                        </button>
                      </div>
                      {returnDmGroupOpen ? (
                        <div style={historyList}>
                          {returnProductionDmItems.length === 0 ? (
                            <div style={muted}>Tato položka nemá žádné DM kusy vedené ve výrobě.</div>
                          ) : returnProductionDmItems.map((dmItem) => (
                            <div key={dmItem.id || dmItem.dmCode} style={historyItem}>
                              <div style={historyTitle}>QID: {dmItem.quickId || "není vygenerováno"}</div>
                              <div style={meta}>DM: {dmItem.dmCode}</div>
                              <div style={meta}>
                                Lokace: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)} · Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)}
                              </div>
                              <div style={meta}>
                                Stroj: {dmItem.lastIssueMetadata?.machine || "neuvedeno"} · Zakázka: {dmItem.lastIssueMetadata?.job || "neuvedeno"} · Středisko: {dmItem.lastIssueMetadata?.costCenter || "neuvedeno"}
                              </div>
                              <div style={meta}>
                                Datum výdeje: {dmItem.lastIssueMetadata?.issuedAt || "neuvedeno"} · Provedl: {dmItem.lastIssueMetadata?.performedBy || "neuvedeno"}
                              </div>
                              <div style={actions}>
                                <button
                                  type="button"
                                  onClick={() => updateReturnForm("dmQuery", dmItem.quickId || dmItem.dmCode)}
                                  style={btnImport}
                                >
                                  Vybrat tento kus
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={formGrid}>
                    {selectedReturnItem.tenantSettings?.dmEnabled ? (
                      <label style={fieldLabel}>
                        Načíst / zadat DM nebo QID
                        <input
                          value={returnForm.dmQuery}
                          onChange={(event) => updateReturnForm("dmQuery", event.target.value)}
                          placeholder="např. AH01-000045872-001 nebo KPL 14852"
                          style={input}
                        />
                      </label>
                    ) : (
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
                    )}
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

                  {selectedReturnItem.tenantSettings?.dmEnabled && returnForm.dmQuery.trim() && !selectedReturnDmItem ? (
                    <div style={errorMessage}>DM/QID kus nebyl nalezen.</div>
                  ) : null}
                  {selectedReturnItem.tenantSettings?.dmEnabled && selectedReturnDmItem && !selectedReturnDmValid ? (
                    <div style={errorMessage}>Kus není vedený ve výrobě.</div>
                  ) : null}
                  {selectedReturnItem.tenantSettings?.dmEnabled && selectedReturnDmItem && selectedReturnDmValid ? (
                    <div style={hintBox}>
                      <div style={settingsTitle}>Vybraný kus k návratu</div>
                      <div style={stateBreakdown}>
                        <span>QID: {selectedReturnDmItem.quickId || "není vygenerováno"}</span>
                        <span>DM: {selectedReturnDmItem.dmCode}</span>
                        <span>Stav: {labelFromMap(DM_STATUS_LABELS, selectedReturnDmItem.status)}</span>
                        <span>Poslední výdej: {selectedReturnDmItem.lastIssueMetadata?.job || selectedReturnDmItem.lastIssueMetadata?.machine || selectedReturnDmItem.lastIssueMetadata?.costCenter ? `zakázka ${selectedReturnDmItem.lastIssueMetadata?.job || "neuvedeno"} · stroj ${selectedReturnDmItem.lastIssueMetadata?.machine || "neuvedeno"} · středisko ${selectedReturnDmItem.lastIssueMetadata?.costCenter || "neuvedeno"}` : "neuvedeno"}</span>
                      </div>
                      <DmCurrentDimensions dmItem={selectedReturnDmItem} />
                    </div>
                  ) : null}

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
                    <button
                      type="submit"
                      disabled={selectedReturnItem.tenantSettings?.dmEnabled && !selectedReturnDmValid}
                      style={selectedReturnItem.tenantSettings?.dmEnabled && !selectedReturnDmValid ? btnDisabled : btnImport}
                    >
                      Potvrdit návrat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReturnItemKey("");
                        setReturnForm(createReturnForm());
                        setReturnMessage("");
                        setReturnDmGroupOpen(false);
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
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
            </div>
            <div style={hintBox}>
              Vyhledejte validovanou položku v GPC a převeďte ji do svého skladu.
            </div>
            <div style={muted}>
              GPC zůstává validovaná master databanka. Převzetím vznikne lokální tenant skladová položka v GSS.
            </div>
            <ClearableSearchInput
              value={gpcQuery}
              onChange={(value) => {
                setGpcQuery(value);
                setImportMessage("");
              }}
              onClear={() => {
                setGpcQuery("");
                setImportMessage("");
              }}
              placeholder="Hledat podle názvu, GPC ID, GTIN, výrobce nebo typu"
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
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
            </div>
            <div style={hintBox}>
              Ruční MVP vstup pro DM kód. Později bude napojený na čtečku a automaticky otevře konkrétní kus.
            </div>
            <div style={formGrid}>
              <label style={fieldLabel}>
                DM kód
                <ClearableSearchInput
                  value={dmCodeQuery}
                  onChange={(value) => {
                    setDmCodeQuery(value);
                    setDmSearchMessage("");
                  }}
                  onClear={() => {
                    setDmCodeQuery("");
                    setDmSearchMessage("");
                  }}
                  placeholder="např. AH01-000045872-001"
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

          {activeMainPanel === "serviceTerminal" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Servisní terminál M-technologies</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
            </div>
            <div style={hintBox}>
              Soft MVP servisní pohled. M-technologies načte DM, zapíše nové rozměry po broušení a připraví štítek. GPC master data se nemění.
            </div>
            <div style={formGrid}>
              <label style={fieldLabel}>
                Načíst / zadat DM kód
                <ClearableSearchInput
                  value={serviceTerminalQuery}
                  onChange={(value) => {
                    setServiceTerminalQuery(value);
                    setServiceTerminalMessage("");
                  }}
                  onClear={() => {
                    setServiceTerminalQuery("");
                    setServiceTerminalMessage("");
                  }}
                  placeholder="např. AH01-000045872-001"
                />
              </label>
            </div>
            <div style={actions}>
              <button type="button" onClick={loadServiceTerminalDm} style={btnImport}>Načíst DM</button>
            </div>
            {serviceTerminalMessage ? (
              <div style={serviceTerminalMessage.includes("uloženy") || serviceTerminalMessage.includes("načten") ? message : errorMessage}>{serviceTerminalMessage}</div>
            ) : null}

            {serviceTerminalContext ? (
              <div style={settingsPanel}>
                <div style={settingsTitle}>Servisovaný DM kus</div>
                <div style={quickIdValue}>QID: {serviceTerminalContext.dmItem.quickId || "není vygenerováno"}</div>
                <div style={resultTitle}>{serviceTerminalContext.item.name || serviceTerminalContext.item.gpc_id || "Položka"}</div>
                <div style={meta}>
                  DM: {serviceTerminalContext.dmItem.dmCode} · GPC ID: {serviceTerminalContext.item.gpc_id || "lokální položka"} · GTIN: {serviceTerminalContext.item.gtin || "neuvedeno"}
                </div>
                <div style={meta}>
                  Zákazník: {organization.name || "neuvedeno"} · Stav: {labelFromMap(DM_STATUS_LABELS, serviceTerminalContext.dmItem.status)} · Odeslání: {serviceTerminalContext.dmItem.sharpeningDispatchStatus || "waiting"}
                </div>
                <div style={summaryGrid}>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>D před broušením</div>
                    <div style={summaryValue}>{serviceTerminalContext.dmItem.currentDiameter || "neuvedeno"}</div>
                  </div>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>L1 před broušením</div>
                    <div style={summaryValue}>{serviceTerminalContext.dmItem.currentLength || "neuvedeno"}</div>
                  </div>
                  <div style={summaryItem}>
                    <div style={summaryLabel}>Přebroušení</div>
                    <div style={summaryValue}>{serviceTerminalContext.dmItem.sharpeningCount || 0}/{serviceTerminalContext.dmItem.maxSharpeningCount || "nenastaveno"}</div>
                  </div>
                </div>
                <div style={offerInfo}>
                  Poslední výdej: {serviceTerminalContext.dmItem.lastIssueMetadata?.job || "neuvedeno"} · Poslední návrat: {serviceTerminalContext.dmItem.lastReturnMetadata?.decisionLabel || "neuvedeno"}
                </div>
                <div style={offerInfo}>
                  Pokyny: {serviceTerminalContext.item.tenantSettings?.sharpen?.note || serviceTerminalContext.dmItem.serviceNote || "neuvedeno"} · Výkres: {serviceTerminalContext.dmItem.drawingUrl || serviceTerminalContext.item.tenantSettings?.drawingReference || "neuvedeno"} · Povlak: {serviceTerminalContext.dmItem.coating || serviceTerminalContext.item.tenantSettings?.coatingNote || "neuvedeno"}
                </div>
                <div style={historyPanel}>
                  <div style={settingsTitle}>Historie kusu</div>
                  {(serviceTerminalContext.dmItem.history || []).slice(0, 5).map((history) => (
                    <div key={history.id} style={historyItem}>
                      <div style={historyTitle}>{history.type} · {history.createdAt || "datum neuvedeno"}</div>
                      {history.note ? <div style={meta}>{history.note}</div> : null}
                    </div>
                  ))}
                </div>

                <form onSubmit={saveServiceTerminalChanges} style={formBox}>
                  <div style={settingsTitle}>Změna parametrů po broušení</div>
                  {!serviceTerminalDmReady ? (
                    <div style={errorMessage}>Kus není vedený jako odeslaný na broušení.</div>
                  ) : null}
                  <div style={formGrid}>
                    <label style={fieldLabel}>
                      D
                      <input value={serviceTerminalForm.currentDiameter} onChange={(event) => updateServiceTerminalForm("currentDiameter", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      L1
                      <input value={serviceTerminalForm.currentLength} onChange={(event) => updateServiceTerminalForm("currentLength", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      L2
                      <input value={serviceTerminalForm.currentOverallLength} onChange={(event) => updateServiceTerminalForm("currentOverallLength", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Provedl
                      <input value={serviceTerminalForm.performedBy} onChange={(event) => updateServiceTerminalForm("performedBy", event.target.value)} style={input} />
                    </label>
                    <label style={fieldLabel}>
                      Datum servisu
                      <input type="date" value={serviceTerminalForm.serviceDate} onChange={(event) => updateServiceTerminalForm("serviceDate", event.target.value)} style={input} />
                    </label>
                  </div>
                  <label style={fieldLabel}>
                    Další parametry
                    <textarea value={serviceTerminalForm.additionalParameters} onChange={(event) => updateServiceTerminalForm("additionalParameters", event.target.value)} style={textarea} />
                  </label>
                  <label style={fieldLabel}>
                    Servisní poznámka
                    <textarea value={serviceTerminalForm.serviceNote} onChange={(event) => updateServiceTerminalForm("serviceNote", event.target.value)} style={textarea} />
                  </label>
                  <div style={actions}>
                    <button type="submit" style={btnImport}>Uložit změny</button>
                  </div>
                </form>

                <div style={formBox}>
                  <div style={settingsTitle}>Štítek nástroje</div>
                  <div style={muted}>
                    Po změně parametrů po broušení vytiskněte nový štítek s aktuálními rozměry. QID je hlavní fyzická orientace kusu.
                  </div>
                  <div style={actions}>
                    <button type="button" onClick={() => setShowServiceLabelPreview((current) => !current)} style={btnSecondary}>
                      {showServiceLabelPreview ? "Skrýt štítek" : "Zobrazit štítek"}
                    </button>
                    <button
                      type="button"
                      onClick={() => printDmLabel(serviceTerminalContext.item, serviceTerminalContext.dmItem, "servisní terminál")}
                      style={btnImport}
                    >
                      Tisk štítku
                    </button>
                  </div>
                  {showServiceLabelPreview ? (
                    <>
                      <ToolLabelPreview item={serviceTerminalContext.item} dmItem={serviceTerminalContext.dmItem} source="servisní terminál" />
                      <textarea readOnly value={createServiceLabelText(serviceTerminalContext.item, serviceTerminalContext.dmItem)} style={textarea} />
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          ) : null}

          {activeMainPanel === "sharpeningReturn" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Příjem z broušení</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
            </div>
            <div style={hintBox}>
              Příjem z broušení vrací konkrétní DM/QID kus zpět do skladu. Aktuální rozměry zůstávají ty, které zadal servisní terminál M-technologies.
            </div>
            <div style={stateBreakdown}>
              <button type="button" onClick={() => setSharpeningReturnGroup(sharpeningReturnGroup === "sent" ? "" : "sent")} style={sharpeningReturnGroup === "sent" ? btnImport : btnSecondary}>
                Odesláno na broušení: {sharpeningReturnGroups.sent.length}
              </button>
              <button type="button" onClick={() => setSharpeningReturnGroup(sharpeningReturnGroup === "serviced" ? "" : "serviced")} style={sharpeningReturnGroup === "serviced" ? btnImport : btnSecondary}>
                Servis dokončen / čeká na příjem: {sharpeningReturnGroups.serviced.length}
              </button>
            </div>
            {sharpeningReturnGroup ? (
              <div style={historyList}>
                {selectedSharpeningReturnGroupItems.length === 0 ? (
                  <div style={muted}>V této skupině nejsou žádné DM kusy.</div>
                ) : selectedSharpeningReturnGroupItems.map(({ item, dmItem }) => (
                  <div key={dmItem.id || dmItem.dmCode} style={historyItem}>
                    <div style={historyTitle}>QID: {dmItem.quickId || "není vygenerováno"} · {item.name || item.gpc_id || "Položka"}</div>
                    <div style={meta}>DM: {dmItem.dmCode} · Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)} · Odeslání: {dmItem.sharpeningDispatchStatus || "waiting"}</div>
                    <div style={meta}>Brusírna: {dmItem.sharpeningDispatchMetadata?.servicePartner || DEFAULT_GRINDER} · odesláno {dmItem.sharpeningDispatchMetadata?.dispatchedAt || "neuvedeno"} · servis {dmItem.lastServiceMetadata?.servicedAt || "neuvedeno"}</div>
                    <DmCurrentDimensions dmItem={dmItem} compact />
                    <div style={actions}>
                      <button type="button" onClick={() => updateSharpeningReturnForm("dmQuery", dmItem.quickId || dmItem.dmCode)} style={btnImport}>Přijmout zpět na sklad</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <form onSubmit={receiveFromSharpening} style={settingsPanel}>
              <div style={settingsTitle}>Přijmout konkrétní DM/QID kus</div>
              <div style={formGrid}>
                <label style={fieldLabel}>
                  DM nebo QID
                  <input value={sharpeningReturnForm.dmQuery} onChange={(event) => updateSharpeningReturnForm("dmQuery", event.target.value)} style={input} />
                </label>
                <label style={fieldLabel}>
                  Datum příjmu
                  <input type="date" value={sharpeningReturnForm.receivedAt} onChange={(event) => updateSharpeningReturnForm("receivedAt", event.target.value)} style={input} />
                </label>
                <label style={fieldLabel}>
                  Provedl
                  <input value={sharpeningReturnForm.performedBy} onChange={(event) => updateSharpeningReturnForm("performedBy", event.target.value)} style={input} />
                </label>
                <label style={fieldLabel}>
                  Cílový sklad / lokace
                  <select value={sharpeningReturnForm.location} onChange={(event) => updateSharpeningReturnForm("location", event.target.value)} style={input}>
                    <option value="main_warehouse">Hlavní sklad</option>
                    <option value="unknown">Neznámé</option>
                  </select>
                </label>
              </div>
              {sharpeningReturnContext ? (
                <div style={message}>
                  Vybraný kus: QID {sharpeningReturnContext.dmItem.quickId || "není vygenerováno"} · DM {sharpeningReturnContext.dmItem.dmCode} · stav {labelFromMap(DM_STATUS_LABELS, sharpeningReturnContext.dmItem.status)} · servis {sharpeningReturnContext.dmItem.sharpeningDispatchStatus || "waiting"}
                  <DmCurrentDimensions dmItem={sharpeningReturnContext.dmItem} />
                </div>
              ) : sharpeningReturnForm.dmQuery ? (
                <div style={errorMessage}>DM/QID kus nebyl nalezen.</div>
              ) : null}
              {sharpeningReturnContext && sharpeningReturnContext.dmItem.sharpeningDispatchStatus !== "serviced" ? (
                <div style={errorMessage}>
                  U tohoto kusu nejsou uložené servisní rozměry z brusírny.
                  <label style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={sharpeningReturnForm.confirmWithoutService}
                      onChange={(event) => updateSharpeningReturnForm("confirmWithoutService", event.target.checked)}
                    />
                    Přijmout i bez servisních rozměrů
                  </label>
                </div>
              ) : null}
              <label style={fieldLabel}>
                Poznámka k příjmu
                <textarea value={sharpeningReturnForm.note} onChange={(event) => updateSharpeningReturnForm("note", event.target.value)} style={textarea} />
              </label>
              {sharpeningReturnMessage ? <div style={sharpeningReturnMessage.includes("přijat") ? message : errorMessage}>{sharpeningReturnMessage}</div> : null}
              <div style={actions}>
                <button type="submit" style={btnImport}>Potvrdit příjem z broušení</button>
              </div>
            </form>
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
                onGenerateQuickId={generateQuickIdForSelectedDm}
                onMarkDmItem={() => markDmItemAsPhysicallyMarked(getItemKey(selectedDmContext.item), selectedDmContext.dmItem.dmCode)}
                onPrintLabel={(source) => printDmLabel(selectedDmContext.item, selectedDmContext.dmItem, source)}
                onClose={() => closeItemDetails(selectedDmContext.item)}
                onPlaceholder={showPlaceholder}
              />
            </div>
          ) : null}

          {showWarehouseSection ? (
          <div ref={warehouseSectionRef} style={warehouseHighlighted ? highlightedBox : box}>
            <div style={stickyWarehouseBar}>
              <button type="button" onClick={backToMainGss} style={btnTinyActive}>Zpět na hlavní GSS</button>
              {selectedWarehouseItem ? (
                <button type="button" onClick={() => closeWarehouseItemDetail(selectedWarehouseItem)} style={btnTiny}>Zpět na skladové položky</button>
              ) : null}
            </div>
            <h2 style={subtitle}>Skladové položky</h2>
            {!selectedWarehouseItem ? (
              <>
                <ClearableSearchInput
                  value={warehouseSearchQuery}
                  onChange={setWarehouseSearchQuery}
                  onClear={() => setWarehouseSearchQuery("")}
                  placeholder="Vyhledat skladovou položku… např. Walter ; fréza ; D12 ; 4z"
                />
                <div style={muted}>
                  Více kritérií oddělte čárkou nebo středníkem. Např. Walter ; fréza ; D12 ; 4z.
                  Později zde bude GINA/AI vyhledávání: např. Najdi frézu D12, 4 zuby, délka břitu min. 25.
                </div>
                <div style={toggleRow}>
                  <button
                    type="button"
                    onClick={() => setWarehouseSortMode("frequent")}
                    style={warehouseSortMode === "frequent" ? btnTinyActive : btnTiny}
                  >
                    Nejčastější
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarehouseSortMode("recent")}
                    style={warehouseSortMode === "recent" ? btnTinyActive : btnTiny}
                  >
                    Poslední použití
                  </button>
                </div>
                <div style={muted}>Symbol ◢ znamená, že údaj má rozpad na konkrétní DM/QID kusy.</div>
              </>
            ) : null}
            {warehouseItems.length === 0 ? (
              <div style={muted}>Tenant sklad zatím neobsahuje žádné položky převzaté z GPC.</div>
            ) : !selectedWarehouseItem && sortedWarehouseItems.length === 0 ? (
              <div style={muted}>Žádná skladová položka neodpovídá zadaným kritériím.</div>
            ) : (
              <div style={resultList}>
                {(selectedWarehouseItem ? [selectedWarehouseItem] : sortedWarehouseItems).map((item) => {
                  const itemKey = getItemKey(item);
                  const stock = getItemStockSummary(item);
                  const activeReservations = getActiveReservations(item);
                  const overstockOffer = item.overstockOffer;
                  const overstockIsActive = Boolean(overstockOffer?.enabled && overstockOffer.status === "active");
                  const overstockAlert = getOverstockAlertMessage(overstockOffer);
                  const dmMark = item.tenantSettings?.dmEnabled ? " ◢" : "";
                  const hasItemActionOpen = [
                    settingsItemKey,
                    stockItemKey,
                    reservationItemKey,
                    overstockItemKey,
                    dmFormItemKey,
                  ].includes(itemKey);

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
                            <span>Celkem {stock.total}{dmMark}</span>
                            <span>Dostupné {stock.available}{dmMark}</span>
                            <span>Nový {stock.states.new}{dmMark}</span>
                            <span>Nový přebroušený {stock.states.resharpened_new}{dmMark}</span>
                            <span>Použitý {stock.states.used}{dmMark}</span>
                            <span>Rezervované {stock.reserved}{dmMark}</span>
                            <span>Ve výrobě {stock.production}{dmMark}</span>
                            <span>Na broušení {stock.sharpening}{dmMark}</span>
                            <span>Blokované {getDmSummaryCounts(item).blocked}{dmMark}</span>
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
                      <div style={itemDetailTitle}>{item.name || item.gpc_id}</div>
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
                        {item.tenantSettings?.dmEnabled ? "Zásoba podle DM kusů" : "Zásoba"}: celkem {stock.total} · dostupné {stock.available} · rezervace {stock.reserved} · výroba {stock.production} · broušení {stock.sharpening}
                      </div>
                      <div style={stateBreakdown}>
                        <span>Nový: {stock.states.new}</span>
                        <span>Nový přebroušený: {stock.states.resharpened_new}</span>
                        <span>Použitý: {stock.states.used}</span>
                        <span>Rezervované: {stock.reserved}</span>
                        <span>Na broušení: {stock.states.sharpening}</span>
                        <span>Ve výrobě: {stock.production}</span>
                      </div>
                      {hasItemActionOpen ? (
                        <div style={hintBox}>
                          Akční režim položky. Zobrazuji pouze stručnou identitu, základní skladové počty, DM/QID informaci a aktivní akční panel.
                        </div>
                      ) : null}
                      {!hasItemActionOpen ? (
                      <>
                      {activeReservations.length > 0 ? (
                        <div style={historyPanel}>
                          <div style={settingsTitle}>Rezervace</div>
                          {activeReservations.map((reservation) => (
                            <div key={reservation.id} style={historyItem}>
                              <div style={historyTitle}>
                                Zakázka {reservation.job} · {reservation.quantity} ks · {ISSUE_STATE_LABELS[reservation.state] || reservation.state}
                              </div>
                              <div style={meta}>
                                Release Code {reservation.releaseCode || "není uložen"} · vytvořeno {reservation.reservedAt || reservation.createdAt || "neuvedeno"} · rezervoval {reservation.reservedBy || "neuvedeno"} · platnost do {reservation.validUntil || "nenastaveno"}
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
                      <div style={hintBox}>◢ = konkrétní DM/QID kusy. Klikněte na stav v DM zásobě a otevře se rozpad na konkrétní kusy.</div>
                      <div style={historyPanel}>
                        <div style={settingsTitle}>Nastavení položky - souhrn</div>
                        <div style={meta}>
                          Min: {item.tenantSettings?.min || "nenastaveno"} · Max: {item.tenantSettings?.max || "nenastaveno"} · Warning: {item.tenantSettings?.warning || "nenastaveno"}
                        </div>
                        <div style={meta}>
                          Dodavatel: {item.tenantSettings?.supplierName || "Gogrou"} · {item.tenantSettings?.supplierType || "Gogrou partner"} · Dodací násobek: {item.tenantSettings?.supplierPackQuantity || 1}
                        </div>
                        <div style={meta}>
                          Brousitelnost: {item.tenantSettings?.sharpen?.enabled ? "ano" : "ne"} · Max přebroušení: {item.tenantSettings?.sharpen?.cycles || "nenastaveno"} · DM tracking: {item.tenantSettings?.dmEnabled ? "ano" : "ne"}
                        </div>
                        <div style={meta}>
                          Výkres / příloha: {item.tenantSettings?.drawingReference || "nenastaveno"} · Povlak: {item.tenantSettings?.coatingNote || "nenastaveno"}
                        </div>
                        <div style={meta}>
                          Poznámka k broušení: {item.tenantSettings?.sharpen?.note || "nenastaveno"} · Lokální poznámka: {item.tenantSettings?.localNote || "nenastaveno"}
                        </div>
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
                        <button type="button" onClick={() => setShowItemHistory(!showItemHistory)} style={btnSecondary}>Historie pohybů</button>
                        <button
                          type="button"
                          onClick={() => setGpcDetailItemKey(gpcDetailItemKey === itemKey ? "" : itemKey)}
                          style={gpcDetailItemKey === itemKey ? btnImport : btnSecondary}
                        >
                          Zobrazit GPC detail
                        </button>
                        {gpcDetailItemKey === itemKey ? (
                          <div style={itemActionFullWidth}>
                            <GpcDetailPanel item={item} />
                          </div>
                        ) : null}
                        <button type="button" onClick={() => openTerminalForItem("intake", item)} style={btnSecondary}>Příjem / naskladnit</button>
                        <button type="button" onClick={() => openTerminalForItem("issue", item)} style={btnSecondary}>Výdej</button>
                        <button type="button" onClick={() => openTerminalForItem("return", item)} style={btnSecondary}>Návrat z výroby</button>
                        <button type="button" onClick={() => openTerminalForItem("reservation", item)} style={btnSecondary}>Rezervovat</button>
                        <button type="button" onClick={() => openTerminalForItem("overstock", item)} style={btnSecondary}>Nadnormativa</button>
                        <button type="button" onClick={showPlaceholder} style={btnSecondary}>Připravuje se: detail</button>
                      </div>
                      {item.tenantSettings?.dmEnabled && reservationItemKey !== getItemKey(item) ? (
                        <div style={historyPanel}>
                          <div style={settingsTitle}>DM zásoba</div>
                          {(item.dmItems || []).length === 0 ? (
                            <div style={muted}>Zatím nejsou vytvořené žádné DM kusy.</div>
                          ) : (
                            <div>
                              {(() => {
                                const dmCounts = getDmSummaryCounts(item);
                                const dmFilterButtons = [
                                  ["all", "◢ Celkem", dmCounts.total],
                                  ["available", "◢ Dostupné", dmCounts.available],
                                  ["new", "◢ Nové", dmCounts.new],
                                  ["resharpened_new", "◢ Nové přebroušené", dmCounts.resharpened_new],
                                  ["used", "◢ Použité", dmCounts.used],
                                  ["reserved", "◢ Rezervované", dmCounts.reserved],
                                  ["production", "◢ Ve výrobě", dmCounts.production],
                                  ["sharpening", "◢ Na broušení", dmCounts.sharpening],
                                  ["blocked", "◢ Blokované", dmCounts.blocked],
                                  ["unmarked", "◢ Neoznačené", dmCounts.unmarked],
                                ];
                                const filteredDmItems = getFilteredDmItems(item, dmListFilter);

                                return (
                                  <>
                                    <div style={warehouseRowNumbers}>
                                      {dmFilterButtons.map(([filter, label, count]) => (
                                        <button
                                          key={filter}
                                          type="button"
                                          onClick={() => setDmListFilter(dmListFilter === filter ? "" : filter)}
                                          style={dmListFilter === filter ? btnImport : btnSecondary}
                                        >
                                          {label}: {count}
                                        </button>
                                      ))}
                                    </div>
                                    <div style={muted}>
                                      Základní sklad ukazuje agregované počty. Detailní DM kusy otevřete klikem na konkrétní stav.
                                    </div>
                                    {dmCounts.unmarked > 0 ? (
                                      <div style={offerInfo}>
                                        Neoznačené DM kusy: {dmCounts.unmarked}. DM/QID už existuje v systému, fyzické laserování nebo štítek je samostatný krok.
                                      </div>
                                    ) : null}
                                    {dmListFilter ? (
                                      <div style={historyList}>
                                        {filteredDmItems.length === 0 ? (
                                          <div style={muted}>V tomto stavu nejsou žádné DM kusy.</div>
                                        ) : filteredDmItems.map((dmItem) => (
                                          <div key={dmItem.id || dmItem.dmCode} style={historyItem}>
                                            <div style={historyTitle}>QID: {dmItem.quickId || "není vygenerováno"}</div>
                                            <div style={meta}>DM: {dmItem.dmCode}</div>
                                            <div style={meta}>
                                              Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)} · Označení: {labelFromMap(DM_MARKING_STATUS_LABELS, dmItem.markingStatus || "unmarked")}
                                            </div>
                                            <div style={meta}>
                                              Sklad: Hlavní sklad · Lokace: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)}
                                            </div>
                                            <DmCurrentDimensions dmItem={dmItem} compact />
                                            <div style={meta}>
                                              Poslední výdej: {dmItem.lastIssueMetadata?.job || dmItem.lastIssueMetadata?.machine || dmItem.lastIssueMetadata?.costCenter ? `zakázka ${dmItem.lastIssueMetadata?.job || "neuvedeno"} · stroj ${dmItem.lastIssueMetadata?.machine || "neuvedeno"}` : "neuvedeno"}
                                            </div>
                                            <div style={meta}>
                                              Poslední návrat: {dmItem.lastReturnMetadata?.decisionLabel || "neuvedeno"}
                                            </div>
                                            {dmItem.status === "sharpening" ? (
                                              <div style={meta}>
                                                Odeslání na broušení: {dmItem.sharpeningDispatchStatus || "waiting"} · Brusírna: {dmItem.sharpeningDispatchMetadata?.servicePartner || DEFAULT_GRINDER}
                                              </div>
                                            ) : null}
                                            <div style={actions}>
                                              <button type="button" onClick={() => openDmDetail(item, dmItem)} style={btnSecondary}>Detail</button>
                                              {(dmItem.markingStatus || "unmarked") === "unmarked" ? (
                                                <button type="button" onClick={() => markDmItemAsPhysicallyMarked(getItemKey(item), dmItem.dmCode)} style={btnSecondary}>Označit jako fyzicky označené</button>
                                              ) : null}
                                              {dmItem.status === "sharpening" ? (
                                                <button type="button" onClick={() => openSharpeningDispatchForm(item, dmItem)} style={btnSecondary}>Odeslat na broušení</button>
                                              ) : null}
                                            </div>
                                            {sharpeningDispatchTarget?.itemKey === getItemKey(item) && sharpeningDispatchTarget?.dmCode === dmItem.dmCode ? (
                                              <form onSubmit={saveSharpeningDispatch} style={formBox}>
                                                <div style={settingsTitle}>Odeslat DM kus na broušení</div>
                                                <div style={muted}>
                                                  DM kus zůstává ve stavu Na broušení, ale bude označený jako fyzicky odeslaný servisnímu partnerovi.
                                                </div>
                                                <div style={formGrid}>
                                                  <label style={fieldLabel}>
                                                    Brusírna / servisní partner
                                                    <input
                                                      value={sharpeningDispatchForm.servicePartner}
                                                      onChange={(event) => updateSharpeningDispatchForm("servicePartner", event.target.value)}
                                                      style={input}
                                                    />
                                                  </label>
                                                  <label style={fieldLabel}>
                                                    Box / bedýnka / sběrné místo
                                                    <input
                                                      value={sharpeningDispatchForm.collectionBox}
                                                      onChange={(event) => updateSharpeningDispatchForm("collectionBox", event.target.value)}
                                                      placeholder="např. červená krabice"
                                                      style={input}
                                                    />
                                                  </label>
                                                  <label style={fieldLabel}>
                                                    Datum odeslání
                                                    <input
                                                      type="date"
                                                      value={sharpeningDispatchForm.dispatchedAt}
                                                      onChange={(event) => updateSharpeningDispatchForm("dispatchedAt", event.target.value)}
                                                      style={input}
                                                    />
                                                  </label>
                                                  <label style={fieldLabel}>
                                                    Provedl
                                                    <input
                                                      value={sharpeningDispatchForm.performedBy}
                                                      onChange={(event) => updateSharpeningDispatchForm("performedBy", event.target.value)}
                                                      style={input}
                                                    />
                                                  </label>
                                                </div>
                                                <label style={fieldLabel}>
                                                  Poznámka
                                                  <textarea
                                                    value={sharpeningDispatchForm.note}
                                                    onChange={(event) => updateSharpeningDispatchForm("note", event.target.value)}
                                                    style={textarea}
                                                  />
                                                </label>
                                                <div style={settingsTitle}>Připravit podklad pro broušení</div>
                                                <textarea readOnly value={createSharpeningDispatchText(item, dmItem, { ...sharpeningDispatchForm, customerName: organization.name || "" })} style={textarea} />
                                                {sharpeningDispatchMessage ? <div style={sharpeningDispatchMessage.includes("označen") ? message : errorMessage}>{sharpeningDispatchMessage}</div> : null}
                                                <div style={actions}>
                                                  <button type="submit" style={btnImport}>Potvrdit odeslání</button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setSharpeningDispatchTarget(null);
                                                      setSharpeningDispatchForm(createSharpeningDispatchForm());
                                                      setSharpeningDispatchMessage("");
                                                    }}
                                                    style={btnSecondary}
                                                  >
                                                    Zavřít
                                                  </button>
                                                </div>
                                              </form>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </>
                                );
                              })()}
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
                      </>
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
                              Zdroj příjmu
                              <select
                                value={stockForm.receiptSourceType}
                                onChange={(event) => updateStockForm("receiptSourceType", event.target.value)}
                                style={input}
                              >
                                {Object.entries(RECEIPT_SOURCE_LABELS).map(([sourceType, label]) => (
                                  <option key={sourceType} value={sourceType}>{label}</option>
                                ))}
                              </select>
                            </label>
                            <label style={fieldLabel}>
                              Číslo zdrojového dokladu / objednávky
                              <input
                                value={stockForm.sourceDocumentNumber}
                                onChange={(event) => updateStockForm("sourceDocumentNumber", event.target.value)}
                                placeholder="např. GSS-12345678, ERP objednávka, DL"
                                style={input}
                              />
                            </label>
                            {stockForm.receiptSourceType === "external_order_erp" ? (
                              <label style={fieldLabel}>
                                Externí objednávka / ERP
                                <input
                                  value={stockForm.externalOrderNumber}
                                  onChange={(event) => updateStockForm("externalOrderNumber", event.target.value)}
                                  placeholder="Money / Promitea / ERP číslo"
                                  style={input}
                                />
                              </label>
                            ) : null}
                          </div>
                          {stockForm.receiptSourceType === "gss_system_order" ? (
                            <div style={settingsPanel}>
                              <div style={settingsTitle}>Otevřené systémové objednávky pro tuto položku</div>
                              <div style={muted}>
                                GSS nabízí pouze otevřené objednávkové návrhy, které obsahují právě tuto skladovou položku. Nejstarší otevřená objednávka je nahoře.
                              </div>
                              {getOpenSystemOrdersForItem(purchaseProposal, getItemKey(item)).length > 0 ? (
                                <div style={{ display: "grid", gap: 8 }}>
                                  {getOpenSystemOrdersForItem(purchaseProposal, getItemKey(item)).map((systemOrder) => (
                                    <div key={systemOrder.id} style={settingsPanel}>
                                      <div style={settingsTitle}>{systemOrder.systemOrderNumber}</div>
                                      <div style={meta}>
                                        Vytvořeno: {formatMovementDate(systemOrder.createdAt)} · Dodavatel: {systemOrder.supplier} · Výrobce: {systemOrder.manufacturer}
                                      </div>
                                      <div style={meta}>
                                        Objednáno: {systemOrder.orderedQuantity} ks · Přijato: {systemOrder.receivedQuantity} ks · Zbývá: {systemOrder.remainingQuantity} ks · Kanál: {systemOrder.purchaseChannel}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => selectSystemOrderForReceipt(systemOrder)}
                                        style={stockForm.systemOrderNumber === systemOrder.systemOrderNumber ? btnImport : btnSecondary}
                                      >
                                        Vybrat tuto systémovou objednávku
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={offerInfo}>
                                  K této položce není otevřená žádná systémová objednávka GSS. Pokračujte jako Běžný příjem nebo Příjem z externí objednávky / ERP.
                                </div>
                              )}
                              {stockForm.systemOrderNumber ? (
                                <>
                                  <div style={message}>
                                    Vybraná objednávka: {stockForm.systemOrderNumber} · {stockForm.systemOrderSupplier || "dodavatel není vyplněný"} · {stockForm.systemOrderPurchaseChannel || "kanál není vyplněný"}.
                                  </div>
                                  <div style={offerInfo}>
                                    Objednáno: {stockForm.systemOrderOrderedQuantity || "0"} ks · Již přijato: {stockForm.systemOrderReceivedQuantity || "0"} ks · Zbývá přijmout: {stockForm.systemOrderRemainingQuantity || stockForm.systemOrderOrderedQuantity || "0"} ks.
                                  </div>
                                  {Number(stockForm.quantity) > Number(stockForm.systemOrderRemainingQuantity || stockForm.systemOrderOrderedQuantity || 0) ? (
                                    <div style={errorMessage}>
                                      Zadáváte větší množství, než zbývá přijmout ze systémové objednávky. V MVP je to povolené jako soft warning, ale v produkci půjde o kontrolovaný scénář.
                                    </div>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          ) : null}
                          {stockForm.receiptSourceType === "sharpening_return" ? (
                            <div style={errorMessage}>
                              Příjem z broušení je samostatný tok pro konkrétní DM/QID kus. Běžný příjem nepoužívejte pro anonymní příjem přebroušených DM kusů.
                            </div>
                          ) : stockForm.receiptSourceType === "inventory_correction" ? (
                            <div style={offerInfo}>
                              Korekční příjem / inventura je v MVP pouze připravený zdroj metadat. Plné inventurní workflow bude doplněno později.
                            </div>
                          ) : null}
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
                          ) : item.tenantSettings?.dmEnabled && stockForm.condition === "resharpened_new" ? (
                            <div style={errorMessage}>
                              U DM položky se přebroušený kus přijímá přes Příjem z broušení konkrétního DM/QID kusu.
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
                              U DM položky rezervujte konkrétní QID/DM kus. Nový kus lze vybrat zkratkou, ale systém vždy zobrazí, který konkrétní kus bude rezervovaný.
                            </div>
                          ) : null}

                          {item.tenantSettings?.dmEnabled ? (
                            <div style={formBox}>
                              <div style={settingsTitle}>Dostupné DM skupiny k rezervaci</div>
                              <div style={stateBreakdown}>
                                <span>Celkem dostupné: {selectedReservationStock?.available || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => setReservationDmGroup(reservationDmGroup === "new" ? "" : "new")}
                                  style={reservationDmGroup === "new" ? btnImport : btnSecondary}
                                >
                                  Nový: {selectedReservationStock?.states.new || 0}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReservationDmGroup(reservationDmGroup === "resharpened_new" ? "" : "resharpened_new")}
                                  style={reservationDmGroup === "resharpened_new" ? btnImport : btnSecondary}
                                >
                                  Nový přebroušený: {selectedReservationStock?.states.resharpened_new || 0}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReservationDmGroup(reservationDmGroup === "used" ? "" : "used")}
                                  style={reservationDmGroup === "used" ? btnImport : btnSecondary}
                                >
                                  Použitý: {selectedReservationStock?.states.used || 0}
                                </button>
                              </div>

                              {reservationDmGroup === "new" && reservationDmGroupItems.length > 0 ? (
                                <div style={actions}>
                                  <button
                                    type="button"
                                    onClick={() => updateReservationForm("dmQuery", reservationDmGroupItems[0].quickId || reservationDmGroupItems[0].dmCode)}
                                    style={btnSecondary}
                                  >
                                    Rezervovat libovolný nový kus
                                  </button>
                                </div>
                              ) : null}

                              {reservationDmGroup ? (
                                <div style={historyList}>
                                  {reservationDmGroupItems.length === 0 ? (
                                    <div style={muted}>V této skupině nejsou dostupné DM kusy k rezervaci.</div>
                                  ) : reservationDmGroupItems.map((dmItem) => (
                                    <div key={dmItem.id || dmItem.dmCode} style={historyItem}>
                                      <div style={historyTitle}>QID: {dmItem.quickId || "není vygenerováno"}</div>
                                      <div style={meta}>DM: {dmItem.dmCode}</div>
                                      <div style={meta}>
                                        Stav: {labelFromMap(DM_STATUS_LABELS, dmItem.status)} · Lokace: {labelFromMap(DM_LOCATION_LABELS, dmItem.location)}
                                      </div>
                                      <DmCurrentDimensions dmItem={dmItem} />
                                      <div style={meta}>
                                        Poslední servis: {dmItem.lastServiceAt || "neuvedeno"} · Poslední výdej: {dmItem.lastIssueMetadata?.job || dmItem.lastIssueMetadata?.machine ? `zakázka ${dmItem.lastIssueMetadata?.job || "neuvedeno"} · stroj ${dmItem.lastIssueMetadata?.machine || "neuvedeno"}` : "neuvedeno"}
                                      </div>
                                      <div style={actions}>
                                        <button
                                          type="button"
                                          onClick={() => updateReservationForm("dmQuery", dmItem.quickId || dmItem.dmCode)}
                                          style={btnImport}
                                        >
                                          Vybrat k rezervaci
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              <label style={fieldLabel}>
                                Načíst / zadat DM nebo QID
                                <input
                                  value={reservationForm.dmQuery}
                                  onChange={(event) => updateReservationForm("dmQuery", event.target.value)}
                                  placeholder="např. QID nebo DM kód"
                                  style={input}
                                />
                              </label>

                              {reservationForm.dmQuery && selectedReservationDmItem ? (
                                <div style={selectedReservationDmAvailable ? message : errorMessage}>
                                  Vybraný kus: QID {selectedReservationDmItem.quickId || "není vygenerováno"} · DM {selectedReservationDmItem.dmCode} · {labelFromMap(DM_STATUS_LABELS, selectedReservationDmItem.status)} · D {selectedReservationDmItem.currentDiameter || "neuvedeno"} · L {selectedReservationDmItem.currentLength || "neuvedeno"} · lokace {labelFromMap(DM_LOCATION_LABELS, selectedReservationDmItem.location)}
                                  <DmCurrentDimensions dmItem={selectedReservationDmItem} />
                                </div>
                              ) : null}
                              {reservationForm.dmQuery && !selectedReservationDmItem ? (
                                <div style={errorMessage}>DM/QID kus nebyl nalezen.</div>
                              ) : null}
                              {selectedReservationDmItem && !selectedReservationDmAvailable ? (
                                <div style={errorMessage}>Vybraný kus není dostupný k rezervaci.</div>
                              ) : null}
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
                              Stroj
                              <input
                                value={reservationForm.machine}
                                onChange={(event) => updateReservationForm("machine", event.target.value)}
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Pro koho / role
                              <input
                                value={reservationForm.reservedFor}
                                onChange={(event) => updateReservationForm("reservedFor", event.target.value)}
                                placeholder="např. technolog, mistr, programátor"
                                style={input}
                              />
                            </label>
                            <label style={fieldLabel}>
                              Počet kusů
                              <input
                                type="number"
                                min="1"
                                disabled={item.tenantSettings?.dmEnabled}
                                value={reservationForm.quantity}
                                onChange={(event) => updateReservationForm("quantity", event.target.value)}
                                placeholder={item.tenantSettings?.dmEnabled ? "DM rezervace = 1 konkrétní kus" : ""}
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
                                Volné nové kusy: {getItemStockSummary(item).states.new + (Number(item.overstockReserved) || 0)} ks.
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
                      {showItemHistory ? (
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
                      ) : null}
                    </div>
                    <div style={stockSummary}>
                      <div>{item.tenantSettings?.dmEnabled ? "Celkem podle DM kusů" : "Celkem"}: {stock.total}</div>
                      <div>{item.tenantSettings?.dmEnabled ? "Dostupné podle DM kusů" : "Dostupné"}: {stock.available}</div>
                      <div>Rezervované: {stock.reserved}</div>
                      <div>Ve výrobě: {stock.production}</div>
                      <div>Na broušení: {stock.sharpening}</div>
                      <div>Ještě ve firmě: {stock.sharpeningBreakdown.in_company}</div>
                      <div>V brusírně: {stock.sharpeningBreakdown.at_grinder}</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          ) : null}

          {activeMainPanel === "movements" ? (
          <div style={box}>
            <div style={detailHeader}>
              <h2 style={subtitle}>Poslední skladové pohyby</h2>
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
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
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
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
              <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
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
                  <button type="button" onClick={closeMainPanel} style={btnSecondary}>Zpět na Terminál</button>
                </div>
              </form>
            ) : localItemMessage ? (
              <div style={message}>{localItemMessage}</div>
            ) : null}
          </div>
          ) : null}

          {showHomeSections ? (
          <div style={box}>
            <h2 style={subtitle}>Doporučené další kroky</h2>
            <div style={steps}>
              <div>Převzít první položku z GPC</div>
              <div>Nastavit min/max</div>
              <div>Aktivovat DM tracking</div>
            </div>
          </div>
          ) : null}
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

const compactTitle = {
  fontSize: 22,
  fontWeight: 950,
  margin: 0,
};

const contextBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 18,
  background: "rgba(255,255,255,0.035)",
};

const contextText = {
  marginTop: 4,
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
};

const contextActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "flex-end",
};

const lead = {
  maxWidth: 860,
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.7,
  marginBottom: 24,
};

const leadSmall = {
  fontSize: 13,
  lineHeight: 1.5,
  opacity: 0.72,
  marginBottom: 14,
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

const stickyWarehouseBar = {
  position: "sticky",
  top: 0,
  zIndex: 5,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "8px 0 12px",
  marginBottom: 4,
  background: "#000",
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
};

const sectionEyebrow = {
  fontSize: 11,
  fontWeight: 950,
  color: "#a7f3d0",
  marginBottom: 6,
};

const homeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
  alignItems: "start",
};

const terminalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const terminalTile = {
  display: "grid",
  gap: 8,
  textAlign: "center",
  justifyItems: "center",
  alignContent: "center",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 8,
  padding: "14px 12px",
  background: "rgba(255,255,255,0.055)",
  color: "#fff",
  cursor: "pointer",
  minHeight: 96,
};

const terminalTileTitle = {
  fontSize: 17,
  fontWeight: 950,
  lineHeight: 1.2,
};

const terminalTileText = {
  fontSize: 12,
  lineHeight: 1.35,
  color: "rgba(255,255,255,0.62)",
};

const toggleRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
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

const searchInputWrap = {
  position: "relative",
  width: "100%",
  marginTop: 12,
};

const searchInput = {
  ...input,
  boxSizing: "border-box",
  paddingRight: 48,
  marginTop: 0,
};

const searchClearButton = {
  position: "absolute",
  right: 7,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 3,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 999,
  border: "1px solid rgba(250,204,21,0.85)",
  background: "#facc15",
  color: "#111827",
  fontSize: 14,
  fontWeight: 950,
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 0 0 2px rgba(0,0,0,0.65)",
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
  gridTemplateColumns: "minmax(260px, 1.2fr) minmax(320px, 1fr)",
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

const itemDetailTitle = {
  fontSize: 24,
  fontWeight: 950,
  lineHeight: 1.15,
  marginTop: 8,
};

const itemWorkTitle = {
  fontSize: 22,
  fontWeight: 950,
  lineHeight: 1.15,
  marginTop: 8,
  marginBottom: 4,
};

const technicalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 8,
  marginTop: 10,
};

const technicalRow = {
  display: "grid",
  gap: 4,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: 9,
  fontSize: 12,
  background: "rgba(255,255,255,0.035)",
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

const itemActionFullWidth = {
  flexBasis: "100%",
  width: "100%",
};

const gpcDetailPanel = {
  border: "1px solid rgba(34,197,94,0.55)",
  borderRadius: 10,
  padding: 14,
  marginTop: 2,
  background: "rgba(34,197,94,0.08)",
  boxShadow: "0 0 0 1px rgba(34,197,94,0.12)",
};

const gpcDetailTitle = {
  fontSize: 18,
  fontWeight: 950,
  marginBottom: 10,
  color: "#bbf7d0",
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

const quickIdBox = {
  border: "1px solid rgba(250,204,21,0.35)",
  borderRadius: 8,
  padding: 12,
  background: "rgba(250,204,21,0.08)",
  marginBottom: 12,
};

const quickIdValue = {
  fontSize: 24,
  fontWeight: 950,
  letterSpacing: 0,
  marginBottom: 10,
};

const quickIdInline = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 900,
  color: "#fde68a",
};

const compactDimensionBox = {
  marginTop: 6,
  fontSize: 12,
  color: "rgba(255,255,255,0.78)",
};

const serviceDimensionBox = {
  marginTop: 8,
  border: "1px solid rgba(34,197,94,0.45)",
  borderRadius: 8,
  padding: "9px 10px",
  background: "rgba(34,197,94,0.1)",
  color: "#d1fae5",
};

const serviceDimensionTitle = {
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const dimensionGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  fontSize: 14,
};

const dimensionInline = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  fontSize: 12,
};

const labelPanel = {
  marginTop: 12,
};

const labelCard = {
  border: "2px solid rgba(255,255,255,0.9)",
  borderRadius: 8,
  padding: 16,
  background: "#fff",
  color: "#000",
  maxWidth: 420,
  display: "grid",
  gap: 8,
};

const labelQid = {
  fontSize: 42,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: 0,
};

const labelItemName = {
  fontSize: 18,
  lineHeight: 1.18,
  fontWeight: 900,
};

const labelMetaLine = {
  fontSize: 12,
  lineHeight: 1.25,
  fontWeight: 800,
};

const labelDimensions = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  fontSize: 18,
  fontWeight: 950,
};

const labelSmall = {
  fontSize: 10,
  lineHeight: 1.25,
  fontWeight: 750,
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

const selectedDmIssueItem = {
  ...historyItem,
  border: "1px solid rgba(34,197,94,0.7)",
  background: "rgba(34,197,94,0.12)",
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

const btnTiny = {
  display: "inline-flex",
  padding: "7px 10px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
};

const btnTinyActive = {
  ...btnTiny,
  background: "rgba(34,197,94,0.2)",
  border: "1px solid rgba(34,197,94,0.55)",
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

const badge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.45)",
  background: "rgba(59,130,246,0.12)",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 900,
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

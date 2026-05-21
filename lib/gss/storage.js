import { MAIN_WAREHOUSE_ID, ORGANIZATIONS_STORAGE_KEY } from "./constants.js";

export const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const getOrganizations = () => {
  try {
    const parsed = safeJsonParse(localStorage.getItem(ORGANIZATIONS_STORAGE_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst gogrou_organizations.", error);
    return [];
  }
};

export const saveOrganizations = (organizations) => {
  localStorage.setItem(ORGANIZATIONS_STORAGE_KEY, JSON.stringify(Array.isArray(organizations) ? organizations : []));
};

export const getTenantWarehouseKey = (organizationId, warehouseId = MAIN_WAREHOUSE_ID) => `gss_wh_${organizationId}_${warehouseId}`;

export const getTenantWarehouse = (organizationId) => {
  try {
    const parsed = safeJsonParse(localStorage.getItem(getTenantWarehouseKey(organizationId)), []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst tenant warehouse.", error);
    return [];
  }
};

export const saveTenantWarehouse = (organizationId, items) => {
  localStorage.setItem(getTenantWarehouseKey(organizationId), JSON.stringify(Array.isArray(items) ? items : []));
};

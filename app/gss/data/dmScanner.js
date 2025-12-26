// GSS – DM Scanner handler
// Simulace reálné čtečky DM kódu

import gssStock from "./gssStock";
import auditLog from "./auditLog";
import { applyAction } from "./stateEngine";

export function scanDmCode({
  dmCode,
  action,
  targetLocation,
  user = "operator:demo"
}) {
  // najdi DM kus
  let foundDm = null;
  let foundStock = null;

  gssStock.forEach(stock => {
    stock.dm_items.forEach(dm => {
      if (dm.dm_code === dmCode) {
        foundDm = dm;
        foundStock = stock;
      }
    });
  });

  if (!foundDm) {
    throw new Error(`DM kód ${dmCode} nenalezen`);
  }

  // aplikuj stavový přechod
  const result = applyAction({
    dmItem: foundDm,
    action,
    targetLocation
  });

  // audit log (append only)
  auditLog.push({
    id: `AUD-${String(auditLog.length + 1).padStart(4, "0")}`,
    dm_code: dmCode,
    timestamp: new Date().toISOString(),
    action,
    from_status: result.from,
    to_status: result.to,
    location: targetLocation,
    user,
    note: ""
  });

  return {
    stockId: foundStock.stockId,
    dm: foundDm,
    status: result.to
  };
}

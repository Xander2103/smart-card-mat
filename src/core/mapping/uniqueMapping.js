// src/core/mapping/uniqueMapping.js

/**
 * Optie A (Overwrites):
 * - cardName mag maar bij 1 UID horen
 * - als cardName al bestaat op een andere UID -> die oude UID mapping verwijderen
 */
export function setUniqueMappingOverwrite(mapping, uid, cardName) {
  const next = { ...(mapping ?? {}) };

  for (const [existingUid, existingCardName] of Object.entries(next)) {
    if (existingUid !== uid && existingCardName === cardName) {
      delete next[existingUid];
      break;
    }
  }

  next[uid] = cardName;
  return next;
}
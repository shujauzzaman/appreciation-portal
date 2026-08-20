// Points awarded for recognition posts — single source of truth, used by
// app/(protected)/home/page.js when a post is sent.
//
// Base points depend on the TYPE of recognition:
//   - "recognize" (written recognition, a message)  -> 20
//   - "nominate"  (badge)                            -> 10
//
// On top of the base, bonus points stack based on the SENDER's
// relationship to the recipient, using the `role` and `department`
// fields already on each employee doc (no extra schema needed):
//   - sender.role === "manager"                      -> +10
//   - sender.role === "hod"                           -> +15
//   - sender.department !== recipient.department      -> +5
//
// role and department bonuses stack (e.g. an HOD recognizing someone
// in another department gets +15 +5 = +20 on top of the base).

export const BASE_POINTS = {
  recognize: 20,
  nominate: 10,
};

export const ROLE_BONUS_POINTS = {
  manager: 10,
  hod: 15,
};

export const CROSS_DEPARTMENT_BONUS = 5;

/**
 * @param {"recognize"|"nominate"} type
 * @param {{ role?: string, department?: string }} sender
 * @param {{ department?: string }} recipient
 * @returns {{ base: number, bonus: number, total: number, breakdown: string[] }}
 */
export function calculateRecognitionPoints({ type, sender, recipient }) {
  const base = BASE_POINTS[type] || 0;
  const breakdown = [];
  let bonus = 0;

  const roleBonus = ROLE_BONUS_POINTS[sender?.role];
  if (roleBonus) {
    bonus += roleBonus;
    breakdown.push(sender.role === "hod" ? "From HOD" : "From Employee's Manager");
  }

  if (
    sender?.department &&
    recipient?.department &&
    sender.department !== recipient.department
  ) {
    bonus += CROSS_DEPARTMENT_BONUS;
    breakdown.push("From Another Department");
  }

  return { base, bonus, total: base + bonus, breakdown };
}
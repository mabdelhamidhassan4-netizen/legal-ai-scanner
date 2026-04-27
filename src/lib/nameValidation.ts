/**
 * Validates that a name contains 3 distinct name units.
 * Treats compound names (عبدالرحمن، نورالدين، سيف الإسلام) as a single unit.
 */
export function validateTripleName(fullName: string): boolean {
  const name = fullName.trim();
  if (!name) return false;

  // Two-word compound prefixes that should be treated as one unit
  const compoundPrefixes = ["سيف", "نور", "شمس", "بدر", "ضياء", "عماد", "علاء", "صلاح", "نجم", "زين"];
  const compoundSuffixes = ["الإسلام", "الاسلام", "الدين", "الحق", "الملك", "الله"];

  // Words starting with these prefixes are single names even if written separately
  // e.g. "عبد الرحمن" -> single unit
  const oneWordPrefixes = ["عبد", "أبو", "ابو", "ابن", "بن"];

  const tokens = name.split(/\s+/).filter(Boolean);
  const units: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const current = tokens[i];
    const next = tokens[i + 1];

    // Compound prefix + suffix => one unit (e.g. "سيف الإسلام", "نور الدين")
    if (next && compoundPrefixes.includes(current) && compoundSuffixes.includes(next)) {
      units.push(current + " " + next);
      i += 2;
      continue;
    }

    // "عبد X" / "أبو X" / "ابن X" => one unit
    if (next && oneWordPrefixes.includes(current)) {
      units.push(current + " " + next);
      i += 2;
      continue;
    }

    // Glued compounds like عبدالرحمن, نورالدين, سيفالإسلام => already one token = one unit
    units.push(current);
    i += 1;
  }

  return units.length >= 3;
}

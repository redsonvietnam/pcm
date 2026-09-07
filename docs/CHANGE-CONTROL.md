# PCM/PWF Change Control Policy

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Define a lightweight policy for future PCM/PWF evolution.

## Change Categories

### 1. Editorial Change

**Definition:** Formatting, typos, wording improvements that do not change semantics

**Authority Required:** None (can be merged normally)
**Conformance Impact:** None
**Examples:**
- Fix typos
- Improve formatting
- Clarify wording without changing meaning
- Update section numbers

---

### 2. Clarification

**Definition:** Making existing semantics clearer without changing them

**Authority Required:** None (can be merged normally)
**Conformance Impact:** None
**Examples:**
- Add examples
- Expand explanations
- Resolve ambiguities in existing semantics
- Add cross-references

---

### 3. PWF Policy Change

**Definition:** Changes to recommended or optional PWF behaviors

**Authority Required:** None (can be merged normally)
**Conformance Impact:** None (affects recommended/optional only)
**Examples:**
- Add new recommended behaviors
- Modify optional behavior guidelines
- Update PWF policy recommendations

---

### 4. Conformance Change

**Definition:** Changes to conformance criteria or test groups

**Authority Required:** Authority Gate
**Conformance Impact:** May invalidate prior conformance evidence
**Examples:**
- Add new conformance criteria
- Modify test requirements
- Change conformance levels
- Add new test groups

---

### 5. PCM Semantic Change

**Definition:** Changes to PCM invariants, primitives, roles, or state model

**Authority Required:** Authority Gate (mandatory)
**Conformance Impact:** Invalidates prior conformance evidence
**Examples:**
- Modify invariants
- Add/remove primitives
- Change role semantics
- Alter state model
- Change authority semantics

## Change Process

### Editorial/Clarification

1. Create change proposal
2. Review for semantic impact
3. If no semantic impact → merge normally
4. Update version (patch)

---

### PWF Policy Change

1. Create change proposal
2. Review for semantic impact
3. If no semantic impact → merge normally
4. Update version (minor)

---

### Conformance Change

1. Create change proposal
2. Document conformance impact
3. Submit to Authority Gate
4. If approved → merge
5. Update version (minor or major)
6. Note: May require re-conformance testing

---

### PCM Semantic Change

1. Create change proposal
2. Document semantic impact
3. Submit to Authority Gate (mandatory)
4. If approved → merge
5. Update version (major)
6. Note: Invalidates prior conformance evidence
7. Note: Requires new Authority Gate

## Versioning Rules

- **Major:** PCM semantic changes (invariants, primitives, roles, state model)
- **Minor:** Conformance changes, PWF policy changes, clarifications
- **Patch:** Editorial changes, formatting, typo fixes

## Authority Gate Requirements

- All PCM semantic changes require Authority Gate
- All conformance changes require Authority Gate
- Authority Gate must be external (not self-approved)
- Authority Gate decision is documented in `docs/gates/`

## Implementation Notes

This policy ensures controlled evolution of PCM/PWF while preserving stability. Semantic versioning reflects the actual impact of changes, not just cosmetic version numbers.
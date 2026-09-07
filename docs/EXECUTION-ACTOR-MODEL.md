# Execution Actor Model V1

**Version:** 1.0  
**Status:** Canonical  

## Purpose

Define the execution actor concept with explicit dimensions to support routing without creating an agent taxonomy.

## Actor Dimensions

### 1. Model

**Description:** What the actor can reason about

**Examples:**
- Strong reasoning (can handle complex decisions)
- Limited reasoning (can handle routine tasks)
- No reasoning (automated execution only)

---

### 2. Tools

**Description:** What instruments the actor can use

**Examples:**
- Strong runtime tools (full development environment)
- Limited tools (read-only access)
- No tools (manual execution only)

---

### 3. State-Access

**Description:** What persistent state the actor can read/write

**Examples:**
- Strong state-access (full read/write to canonical state)
- Limited state-access (read-only or restricted write)
- No state-access (execution only, no state modification)

---

### 4. Permissions

**Description:** What actions the actor is authorized to perform

**Examples:**
- Full permissions (can execute any authorized action)
- Limited permissions (restricted to specific scopes)
- No permissions (observation only)

---

### 5. Resource-Limits

**Description:** What constraints the actor operates under

**Examples:**
- Unlimited resources
- Limited resources (time, compute, storage)
- Strict constraints (budget, time window)

---

### 6. Actor-Memory vs State-Access Distinction

**Critical Distinction:**
- **Actor-Memory:** Session-specific history, working context, private memory
- **State-Access:** Ability to read/write persistent canonical state

An actor may have:
- Strong state-access (can read/write canonical state) + Weak actor-memory (little session history)
- Weak state-access (read-only) + Strong actor-memory (rich session history)

These are independent dimensions.

## Actor Examples

### Actor A: Strong Reasoning, Weak Tools
- **Model:** Strong reasoning
- **Tools:** Weak tools
- **State-Access:** Strong state-access
- **Permissions:** Full permissions
- **Resource-Limits:** Unlimited
- **Actor-Memory:** Weak

### Actor B: Limited Reasoning, Strong Tools
- **Model:** Limited reasoning
- **Tools:** Strong runtime tools
- **State-Access:** Limited state-access
- **Permissions:** Limited permissions
- **Resource-Limits:** Limited
- **Actor-Memory:** Strong

### Actor C: Human Authority, No Automated Execution
- **Model:** Human reasoning
- **Tools:** No automated tools
- **State-Access:** Strong state-access (through manual mechanisms)
- **Permissions:** Full permissions (authority source)
- **Resource-Limits:** Human limits
- **Actor-Memory:** Strong

## Routing Implications

Actor dimensions support routing decisions:
- Task requirements → actor capabilities matching
- Authority boundaries → permission matching
- Resource constraints → resource-limit matching

Routing does NOT change PCM semantics. Routing selects which actor executes, not what the protocol requires.

## Implementation Notes

This model is conceptual, not a taxonomy. It describes dimensions for reasoning about actor capabilities, not types of actors. Implementations may use different dimensions or groupings.
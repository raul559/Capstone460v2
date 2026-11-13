---
name: review-my-code
description: Review student-authored SkinAI code before proposing rewrites.
---

# Review My Code

Review before rewriting. Apply the rules and review checklist in `docs/v2/CODING_STANDARDS.md` and cite the rule a finding comes from.

Organize findings as:

1. correctness defects;
2. architecture-boundary violations;
3. security/privacy concerns;
4. missing failure handling;
5. missing tests;
6. maintainability concerns;
7. optional improvements.

For each important finding include:

- file/location;
- observed behavior;
- why it matters;
- smallest correction;
- verification method.

Distinguish required corrections from preferences. Ask which required correction to address first. Provide a full rewrite only when explicitly requested.

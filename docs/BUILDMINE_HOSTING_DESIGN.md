# Next stage: owned, named publications

## Status and missing connection

The live release hosts a fictional static demonstration and supports portable
exports. It does not host customer accounts. A suitable hosting/backend account
must be connected before automatic publishing can be implemented and verified.
This requires a service whose terms allow the intended operation, an identity
provider or equivalent verified login, durable database/storage, and server-side
secrets. A cloud provider name or free tier alone is not an implementation.
Recheck current quotas, pricing and terms before selecting one; do not activate
paid usage, create accounts, accept agreements or change DNS under this release.

## Smallest coherent design

1. Keep `/buildmine/` local-first. Publication sends **only** the reviewed public
   schema through authenticated HTTPS with CSRF/origin protection. No raw HTML,
   JavaScript, uploaded apps, private briefs or résumé source files are accepted.
2. Store a randomly generated record ID with immutable owner account ID, schema
   version, public data, revision, created/updated timestamps and deletion state.
   Authorize every read/write of draft records against the signed-in owner.
   Knowledge of an ID, name, email string, or slug grants no edit rights.
3. Reserve slugs transactionally with a unique normalized index. Require the
   `/p/firstname.lastname.pagename/` shape, reserve system names and refuse
   duplicates with an explicit suggestion (e.g. a numeric suffix). Never
   silently replace another record. Route namespace prevents collisions with
   `/hello`, `/buildmine`, `/preview`, `/about`, assets and existing projects.
4. Render static, escaped content with the same schema/renderer. Keep user pages
   isolated from account cookies and personal-site privileges. If arbitrary
   custom HTML ever becomes a feature, serve it on a separate origin with no
   trusted application cookies. Never relax the current preview sandbox to
   support arbitrary scripts.
5. Require explicit approval of the exact revision being published. Optimistic
   revision checks prevent lost updates. Publication, update and unpublish/delete
   are separate authenticated operations. Updates invalidate stale approvals.
6. Provide a working deletion/unpublish path, abuse report route, rate limits,
   quota errors, storage/egress ceilings, spam controls and owner verification
   before opening public signups. Define retention and backup deletion; explain
   that public copies/caches may survive removal. Keep private records out of
   public Git history. A failure must leave a recoverable draft, not a false
   published state.
7. Add operations visibility without content logging: failed jobs, queue age,
   rate-limit counts and capacity alerts. Enforce hard free-tier ceilings or
   disable publication gracefully rather than silently activating billing.
8. Rehearse two separate owners, duplicate names, forged IDs, expired sessions,
   concurrent updates, removal, quota exhaustion, abusive content and rollback.
   Test all public URLs from a signed-out browser before calling this live.

For a later reviewed noncommercial pilot, hold approvals privately and use a
controlled maintainer queue; still require explicit public-content approval,
collision checks, update/removal handling, and host suitability. Do not convert
the current GitHub demo into an open customer-hosting service by accepting PRs
containing personal data. A user-owned deployment is the current supported path.

## Domains

Initially connect a customer's domain to their own deployment. A visible custom
domain on shared infrastructure needs verified domain ownership, host routing,
HTTPS issuance/renewal and removal handling. Redirecting a domain to a path on
Drew's site is different; it changes the visible URL. Do not promise unlimited
managed domains or free hosting without capacity and support evidence.

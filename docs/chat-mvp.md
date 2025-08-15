# Chat MVP Specification

This document outlines the minimum viable product for the site-wide chat feature, summarizing data model, APIs, UI behavior, and moderation requirements.

## 1. Data Model and Retention
- **Room**: `id`, `name`, `slug`, `isPublic`, `createdAt`, `createdBy`, `lastMessageAt`, `membersCount`.
- **User**: `id`, `displayName`, `avatarUrl`, `roles[admin|moderator|member]`, `isBanned`.
- **Membership**: `roomId`, `userId`, `lastReadAt`, `unreadCount`.
- **Message**: `id`, `roomId`, `userId`, `text`, `htmlSafe`, `mentions[userId]`, `createdAt`, `editedAt?`, `deletedAt?`, `pinnedBy?`, `flags{spam:boolean, moderated:boolean}`.
- **AuditLog**: `id`, `actorId`, `action`, `targetType`, `targetId`, `meta`, `createdAt`.

Messages are retained for **7 days** and then removed by a nightly job that records deletions in the `AuditLog`.

## 2. REST API (with SSE/WebSocket in mind)
- `POST /api/chat/messages` — send message; validates role, rate limits, length, HTML sanitization.
- `GET /api/chat/messages?room={id}&before/after&limit` — fetch message history with pagination.
- `PUT /api/chat/messages/{id}` — edit own message within 15 minutes.
- `DELETE /api/chat/messages/{id}` — delete own message or any message as a moderator.
- `GET /api/chat/rooms` — list rooms with unread counts.
- Moderation actions: `POST /api/chat/rooms/{id}/pin`, `mute`, `unmute`, `ban`, `unban` (all logged).

Requests are rate-limited per user/IP. On exceeding limits, return **429** with `Retry-After` and log the event.

## 3. Frontend `/chat.html`
- Left column: room list with unread badges, ordered by `lastMessageAt`.
- Center: message history (`role="log"`, `aria-live="polite"`).
- Bottom: input field, send button, character counter, “user is typing…” indicator.
- Right (or separate mobile tab): online participants and pinned messages.
- Mobile layout: tabs — “Rooms”, “Chat”, “Participants”.

## 4. Editing and Deletion
- Users can edit their own messages for **15 minutes**; edited messages show a “(edited)” marker.
- Deletion replaces content with a placeholder indicating whether a user or moderator removed it.
- All edits and deletions are written to the `AuditLog`.

## 5. Moderation Toolkit
- Moderators can delete, pin, mute for 24 hours, ban, and unban users per room.
- All actions are audited; rate limits and quotas protect against abuse.

## 6. Safe Content and Mentions
- Server-side HTML sanitization (e.g., DOMPurify) ensures no scripts or dangerous attributes are stored.
- Output is encoded by default; client-side sanitization is a secondary layer.
- `@username` mentions are validated against room members and highlighted, enabling future notifications.

## 7. Message Length Limit
- Unified limit of **2000 characters** per message enforced on client and server.
- Exceeding the limit returns **400 Bad Request**; the UI warns users with a counter.

## 8. Logging and Observability
- Log key events (actor, action, target, result) according to OWASP logging guidance.
- Logs are stored separately from user data, avoid secrets/PII, and support alerts on spikes in 429 or auth errors.

---
This specification guides the initial implementation while allowing later expansion to real-time transport (SSE/WebSockets), richer content, and advanced moderation features.

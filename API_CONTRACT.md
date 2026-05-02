# Van Rakshak - API Contract

This document defines the shared REST API contract for the Van Rakshak system. All responses follow a standard format.

## Standard Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string
}
```

---

## 1. Authentication
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | No | `{ name, email, password, role, phone }` | Register a new user |
| POST | `/api/auth/login` | No | `{ email, password }` | Login and receive JWT |
| GET | `/api/auth/me` | Yes (JWT) | None | Get current user profile |

---

## 2. Users & Zones
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/users/officers` | Yes (Admin) | None | List all forest officers |
| PUT | `/api/users/:id/zone` | Yes (Admin) | `{ assignedZone }` | Assign a zone to an officer |

---

## 3. Patrol Logs
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/patrols/sync` | Yes (Officer) | `{ coordinates: [{lat, lng, timestamp}], patrolDate }` | Sync local patrol logs to server |
| GET | `/api/patrols` | Yes (Admin) | Query: `officerId`, `startDate`, `endDate` | Fetch patrol history |

---

## 4. Incidents
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/incidents` | Yes | `{ type, description, location, evidence, voiceNote, language, priority }` | Report a new incident |
| GET | `/api/incidents` | Yes | Query: `status`, `type`, `priority` | List incidents (filtered by role) |
| GET | `/api/incidents/:id` | Yes | None | Get incident details |
| PATCH | `/api/incidents/:id/status` | Yes (Admin/Officer) | `{ status, assignedTo }` | Update incident status or assignment |

---

## 5. SOS Alerts
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/sos` | Yes (Officer) | `{ location: {lat, lng} }` | Trigger an emergency SOS alert |
| GET | `/api/sos/active` | Yes (Admin) | None | List all currently active SOS alerts |
| PATCH | `/api/sos/:id/resolve` | Yes (Admin) | `{ adminNote }` | Mark an SOS alert as resolved |

---

## 6. Notifications
| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/notifications` | Yes | None | Fetch notifications for current user |
| PATCH | `/api/notifications/:id/read` | Yes | None | Mark a notification as read |

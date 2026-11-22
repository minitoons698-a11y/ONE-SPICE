# One Spice — Security Specification & Invariants

## 1. Data Invariants
1. **Spice Catalog Integrity**: `/spices/{spiceId}` documents are publicly readable by storefront visitors, but only verified shop admins (`isAdmin()`) may create, update, or delete spices. Document IDs must match `^[a-zA-Z0-9_-]+$` (`<= 128` chars), and all strings/arrays must respect strict size caps.
2. **Order PII Isolation**: `/orders/{orderId}` documents contain customer PII (`customerName`, `customerPhone`, `customerEmail`, `deliveryAddress`). Storefront shoppers may `create` a new order only with `status == 'Pending'`, server timestamps (`createdAt == request.time`, `updatedAt == request.time`), and strict schema/size checks. Only `isAdmin()` may `get`, `list`, `update`, or `delete` orders.
3. **Order Immutability & Terminal Lock**: Once an order is created, `createdAt`, `orderNumber`, `items`, `subtotal`, `deliveryFee`, and `total` cannot be altered by non-admins, and completed/cancelled orders cannot be modified except by an admin override.
4. **Inquiry Isolation**: `/inquiries/{inquiryId}` documents may be created by visitors with `status == 'New'` and `createdAt == request.time`. Only `isAdmin()` may read, list, update, or delete inquiries.
5. **No Self-Assigned Admin**: Users cannot write to `/admins/{adminId}`. Admin verification requires either a verified `email_verified == true` match on the bootstrapped shop owner email (`minitoons698@gmail.com`) or an existing `/admins/{uid}` document.

## 2. Adversarial "Dirty Dozen" Payloads (Must All Return PERMISSION_DENIED)
1. **Shadow Field Injection on Order Create**: `{ ..., isPaid: true }` -> Rejected by `hasOnly(...)`.
2. **Spoofed Initial Order Status**: `{ ..., status: "Completed" }` on create -> Rejected (`status == 'Pending'` required).
3. **Client-Forged Timestamp on Order Create**: `{ ..., createdAt: "2020-01-01T00:00:00Z" }` -> Rejected (`createdAt == request.time`).
4. **Unauthenticated Order List Scraping**: Non-admin `getDocs(collection(db, 'orders'))` -> Rejected (`allow list: if isAdmin()`).
5. **Unauthenticated Order Get by ID**: Non-admin `getDoc(doc(db, 'orders', 'order-1'))` -> Rejected (`allow get: if isAdmin()`).
6. **Non-Admin Spice Creation**: Non-admin `setDoc(doc(db, 'spices', 'fake'), ...)` -> Rejected (`isAdmin()`).
7. **Email Spoofing Without Verification**: Auth token with `email: "minitoons698@gmail.com"` and `email_verified: false` -> Rejected (`email_verified == true`).
8. **ID Poisoning Attack**: `setDoc(doc(db, 'orders', 'a'.repeat(500)), ...)` -> Rejected by `isValidId(orderId)`.
9. **Oversized Image / Payload DoW**: Spice `image` string `> 450000` bytes -> Rejected by `data.image.size() <= 450000`.
10. **Invalid Spice Category Enum**: Spice `category: "Discount"` -> Rejected by category allowlist.
11. **Self-Privilege Escalation**: Authenticated user writing `/admins/{theirUid}` -> Rejected (`allow write: if false`).
12. **Inquiry PII Scraping**: Non-admin `getDocs(collection(db, 'inquiries'))` -> Rejected (`allow list: if isAdmin()`).

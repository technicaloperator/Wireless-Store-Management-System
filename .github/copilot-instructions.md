# WSMS (Wireless Store Management System)
## GitHub Copilot Instructions

---

# PROJECT

WSMS (Wireless Store Management System)

Organization:
Wireless Department, Morbi Police

Frontend:
React

State Management:
StoreContext

Storage:
Browser Local Storage

Current Refactor Branch:
refactor-v1.5

Purpose:
Manage wireless equipment inventory, issue/receive process, faulty stock, reports, vouchers and activity logs.

---

# IMPORTANT

This branch is ONLY for refactoring.

DO NOT:

- Change business logic
- Rename variables
- Change workflow
- Change UI without permission
- Add new features
- Rename Local Storage keys

Only improve code quality.

---

# PROJECT WORKFLOW

The application workflow is:

Dashboard

↓

Inventory

↓

Issue

↓

Temporary IV / Permanent IV

↓

Receive

↓

Faulty Stock

↓

Reports

↓

Settings

Inventory is the master source of all equipment.

Every operation must update Inventory correctly.

---

# INVENTORY WORKFLOW

New Item

↓

AVAILABLE

↓

Issue

↓

ISSUED

↓

Receive

↓

AVAILABLE

or

↓

FAULTY

↓

UNDER REPAIR

↓

AVAILABLE

or

↓

UNSERVICEABLE

Once an item becomes UNSERVICEABLE it should never become AVAILABLE again unless explicitly changed by future requirements.

---

# ISSUE WORKFLOW

Two issue types exist.

## Temporary IV

Stored inside:

issueVouchers

DO NOT rename this variable.

Temporary IV page reads:

issueVouchers

---

## Permanent IV

Stored inside:

permanentVouchers

Permanent IV page reads:

permanentVouchers

DO NOT merge both arrays.

---

# RECEIVE RULE

Inventory page contains a RECEIVE button.

The RECEIVE button must remain disabled while an issued voucher exists.

Temporary IV:

issueVouchers

Permanent IV:

permanentVouchers

After voucher deletion:

Receive button becomes enabled.

Never bypass this rule.

---

# GPW NUMBER RULE

GPW numbers may contain:

15

15,18,22

100-110

12,18-22,30

Always validate using:

expandNumbers()

Never compare GPW numbers as plain strings.

---

# INVENTORY STATUS

Allowed values:

AVAILABLE

ISSUED

FAULTY

UNDER REPAIR

UNSERVICEABLE

Never introduce additional status names.

Never use:

CONDEMN

CONDEMNED

Those names have already been replaced with:

UNSERVICEABLE

---

# ACTIVITY LOG

All important operations should generate an activity log.

Examples:

Login

Logout

Inventory Added

Bulk Added

Deleted

Issued

Received

Marked Faulty

Sent For Repair

Repaired

Marked Unserviceable

Backup

Restore

Clear Data

Activity logs are added through:

addActivity()

Avoid manually modifying activity arrays.

---

# LOCAL STORAGE KEYS

Keep these names unchanged.

wsms_inventory

wsms_issues

wsms_receives

wsms_issueVouchers

wsms_permanentVouchers

wsms_activity

wsms_users

wsms_last_backup

wsms_last_restore

wsms_faultyStock

wsms_UNSERVICEABLEStock

---

# SIDEBAR

Sidebar component location:

src/Components/Layout/Layout.jsx

Sidebar styles:

src/Components/Layout/Layout.css

The sidebar contains:

Dashboard

Inventory

(blank spacing)

Issue

Receive

Faulty Stock

(blank spacing)

Police Station Data

Mobile Vehicle Data

(blank spacing)

Activity Log

(blank spacing)

User Management (ADMIN only)

Settings

(blank spacing)

Temporary IV

Permanent IV

Spacing between groups is intentional.

Do not remove it.

The current page shows:

➡

with a blinking animation.

Do not replace it with another active style.

---

# HEADER

Layout component also contains:

Top header

Operator name

Search button

Logout button

Department title

Do not move Header into another component unless requested.

---

# SETTINGS

Settings page includes:

Software Information

Backup

Restore

Selective Data Clear

Backup metadata

Last Backup

Last Restore

Do not remove these features.

---

# BACKUP

Backup saves:

Inventory

Issues

Receives

Activity

Temporary IV

Permanent IV

Backup Date

Version

Application Name

---

# REPORTS

Temporary IV page displays:

issueVouchers

Permanent IV page displays:

permanentVouchers

Deleting a voucher should immediately update inventory rules.

---

# REFACTORING RULES

Preferred:

Extract reusable components.

Extract helper functions.

Remove duplicated code.

Improve readability.

Improve naming only when requested.

Keep existing behavior identical.

Keep CSS structure simple.

Do not perform large rewrites.

Refactor incrementally.

---

# CODE STYLE

Prefer:

Early return

Small functions

Reusable utilities

Meaningful comments

Readable JSX

Avoid:

Nested if blocks

Duplicate code

Large components

Magic strings

---

# WHEN UNSURE

If a suggestion could change application behavior,
ask for confirmation instead of modifying logic automatically.

Preserve existing workflow at all times.
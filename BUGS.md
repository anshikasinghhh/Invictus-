# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar) or unsorted. Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first or in arbitrary order because `dateValue(a.date) - dateValue(b.date)` subtracted unparsed date strings or Dates in ascending order (oldest first). Subtracting date strings yielded `NaN`.

**What I changed:** Updated `format.js` to parse date strings into epoch timestamps via `dateValue(date)` and updated `ExpenseList.jsx` to sort in descending order using `dateValue(b.date) - dateValue(a.date)`.

---

## Bug 2

**How to reproduce:** In the Filter section, select any member (e.g., "Aisha Khan") from the "Paid by" dropdown. The list shows 0 expenses even though Aisha paid for multiple bills.

**What is wrong:** The filter condition in `App.jsx` used strict inequality `e.paidBy !== paidBy`. Because `paidBy` from the `<select>` element is a string (e.g., `"1"`) and `e.paidBy` is a number (`1`), `1 !== "1"` always evaluated to true, filtering out every expense.

**What I changed:** Updated the filter condition in `App.jsx` to parse and compare numeric IDs using `Number(e.paidBy) !== Number(paidBy)`.

---

## Bug 3

**How to reproduce:** Filter expenses (e.g., search "Uber" or filter by category "Stay"), or view the sorted list. Click "Delete" or edit the amount on an expense row.

**What is wrong:** `ExpenseList` passed the rendered array index in the filtered/sorted list to `onDeleteAt` and `onUpdateAt`. The reducer in `store.js` then spliced `state.expenses` by that index, deleting or modifying the wrong expense from the global list. Additionally, using array indices as React keys caused stale state in `ExpenseRow`.

**What I changed:** Updated `store.js` reducer actions (`DELETE_EXPENSE` and `UPDATE_EXPENSE`) and component handlers to target expenses by their unique `id` rather than array index, synchronized the `draft` amount state, and updated React keys to `key={expense.id}`.

---

## Bug 4

**How to reproduce:** View the Balances panel on the initial dataset. Aisha Khan has a net balance of -$85.00, but is displayed in green as "is owed $85.00". Ben Okonkwo has a net balance of +$59.00, but is displayed in red as "owes $59.00".

**What is wrong:** In `BalancesPanel.jsx`, the condition checked `bal > 0.005` for "owes" and `bal < -0.005` for "is owed". A positive balance indicates the member paid more than their consumed share (they are in credit / is owed), while a negative balance indicates they consumed more than they paid (they are in debt / owes).

**What I changed:** Inverted the logic in `BalancesPanel.jsx` so `bal > 0.005` correctly renders "is owed" (`cls="owed"`) and `bal < -0.005` renders "owes" (`cls="owe"`).

---

## Bug 5

**How to reproduce:** Check Diya Patel's balance after she paid $60 for "Uber to airport" split only between Aisha and Ben (`splitWith: [1, 2]`).

**What is wrong:** In `balances.js`, lines 16-19 checked `if (!(exp.paidBy in shares) && !(String(exp.paidBy) in shares))` and subtracted `amount / n` from the payer's balance. This penalized members who paid for expenses on behalf of others without participating, violating the specification and causing the sum of all group balances to not equal zero.

**What I changed:** Removed lines 16-19 in `balances.js` so payers not included in a split are credited their full payment, ensuring group balances strictly cancel out.

---

## Bug 6

**How to reproduce:** Check the Settle Up panel on the default dataset. Aisha Khan owes $85 ($59 to Ben + $26 to Diya), and Carlos Mendes owes $17. Diya Patel is owed $43 ($26 from Aisha + $17 from Carlos). The panel only showed Aisha's payments and completely omitted Carlos paying Diya $17.

**What is wrong:** In `settle.js`, the `while` loop branch for `d.amount === c.amount` incremented both pointers (`i += 1; j += 1`) without pushing a transfer into the `transfers` array, leaving equal matching debts unsettled.

**What I changed:** Updated `suggestSettlements` in `settle.js` to calculate `amount = Math.min(d.amount, c.amount)` and push transfers for all matching debts before advancing pointers.

---

## Bug 7

**How to reproduce:** Add an expense of $100 split equally among 3 members (100 / 3 = $33.33 each, summing to $99.99 and losing 1 cent), or $20 split 33.33%, 33.33%, 33.34% (6.67 each, summing to $20.01 and inventing 1 cent).

**What is wrong:** `splitEqual` and `splitByPercent` in `money.js` rounded each individual member's share independently without distributing remainder cents, causing the total shares to diverge from the actual expense amount.

**What I changed:** Updated `splitEqual` and `splitByPercent` in `money.js` to compute shares in integer cents and distribute remainder cents among participants so the sum of individual shares always strictly equals the total bill amount.

---

## Bug 8

**How to reproduce:** Refresh the page after localStorage persistence or add an expense. Dates in the expense list rendered as raw unformatted strings (e.g., `2026-03-12`) instead of `12 Mar 2026`. In some timezones, `new Date("YYYY-MM-DD")` also shifted the displayed date back by one day.

**What is wrong:** `formatDate` in `format.js` returned `date.slice(0, 10)` for string inputs, and UTC midnight parsing caused timezone offsets. In `store.js`, `loadState` returned unhydrated JSON directly from localStorage.

**What I changed:** Updated `formatDate` and `parseDate` in `format.js` to parse `"YYYY-MM-DD"` without timezone shifts and consistently format dates using `toLocaleDateString("en-IN")`. Updated `store.js` to always hydrate loaded state.

---

## Bug 9

**How to reproduce:** Add a new member (e.g., "Elena Rostova") in the Summary card. The new member did not appear under "Paid so far" until an expense was added or modified.

**What is wrong:** In `SummaryCards.jsx`, the `perPerson` computation was memoized with `useMemo(..., [expenses])`, omitting `members` from the dependency array.

**What I changed:** Updated the `useMemo` dependency array to `[members, expenses]` in `SummaryCards.jsx` so adding a member immediately reflects in the "Paid so far" list.

---

## Bug 10

**How to reproduce:** Enter a description and amount in the "Add expense" form and click "Save expense".

**What is wrong:** The submit handler in `AddExpenseForm.jsx` did not reset `description` and `amount` state variables, leaving previous inputs in the fields after successful submission.

**What I changed:** Added `setDescription("")`, `setAmount("")`, and `setError("")` to the submit handler in `AddExpenseForm.jsx`.

---

## Bug 11

**How to reproduce:** Select "Custom %" split and enter percentages totaling 100 (e.g., 33.33, 33.33, 33.34), or toggle members on and off in custom percentage mode.

**What is wrong:** In `money.js`, `percentsSumTo100` used `reduce(...) === 100`, which failed for floating-point calculations like `100.00000000000001 !== 100`. Also, toggling members off left stale percentage entries in the `percents` state object, causing validation to sum percentages of deselected members.

**What I changed:** Updated `percentsSumTo100` to allow floating-point tolerance (`Math.abs(sum - 100) < 0.001`), and updated `AddExpenseForm.jsx` to filter `percents` to only include currently active `splitWith` members.

---

## Bug 12

**How to reproduce:** Add a new member to the group in the Summary card (e.g., adding a 5th or 6th member).

**What is wrong:** The header subtitle hardcoded `"Shared expenses for four friends"`, failing to update dynamically as new members joined the group.

**What I changed:** Updated `App.jsx` to dynamically render `Shared expenses for ${state.members.length} friends.`

---

## Bug 13

**How to reproduce:** In the Summary card, enter the name of an existing member (e.g., "Carlos Mendes") into the "Add member" input and submit.

**What is wrong:** The app allowed adding duplicate members with identical names, creating ambiguous payer selection and confusion in balances and settlements.

**What I changed:** Added a duplicate name check in `SummaryCards.jsx` to prevent adding members with identical names (case-insensitive).

---

## Bug 14

**How to reproduce:** Click the inline amount input on an expense row, type a modified number, and press the `Escape` key to cancel.

**What is wrong:** The input did not handle the `Escape` key to cancel edits or revert to the original saved amount.

**What I changed:** Added an `onKeyDown` handler for `Escape` in `ExpenseList.jsx` that reverts the input draft to `expense.amount`.



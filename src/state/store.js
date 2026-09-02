const KEY = "fairshare-v1";

function hydrate(data) {
  if (!data) return null;
  return {
    groupName: data.groupName || "Goa weekend",
    members: (data.members || []).map((m) => ({
      ...m,
      id: Number(m.id),
    })),
    expenses: (data.expenses || []).map((e) => ({
      ...e,
      paidBy: Number(e.paidBy),
      amount: Number(e.amount),
      splitWith: (e.splitWith || []).map(Number),
    })),
  };
}

export function loadState(seed) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = hydrate(seed);
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return hydrate(parsed) || hydrate(seed);
  } catch {
    return hydrate(seed);
  }
}

export function persistState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function nextExpenseId() {
  return `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nextMemberId(members) {
  const max = members.reduce((m, x) => (Number(x.id) > m ? Number(x.id) : m), 0);
  return max + 1;
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_EXPENSE": {
      return { ...state, expenses: [...state.expenses, action.expense] };
    }
    case "DELETE_EXPENSE": {
      if (action.id !== undefined) {
        return {
          ...state,
          expenses: state.expenses.filter((e) => e.id !== action.id),
        };
      }
      const next = state.expenses.slice();
      next.splice(action.index, 1);
      return { ...state, expenses: next };
    }
    case "UPDATE_EXPENSE": {
      if (action.id !== undefined) {
        return {
          ...state,
          expenses: state.expenses.map((e) =>
            e.id === action.id ? { ...e, ...action.patch } : e
          ),
        };
      }
      const next = state.expenses.slice();
      next[action.index] = { ...next[action.index], ...action.patch };
      return { ...state, expenses: next };
    }
    case "ADD_MEMBER": {
      return { ...state, members: [...state.members, action.member] };
    }
    default:
      return state;
  }
}


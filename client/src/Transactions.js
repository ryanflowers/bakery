const getTransactions = () =>
  fetch("/api/transactions").then((res) => res.json());

export { getTransactions };

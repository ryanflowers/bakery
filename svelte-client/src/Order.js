const createOrder = (items) =>
  fetch("http://localhost:3001/api/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lineItems: items, state: "OPEN" }),
  }).then((res) => res.json());

export { createOrder };

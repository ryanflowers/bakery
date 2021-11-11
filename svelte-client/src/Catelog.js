const getCatelog = () =>
  fetch("http://localhost:3001/api/catelog").then((res) =>
    res.json().then((result) => JSON.parse(result.message))
  );

export { getCatelog };

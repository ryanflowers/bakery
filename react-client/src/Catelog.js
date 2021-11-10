const getCatelog = () => fetch("/api/catelog").then((res) => res.json());

export { getCatelog };

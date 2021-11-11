const API = "http://localhost:3001/api";
const locationId = "LCHG32HK18R8J";

const createPayment = async (paymentMethod) => {
  const token = await tokenize(paymentMethod);
  return postPayment(token);
};

const postPayment = (token) => {
  const body = JSON.stringify({
    locationId,
    sourceId: token,
  });

  return fetch(`${API}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};

const tokenize = async (paymentMethod) => {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === "OK") {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
    }

    throw new Error(errorMessage);
  }
};

export { createPayment };

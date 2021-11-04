import { useCallback, useState } from "react";
import { Card } from "./Card";
import { getTransactions } from "./Transactions";

const Checkout = () => {
  const [data, setData] = useState({ transactions: [] });

  const showTransactions = useCallback(async () => {
    const data = await getTransactions();
    setData(JSON.parse(data.message));
  }, [setData]);

  return (
    <>
      <div>
        <Card onPaymentSuccess={showTransactions}></Card>
      </div>
      <div>
        <label>Transactions</label>
        {data.transactions.map(({ tenders }) => (
          <div key={tenders.id}>
            <div>
              {"ID: "}
              {tenders[0].id}
            </div>
            <div>
              {"Amount: $"}
              {tenders[0].amount_money.amount}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export { Checkout };

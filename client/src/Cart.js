import { useCallback, useEffect, useState } from "react";
import { Card } from "./Card";
import { createOrder } from "./Order";
import { formatIntToUSD } from "./Utils";

const Cart = ({ selectedItem }) => {
  const [data, setData] = useState({ items: [], orderId: null });

  useEffect(() => {
    if (
      selectedItem &&
      !data.items.find((item) => item.id === selectedItem.id)
    ) {
      setData((data) => ({
        items: [].concat(data.items, [selectedItem]),
      }));
    }
  }, [selectedItem]);

  const onCheckout = useCallback(async () => {
    const result = await createOrder(data.items);
    setData(() => ({ items: [], orderId: result.order.id }));
  }, [setData, data]);

  const onPaymentSuccess = useCallback(async () => {
    // TODO Complete order
  }, [setData]);

  return (
    <div style={{ flexBasis: "15rem", padding: "1rem" }}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.2em",
          height: "30rem",
          color: "black",
          padding: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <label>Cart</label>
        <div
          style={{
            fontSize: "medium",
            height: "100%",
          }}
        >
          {data.items.length > 0 ? (
            <div
              style={{
                paddingTop: "1rem",
                flexDirection: "column",
                height: "100%",
                display: "flex",
                gap: "0.5rem",
                alignItems: "start",
              }}
            >
              {data.items.map((item) => (
                <div>
                  <span>{item.item_variation_data.name}</span>
                  <span style={{ fontWeight: "bold", paddingLeft: "0.5rem " }}>
                    {formatIntToUSD(
                      item.item_variation_data.price_money.amount
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {data.orderId ? (
                <span>Order ID {data.orderId}</span>
              ) : (
                <span>Cart is empty</span>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        style={{
          backgroundColor: "rgb(161, 0, 26)",
          borderRadius: "0.5rem",
          padding: "1.2rem",
          width: "70%",
          color: "#ffffff",
          borderStyle: "none",
        }}
        onClick={onCheckout}
      >
        Checkout
      </button>
      <div>
        <Card onPaymentSuccess={onPaymentSuccess}></Card>
      </div>
    </div>
  );
};

export { Cart };

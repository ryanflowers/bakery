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
    setData(() => ({ items: [], order: result.order }));
  }, [setData, data]);

  const onPaymentSuccess = useCallback(async () => {
    // TODO Complete order
  }, [setData]);

  return (
    <div
      style={{
        flexBasis: "15rem",
        padding: "1rem",
        paddingTop: "2rem",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          height: "30rem",
          color: "black",
          marginBottom: "1rem",
          borderBottom: "0.1rem solid rgb(217, 217, 217)",
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
              {data.order ? (
                <div style={{ textAlign: "left", fontSize: "small" }}>
                  <div style={{ fontSize: "large" }}>
                    Total:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {formatIntToUSD(data.order.total_money.amount)}
                    </span>
                  </div>
                  <div style={{ fontStyle: "italic" }}>
                    OID: <span>{data.order.id}</span>
                  </div>
                </div>
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

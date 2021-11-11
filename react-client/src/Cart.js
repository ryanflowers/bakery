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
        items: [...data.items, selectedItem],
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
    <div className="cart">
      <div className="cart-container">
        <label>Cart</label>
        <div className="cart-list">
          {data.items.length > 0 ? (
            <div className="cart-item">
              {data.items.map((item) => (
                <div>
                  <span>{item.item_variation_data.name}</span>
                  <span className="price">
                    {formatIntToUSD(
                      item.item_variation_data.price_money.amount
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="summary">
              {data.order ? (
                <div className="summary-cotainer">
                  <div className="total">
                    Total:{" "}
                    <span className="price">
                      {formatIntToUSD(data.order.total_money.amount)}
                    </span>
                  </div>
                  <div className="order-info">
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
      <button onClick={onCheckout}>Checkout</button>
      {data.order ? (
        <div>
          <Card
            amount={data.order.total_money.amount}
            onPaymentSuccess={onPaymentSuccess}
          ></Card>
        </div>
      ) : null}
    </div>
  );
};

export { Cart };

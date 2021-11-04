import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { getCatelog } from "./Catelog";
import { Checkout } from "./Checkout";

// TODO: Dirty hack to not upload an image. If time permits then upload
const catelogItemImageMap = new Map([
  [
    "2VWDQBWU5MTGHHXEJJKVSRMB",
    "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
  ],
]);

const CatelogList = ({ objects }) => {
  return objects?.length > 0
    ? objects.map((object) => {
        const { item_data, id } = object;

        return (
          <div key={id}>
            {/* <div>{object.id}</div> */}
            <div>{item_data.name}</div>
            <div>{item_data.description}</div>
            <br />
            <ItemVariationList variations={item_data.variations} />
          </div>
        );
      })
    : "No items found";
};

const ItemVariationList = ({ variations }) => {
  return variations?.length > 0
    ? variations.map(({ item_variation_data, id }) => {
        return (
          <div key={id}>
            {/* <div>{variation.id}</div> */}
            <img
              src={catelogItemImageMap.get(item_variation_data.item_id)}
              style={{
                width: "15rem",
                height: "20rem",
                borderRadius: "0.2rem",
                border: "1px solid",
              }}
            />
            <div>{item_variation_data.name}</div>
            <div>
              {"$"}
              {item_variation_data.price_money.amount}
            </div>
            <button
              style={{
                backgroundColor: "#a1001a",
                width: "6rem",
                borderRadius: "2.5rem",
                border: "none",
                padding: "0.5rem",
              }}
            >
              Add To Cart
            </button>
          </div>
        );
      })
    : "No items found";
};

const App = () => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    async function setCatelogData() {
      const data = await getCatelog();
      setData(JSON.parse(data.message));
    }

    setCatelogData();
  }, [setData]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          {!data ? (
            "Loading..."
          ) : (
            <div>
              <CatelogList objects={data.objects} />
              <Checkout></Checkout>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default App;

import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { getCatelog } from "./Catelog";
import { Cart } from "./Cart";
import { formatIntToUSD } from "./Utils";

// TODO: Dirty hack to not upload an image. If time permits then upload
const catelogItemImageMap = new Map([
  [
    "2VWDQBWU5MTGHHXEJJKVSRMB",
    "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
  ],
  [
    "LA7JLPQCYIOEX6H4JYIP7I2J",
    "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6094482156140772220/products/83851.main.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
  ],
  [
    "EY7GSDQR3YTT3WGYF4ONSLGW",
    "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3919668293474871955/products/64021.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
  ],
  [
    "HYTZOZZKS627DNV4RZ2IKO6S",
    "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3586934744430991263/products/76650.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
  ],
]);

const CatelogList = ({ objects, onItemClick }) => {
  return objects?.length > 0
    ? objects.map((object) => {
        const { item_data, id } = object;

        return (
          <div key={id}>
            {/* <div>{object.id}</div> */}
            <div style={{ padding: "1rem", minWidth: "20rem" }}>
              {item_data.name}
            </div>
            <div>{item_data.description}</div>
            <br />
            <ItemVariationList
              variations={item_data.variations}
              onItemClick={onItemClick}
            />
          </div>
        );
      })
    : "No items found";
};

const ItemVariationList = ({ variations, onItemClick }) => {
  return variations?.length > 0
    ? variations.map((item) => {
        const { item_variation_data, id } = item;
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
            <div style={{ fontSize: "medium" }}>{item_variation_data.name}</div>
            <div style={{ fontSize: "medium", fontWeight: "bold" }}>
              {formatIntToUSD(item_variation_data.price_money.amount)}
            </div>
            <button
              onClick={() => onItemClick(item)}
              style={{
                backgroundColor: "#a1001a",
                width: "6rem",
                borderRadius: "2.5rem",
                border: "black solid 0.5px",
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
  const [data, setData] = React.useState({ catelog: null, selectedItem: null });

  React.useEffect(() => {
    async function setCatelogData() {
      const data = await getCatelog();
      setData((currentData) => ({
        catelog: JSON.parse(data.message),
        selectedItem: currentData.selectedItem,
      }));
    }

    setCatelogData();
  }, [setData]);

  const onItemClick = React.useCallback(
    (itemId) => {
      setData((data) => ({ catelog: data.catelog, selectedItem: itemId }));
    },
    [setData]
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ width: "100%" }}>
          {!data.catelog ? (
            "Loading..."
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexGrow: "1",
                  flexWrap: "wrap",
                  padding: "2rem",
                }}
              >
                <CatelogList
                  objects={data.catelog.objects}
                  onItemClick={onItemClick}
                />
              </div>
              <Cart selectedItem={data.selectedItem}></Cart>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default App;

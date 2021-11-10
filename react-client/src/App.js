import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { getCatelog } from "./Catelog";
import { Cart } from "./Cart";
import { CatelogList } from "./CatelogList";

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
      </header>
      <div className="main">
        {!data.catelog ? (
          "Loading..."
        ) : (
          <div className="content">
            <div className="list-container">
              <CatelogList
                objects={data.catelog.objects}
                onItemClick={onItemClick}
              />
            </div>
            <Cart selectedItem={data.selectedItem}></Cart>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

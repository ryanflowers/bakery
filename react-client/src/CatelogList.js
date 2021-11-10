import { ItemVariationList } from "./ItemVariationList";

const CatelogList = ({ objects, onItemClick }) => {
  return objects?.length > 0
    ? objects.map((object) => {
        const { item_data, id } = object;

        return (
          <div className="list-item" key={id}>
            <div className="name">{item_data.name}</div>
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

export { CatelogList };

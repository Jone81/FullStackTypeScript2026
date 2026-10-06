import { type ChangeEvent, useDeferredValue, useState } from "react";
import { deferredData, type DeferredMessage } from "./DeferredData";

export default function DeferredValue() {
  const [filterTxt, setFilterTxt] = useState("");
  const [filteredMessages, setFilteredMessages] =
    useState<DeferredMessage[]>(deferredData);
  const deferredMessages = useDeferredValue(filteredMessages);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setFilteredMessages(
        deferredData.filter((data) => data.message.includes(e.target.value))
      );
    } else {
      setFilteredMessages(deferredData);
    }

    setFilterTxt(e.target.value);
  };

  return (
    <div>
      <div>
        Type to filter 30,000 items (useDeferredValue keeps input responsive):
      </div>
      <input
        type="text"
        value={filterTxt}
        onChange={onChange}
        style={{ marginTop: "10px", marginBottom: "15px" }}
      />
      <br />
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {deferredMessages.slice(0, 100).map((msg) => (
          <li key={msg.id}>{msg.message}</li>
        ))}
      </ul>
      {deferredMessages.length > 100 && (
        <div style={{ color: "#888" }}>
          ... and {deferredMessages.length - 100} more items
        </div>
      )}
    </div>
  );
}


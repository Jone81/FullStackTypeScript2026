import { type ChangeEvent, useMemo, useState } from "react";
import "./App.css";
import { type UserType } from "./Home";
import Awaitable from "./Awaitable";

async function fetchData(url: string) {
  const response = await fetch(url);
  const users = await response.json();
  return (Array.isArray(users) ? users : [users]) as UserType[];
}

function App() {
  const [id, setId] = useState("");
  const idToGet = `https://jsonplaceholder.typicode.com/posts/${id}`;
  const fetchPromise = useMemo(() => fetchData(idToGet), [idToGet]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "15px" }}>
        id: <input type="text" value={id} onChange={onChange} />
      </div>
      <Awaitable fetchPromise={fetchPromise} />
    </div>
  );
}

export default App;


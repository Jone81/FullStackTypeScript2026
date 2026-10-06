import { type ChangeEvent, useMemo, useState } from "react";
import "./App.css";
import { type UserType } from "./Home";
import Awaitable from "./Awaitable";
import Transitioner from "./Transitioner";
import DeferredValue from "./DeferredValue";
import UserForm from "./UserForm";
import OptimisticMessages from "./OptimisticMessages";

async function fetchData(url: string) {
  const response = await fetch(url);
  const users = await response.json();
  return (Array.isArray(users) ? users : [users]) as UserType[];
}

function App() {
  const [activeTab, setActiveTab] = useState<
    "awaitable" | "transitioner" | "deferred" | "form" | "optimistic"
  >("optimistic");

  const [id, setId] = useState("");
  const idToGet = `https://jsonplaceholder.typicode.com/posts/${id}`;
  const fetchPromise = useMemo(() => fetchData(idToGet), [idToGet]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chapter 5: Modern React Hooks & Forms</h2>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("awaitable")}
          style={{
            fontWeight: activeTab === "awaitable" ? "bold" : "normal",
            padding: "8px 12px",
          }}
        >
          1. Suspense & use()
        </button>
        <button
          onClick={() => setActiveTab("transitioner")}
          style={{
            fontWeight: activeTab === "transitioner" ? "bold" : "normal",
            padding: "8px 12px",
          }}
        >
          2. useTransition
        </button>
        <button
          onClick={() => setActiveTab("deferred")}
          style={{
            fontWeight: activeTab === "deferred" ? "bold" : "normal",
            padding: "8px 12px",
          }}
        >
          3. useDeferredValue
        </button>
        <button
          onClick={() => setActiveTab("form")}
          style={{
            fontWeight: activeTab === "form" ? "bold" : "normal",
            padding: "8px 12px",
          }}
        >
          4. Forms (useActionState)
        </button>
        <button
          onClick={() => setActiveTab("optimistic")}
          style={{
            fontWeight: activeTab === "optimistic" ? "bold" : "normal",
            padding: "8px 12px",
          }}
        >
          5. useOptimistic
        </button>
      </div>

      <div style={{ borderTop: "1px solid #444", paddingTop: "20px" }}>
        {activeTab === "awaitable" && (
          <div>
            <div style={{ marginBottom: "15px" }}>
              id: <input type="text" value={id} onChange={onChange} />
            </div>
            <Awaitable fetchPromise={fetchPromise} />
          </div>
        )}

        {activeTab === "transitioner" && <Transitioner />}

        {activeTab === "deferred" && <DeferredValue />}

        {activeTab === "form" && <UserForm />}

        {activeTab === "optimistic" && <OptimisticMessages />}
      </div>
    </div>
  );
}

export default App;

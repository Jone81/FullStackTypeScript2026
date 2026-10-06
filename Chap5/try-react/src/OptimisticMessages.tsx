import {
  useOptimistic,
  useState,
  type MouseEvent,
  type ChangeEvent,
  useTransition,
} from "react";

type Message = { id: number; message: string };

export function OptimisticMessages() {
  const [message, setMessage] = useState("");
  const [messagesRetrievedFromApi, setMessagesRetrievedFromApi] = useState<
    Message[]
  >([]);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(messagesRetrievedFromApi, (currentMessages, msg) => {
    return [...currentMessages, { id: currentMessages.length + 1, message: msg }];
  });

  const [_isPending, startTransition] = useTransition();

  const addNonOptimisticMessage = async (msg: string) => {
    await new Promise((res) =>
      setTimeout(() => {
        setMessagesRetrievedFromApi((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            message: msg,
          },
        ]);
        setMessage("");
        res(null);
      }, 2000)
    );
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      addOptimisticMessage(message);
      await addNonOptimisticMessage(message);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          value={message}
          onChange={onChange}
          placeholder="Type a message..."
        />
        <button onClick={onClick} style={{ marginLeft: "10px" }}>
          add
        </button>
      </div>
      <p style={{ fontSize: "14px", color: "#888" }}>
        (Message appears immediately via useOptimistic, server confirms after 2
        sec)
      </p>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {optimisticMessages.map((m, i) => (
          <li
            key={i}
            style={{
              padding: "6px 10px",
              background: "#333",
              color: "#fff",
              borderRadius: "4px",
              marginBottom: "5px",
              maxWidth: "300px",
            }}
          >
            {m.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default OptimisticMessages;


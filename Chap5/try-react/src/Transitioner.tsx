import { useState, useTransition, type MouseEvent } from "react";
import { type UserType } from "./Home";

type SelectedItem = "default" | "users" | "message";

export default function Transitioner() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>("default");
  const [_isPending, startTransition] = useTransition();

  const onClickUsers = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(async () => {
      setSelectedItem("users");
    });
  };

  const onClickMessage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(async () => {
      setSelectedItem("message");
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "400px",
          marginBottom: "15px",
        }}
      >
        <button onClick={onClickUsers}>get users</button>
        <button onClick={onClickMessage}>show message</button>
      </div>
      <div>
        {selectedItem === "default" && <div>Start here</div>}
        {selectedItem === "users" && <UsersLoader />}
        {selectedItem === "message" && <ShowMessage />}
      </div>
    </div>
  );
}

export function UsersLoader() {
  const [users] = useState<UserType[]>(() => {
    const list: UserType[] = [];
    for (let i = 0; i < 200; i++) {
      list.push({
        userId: i,
        id: i,
        title: "Title " + i,
        body: "Body " + i,
      });
    }
    return list;
  });

  return (
    <>
      {users?.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </>
  );
}

export function UserItem({ user }: { user: UserType }) {
  // Artificial CPU delay to demonstrate useTransition responsiveness
  const start = performance.now();
  while (performance.now() - start < 10) {}
  return <div>{user.title}</div>;
}

export function ShowMessage() {
  return <div>Interrupt!</div>;
}


import { useActionState } from "react";
import "./App.css";
import { useProfile } from "./store/profile/ProfileHooks";
import ThemeProvider from "./ThemeContext";
import { ThemeDisplay } from "./ThemeDisplay";

type Login = {
  email: string;
  password: string;
};

function App() {
  const [profile, setProfile] = useProfile();
  const [, action, isPending] = useActionState(
    async (_prevArgs: Login, formData: FormData) => {
      const loginUser = {
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
      };
      await new Promise((res) => setTimeout(res, 1000));
      setProfile({
        id: "1",
        userName: "dave",
        fullName: "Dave Choi",
        email: formData.get("email")?.toString() || "",
        description: "I am a programmer",
      });
      return loginUser;
    },
    { email: "", password: "" }
  );

  return (
    <div style={{ padding: "20px" }}>
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>

      <hr style={{ margin: "20px 0" }} />

      <form action={action}>
        <div>
          <label htmlFor="email">email</label>
          <input id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit" disabled={isPending}>
          submit
        </button>
      </form>
      <br />
      {profile && (
        <pre
          style={{
            background: "#222",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {JSON.stringify(profile, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{ marginTop: "10px", marginBottom: "15px" }}
    >
      {pending ? "Submitting..." : "submit"}
    </button>
  );
}


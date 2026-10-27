import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("renders DisplayTodos component in App", () => {
  render(<App />);
  const labelElement = screen.getByText(/Enter your username/i);
  expect(labelElement).toBeInTheDocument();
});


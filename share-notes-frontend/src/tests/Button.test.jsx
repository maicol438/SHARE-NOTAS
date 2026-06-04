import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../components/ui/Button.jsx";

describe("Button Component", () => {
  it("Debe renderizar con el texto correcto", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("Debe llamar onClick al hacer clic", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Debe mostrar loading y deshabilitar el botón", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("Debe aplicar variante secondary", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("secondary");
  });

  it("Debe aplicar variante danger", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("danger");
  });

  it("No debe llamar onClick si está deshabilitado", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByText("Disabled"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

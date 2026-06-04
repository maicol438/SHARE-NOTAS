import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EmptyState from "../components/ui/EmptyState.jsx";

describe("EmptyState Component", () => {
  it("Debe renderizar el título por defecto para notes", () => {
    render(<EmptyState type="notes" />);
    expect(screen.getByText("Tu espacio está vacío")).toBeInTheDocument();
  });

  it("Debe mostrar descripción por defecto para notes", () => {
    render(<EmptyState type="notes" />);
    expect(screen.getByText(/Empieza a crear tus primeras notas/i)).toBeInTheDocument();
  });

  it("Debe mostrar mensaje para favoritos", () => {
    render(<EmptyState type="favorites" />);
    expect(screen.getByText("Sin favoritos")).toBeInTheDocument();
  });

  it("Debe mostrar mensaje para papelera", () => {
    render(<EmptyState type="trash" />);
    expect(screen.getByText("La papelera está vacía")).toBeInTheDocument();
  });

  it("Debe mostrar mensaje para búsqueda", () => {
    render(<EmptyState type="search" />);
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("Debe mostrar consejos útiles", () => {
    render(<EmptyState type="notes" />);
    expect(screen.getByText("Consejos Útiles")).toBeInTheDocument();
  });
});

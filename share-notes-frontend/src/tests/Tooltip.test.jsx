import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Tooltip from "../components/ui/Tooltip.jsx";

describe("Tooltip Component", () => {
  it("Debe renderizar el contenido children", () => {
    render(<Tooltip text="Info"><button>Hover</button></Tooltip>);
    expect(screen.getByText("Hover")).toBeInTheDocument();
  });

  it("Debe mostrar el texto del tooltip al hacer hover", () => {
    render(<Tooltip text="Información adicional"><span>Elemento</span></Tooltip>);
    fireEvent.mouseEnter(screen.getByText("Elemento"));
    expect(screen.getByText("Información adicional")).toBeInTheDocument();
  });
});

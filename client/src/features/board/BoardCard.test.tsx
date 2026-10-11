import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import type { Application } from "@/types/application";

import { BoardCard } from "./BoardCard";

const application: Application = {
  _id: "application-1",
  company: "Northstar Labs",
  position: "Frontend Engineer",
  status: "applied",
  technologies: ["React"],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

function DraggableBoardCard({ onDragStart, onMove }: { onDragStart: () => void; onMove?: (status: string) => void }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart}>
      <BoardCard application={application} onMove={(_, status) => onMove?.(status)} />
    </DndContext>
  );
}

describe("BoardCard", () => {
  it("starts a mouse drag from card content outside the grip", async () => {
    const onDragStart = vi.fn();
    renderWithProviders(<DraggableBoardCard onDragStart={onDragStart} />);

    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent(screen.getByText("Northstar Labs"), mouseDown);
    fireEvent.mouseMove(document, {
      clientX: 25,
      clientY: 10,
    });

    await waitFor(() => expect(onDragStart).toHaveBeenCalledOnce());
    fireEvent.mouseUp(document);
  });

  it("keeps the grip available for keyboard dragging", async () => {
    const onDragStart = vi.fn();
    renderWithProviders(<DraggableBoardCard onDragStart={onDragStart} />);

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Move Frontend Engineer at Northstar Labs" }),
      { code: "Space", key: " " },
    );

    await waitFor(() => expect(onDragStart).toHaveBeenCalledOnce());
    fireEvent.keyDown(document, { code: "Escape", key: "Escape" });
  });

  it("still opens application details on a normal link click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DraggableBoardCard onDragStart={vi.fn()} />} />
        <Route path="/applications/:id" element={<p>Application details</p>} />
      </Routes>,
    );

    await user.click(screen.getByRole("link", { name: "Frontend Engineer" }));

    expect(screen.getByText("Application details")).toBeInTheDocument();
  });

  it("offers only valid moves through a keyboard and touch friendly select", async () => {
    const user = userEvent.setup();
    const onDragStart = vi.fn();
    const onMove = vi.fn();
    renderWithProviders(<DraggableBoardCard onDragStart={onDragStart} onMove={onMove} />);
    const select = screen.getByRole("combobox", { name: "Move Frontend Engineer at Northstar Labs to a stage" });
    expect(screen.queryByRole("option", { name: "Saved" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Interview" })).toBeInTheDocument();
    await user.selectOptions(select, "screening");
    expect(onMove).toHaveBeenCalledWith("screening");
    expect(onDragStart).not.toHaveBeenCalled();
  });
});

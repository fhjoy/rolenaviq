import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/server";
import { ApplicationTransfer } from "./ApplicationTransfer";

describe("CSV import preview", () => {
  it("shows errors before allowing a file to be imported", async () => {
    const user = userEvent.setup();
    let imports = 0;
    server.use(
      http.post("http://localhost/api/applications/import/preview", () => HttpResponse.json({
        total: 2, importable: 1, duplicates: [], errors: [{ row: 3, message: "Company is required" }],
      })),
      http.post("http://localhost/api/applications/import", () => { imports++; return HttpResponse.json({ imported: 1, duplicates: [] }, { status: 201 }); }),
    );
    renderWithProviders(<ApplicationTransfer />);
    await user.upload(screen.getByLabelText("Import CSV"), new File(["test"], "applications.csv", { type: "text/csv" }));
    expect(await screen.findByText(/Row 3: Company is required/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import 1 applications" })).toBeDisabled();
    expect(imports).toBe(0);
  });
});

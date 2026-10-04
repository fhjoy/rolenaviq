describe("interview preparation", () => {
  it("sends visitors to sign-in and returns them to Angular", () => {
    cy.visit("/prep/");
    cy.location("pathname").should("eq", "/login");
    cy.location("search").should("contain", "returnTo=%2Fprep%2F");

    cy.get("#email").type("demo@rolenaviq.app");
    cy.get("#password").type("RoleNaviqDemo2026!");
    cy.contains("button", "Sign in").click();

    cy.location("pathname").should("eq", "/prep/");
    cy.contains("h1", "Walk into your next interview ready.").should("be.visible");
  });

  it("opens Angular from React and saves preparation for an interview", () => {
    cy.loginDemo();

    cy.request("POST", "/api/applications", {
      company: "Angular Prep Test",
      position: "Frontend Developer",
      status: "interview",
      interviewDate: "2026-11-02T09:00:00.000Z",
      technologies: ["Angular"],
    }).then(({ body }) => {
      const id = body.application._id as string;

      cy.contains("a", "Interview prep").click();
      cy.location("pathname").should("eq", "/prep/");
      cy.contains("Angular Prep Test").should("be.visible");
      cy.visit(`/prep/interviews/${id}`);
      cy.contains("h1", "Frontend Developer").should("be.visible");
      cy.contains("button", "Save preparation").should("be.disabled");
      cy.contains("label", "Research the company and its product").click();
      cy.get("#prep-notes").type("Review the team's product.");
      cy.intercept("PUT", `/api/prep/interviews/${id}`).as("savePreparation");
      cy.contains("button", "Save preparation").should("be.enabled").click();
      cy.wait("@savePreparation").its("response.statusCode").should("eq", 200);
      cy.contains('[aria-live="polite"]', "Preparation saved successfully")
        .should("be.visible");
      cy.contains("button", "Save preparation").should("be.disabled");

      cy.reload();
      cy.get("#prep-notes").should("have.value", "Review the team's product.");
      cy.contains("label", "Research the company and its product")
        .find("input")
        .should("be.checked");
      cy.contains("button", "Save preparation").should("be.disabled");
      cy.get("#prep-notes").type(" Prepare a project story.");
      cy.contains("button", "Save preparation").should("be.enabled");
    });
  });

  it("saves a question and records a practice session across Angular pages", () => {
    cy.loginDemo();
    cy.request("POST", "/api/applications", {
      company: "Practice Journey Test",
      position: "Frontend Developer",
      status: "interview",
      interviewDate: "2026-11-02T09:00:00.000Z",
      technologies: ["Angular"],
    }).then(({ body }) => {
      const id = body.application._id as string;
      cy.visit(`/prep/interviews/${id}/questions`);
      cy.contains("h1", "Practice Journey Test").should("be.visible");
      cy.get("#answer-accessibility").type("Use labels and keyboard tests.");
      cy.contains("button", "Save answers").click();
      cy.contains("Your answers are up to date.").should("be.visible");
      cy.reload();
      cy.get("#answer-accessibility").should("have.value", "Use labels and keyboard tests.");

      cy.visit(`/prep/interviews/${id}/practice`);
      for (let i = 0; i < 4; i++) {
        cy.contains("label", "Getting there").click();
        cy.contains("button", "Next question").click();
      }
      cy.contains("label", "Confident").click();
      cy.contains("button", "Finish and save session").click();
      cy.contains("Session saved").should("be.visible");
      cy.visit("/prep/");
      cy.contains("article", "Practice Journey Test").should("contain", "1 practice session completed");
    });
  });
});

import type { IApplication } from "../models/Application.js";

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9, 0, 0, 0);
  return date;
}

export function createDemoApplications(userId: IApplication["userId"]) {
  return [
    {
      userId,
      company: "Northstar Labs",
      position: "Frontend Engineer",
      location: "Berlin, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "interview",
      technologies: ["React", "TypeScript", "TanStack Query"],
      appliedAt: daysAgo(18),
      interviewDate: daysFromNow(2, 10, 30),
      notes: "Second-round interview with the product engineering team.",
    },
    {
      userId,
      company: "Cloudforge",
      position: "Full Stack Developer",
      location: "Hamburg, Germany",
      workplaceType: "remote",
      employmentType: "full_time",
      status: "technical_interview",
      technologies: ["React", "Node.js", "MongoDB"],
      appliedAt: daysAgo(22),
      interviewDate: daysFromNow(5, 14, 0),
      notes: "Technical discussion focused on APIs and frontend architecture.",
    },
    {
      userId,
      company: "OrbitWorks",
      position: "Web Application Developer",
      location: "Munich, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "screening",
      technologies: ["Vue", "TypeScript", "REST"],
      appliedAt: daysAgo(9),
      notes: "Recruiter screening completed; waiting for engineering feedback.",
    },
    {
      userId,
      company: "BrightPixel",
      position: "Senior Frontend Developer",
      location: "Frankfurt, Germany",
      workplaceType: "remote",
      employmentType: "full_time",
      status: "applied",
      technologies: ["React", "Accessibility", "Cypress"],
      appliedAt: daysAgo(4),
    },
    {
      userId,
      company: "Nexora Systems",
      position: "Frontend Developer",
      location: "Cologne, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "offer",
      technologies: ["React", "TypeScript", "GraphQL"],
      appliedAt: daysAgo(31),
      notes: "Offer received. Reviewing compensation and start date.",
    },
    {
      userId,
      company: "PixelRoute",
      position: "React Developer",
      location: "Stuttgart, Germany",
      workplaceType: "onsite",
      employmentType: "full_time",
      status: "rejected",
      technologies: ["React", "JavaScript", "Jest"],
      appliedAt: daysAgo(44),
    },
    {
      userId,
      company: "GreenStack",
      position: "Full Stack JavaScript Developer",
      location: "Freiburg, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "saved",
      technologies: ["React", "Node.js", "PostgreSQL"],
      notes: "Interesting role. Review the job description before applying.",
    },
    {
      userId,
      company: "DataNest",
      position: "Frontend Engineer",
      location: "Remote, Germany",
      workplaceType: "remote",
      employmentType: "contract",
      status: "withdrawn",
      technologies: ["TypeScript", "React", "Design Systems"],
      appliedAt: daysAgo(36),
    },
    {
      userId,
      company: "Studio Meridian",
      position: "UI Engineer",
      location: "Düsseldorf, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "applied",
      technologies: ["React", "CSS", "Storybook"],
      appliedAt: daysAgo(13),
    },
    {
      userId,
      company: "Vector One",
      position: "Software Developer",
      location: "Karlsruhe, Germany",
      workplaceType: "hybrid",
      employmentType: "full_time",
      status: "screening",
      technologies: ["TypeScript", "Node.js", "Docker"],
      appliedAt: daysAgo(16),
    },
  ];
}

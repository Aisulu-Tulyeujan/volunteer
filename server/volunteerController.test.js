
const request = require("supertest");
const express = require("express");
const volunteerRoutes = require("../routes/volunteerRoutes");

const app = express();
app.use(express.json());
app.use("/profiles", volunteerRoutes);

describe("Volunteer API", () => {
  let testProfile = {
    fullName: "Noelanie",
    email: "volunteer@example.com",
    address1: "123 Main St",
    city: "Houston",
    state: "TX",
    zip: "77001",
    skills: ["team work"],
    preferences: "none",
    availability: ["2025-10-18"],
  };

  // Reset profiles before each test
  beforeEach(() => {
    // Clear in-memory database
    const controller = require("../controllers/volunteerController");
    controller.__setProfiles([]); // We'll add this helper
  });

  test("GET /profiles should return an empty array initially", async () => {
    const res = await request(app).get("/profiles");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test("POST /profiles should create a new profile", async () => {
    const res = await request(app).post("/profiles").send(testProfile);
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(testProfile);
  });

  test("PUT /profiles/:email should update an existing profile", async () => {
    await request(app).post("/profiles").send(testProfile);
    const updatedProfile = { ...testProfile, city: "Austin" };
    const res = await request(app)
      .put(`/profiles/${encodeURIComponent(testProfile.email)}`)
      .send(updatedProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.city).toBe("Austin");
  });

  test("PUT /profiles/:email should return 404 if profile not found", async () => {
    const res = await request(app)
      .put("/profiles/nonexistent@example.com")
      .send(testProfile);
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /profiles/:name should delete a profile", async () => {
    await request(app).post("/profiles").send(testProfile);
    const res = await request(app).delete(`/profiles/${encodeURIComponent(testProfile.fullName)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/);
  });
});

const { MongoClient } = require("mongodb");

let cachedClient = null;

async function getCollection() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured. Add it in Vercel Environment Variables.");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }

  const db = cachedClient.db(process.env.MONGODB_DB || "OnlineResumeDB");
  return db.collection("Resumes");
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const collection = await getCollection();

    if (req.method === "GET") {
      const resumes = await collection.find({}).sort({ updatedAt: -1 }).limit(100).toArray();
      return res.status(200).json(resumes.map(({ _id, ...doc }) => ({ id: _id.toString(), ...doc })));
    }

    if (req.method === "POST") {
      const { name, role, email, phone, location, summary, skills, education, projects, linkedin, github } = req.body || {};
      if (!name || !role || !email) {
        return res.status(400).json({ error: "Name, role, and email are required." });
      }
      const doc = {
        name: String(name).trim(),
        role: String(role).trim(),
        email: String(email).trim(),
        phone: String(phone || "").trim(),
        location: String(location || "").trim(),
        summary: String(summary || "").trim(),
        skills: String(skills || "").split(",").map(s => s.trim()).filter(Boolean),
        education: String(education || "").trim(),
        projects: String(projects || "").trim(),
        linkedin: String(linkedin || "").trim(),
        github: String(github || "").trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(doc);
      return res.status(201).json({ id: result.insertedId.toString(), ...doc });
    }

    if (req.method === "PUT") {
      const { id, ...body } = req.body || {};
      const { ObjectId } = require("mongodb");
      if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: "A valid resume ID is required." });
      if (!body.name || !body.role || !body.email) return res.status(400).json({ error: "Name, role, and email are required." });

      const update = {
        name: String(body.name).trim(),
        role: String(body.role).trim(),
        email: String(body.email).trim(),
        phone: String(body.phone || "").trim(),
        location: String(body.location || "").trim(),
        summary: String(body.summary || "").trim(),
        skills: String(body.skills || "").split(",").map(s => s.trim()).filter(Boolean),
        education: String(body.education || "").trim(),
        projects: String(body.projects || "").trim(),
        linkedin: String(body.linkedin || "").trim(),
        github: String(body.github || "").trim(),
        updatedAt: new Date()
      };
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
      if (!result.matchedCount) return res.status(404).json({ error: "Resume not found." });
      return res.status(200).json({ id, ...update });
    }

    if (req.method === "DELETE") {
      const { ObjectId } = require("mongodb");
      const id = req.query?.id;
      if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: "A valid resume ID is required." });
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return res.status(404).json({ error: "Resume not found." });
      return res.status(200).json({ message: "Resume deleted." });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Resume API error:", error);
    return res.status(500).json({ error: "Database operation failed. Check the MongoDB Atlas connection and environment variables." });
  }
};
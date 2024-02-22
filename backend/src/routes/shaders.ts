import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const tag = (req.query.tag as string) || "";

    const where: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ],
      });
    }

    if (category) {
      conditions.push({ category: { equals: category } });
    }

    if (tag) {
      conditions.push({ tags: { contains: tag } });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [shaders, total] = await Promise.all([
      prisma.shader.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.shader.count({ where }),
    ]);

    res.json({
      shaders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to list shaders:", error);
    res.status(500).json({ error: "Failed to fetch shaders" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid shader ID" });
    }

    const shader = await prisma.shader.findUnique({ where: { id } });
    if (!shader) {
      return res.status(404).json({ error: "Shader not found" });
    }

    res.json(shader);
  } catch (error) {
    console.error("Failed to fetch shader:", error);
    res.status(500).json({ error: "Failed to fetch shader" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, glslCode, tags, category, author } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!glslCode?.trim()) {
      return res.status(400).json({ error: "GLSL code is required" });
    }

    const shader = await prisma.shader.create({
      data: {
        title: title.trim(),
        description: (description || "").trim(),
        glslCode: glslCode.trim(),
        tags: (tags || "").trim(),
        category: (category || "General").trim(),
        author: (author || "Anonymous").trim(),
      },
    });

    res.status(201).json(shader);
  } catch (error) {
    console.error("Failed to create shader:", error);
    res.status(500).json({ error: "Failed to create shader" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid shader ID" });
    }

    const existing = await prisma.shader.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Shader not found" });
    }

    const { title, description, glslCode, tags, category, author } = req.body;

    const shader = await prisma.shader.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        glslCode: glslCode !== undefined ? glslCode.trim() : undefined,
        tags: tags !== undefined ? tags.trim() : undefined,
        category: category !== undefined ? category.trim() : undefined,
        author: author !== undefined ? author.trim() : undefined,
      },
    });

    res.json(shader);
  } catch (error) {
    console.error("Failed to update shader:", error);
    res.status(500).json({ error: "Failed to update shader" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid shader ID" });
    }

    const existing = await prisma.shader.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Shader not found" });
    }

    await prisma.shader.delete({ where: { id } });

    res.json({ message: "Shader deleted successfully" });
  } catch (error) {
    console.error("Failed to delete shader:", error);
    res.status(500).json({ error: "Failed to delete shader" });
  }
});

export default router;

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPosts(req: Request, res: Response) {
  const { search } = req.query;
  const { subjectId } = req.params;
  try {
    if (search) {
      const posts = await prisma.post.findMany({
        where: {
          subjectId: parseInt(subjectId),
          OR: [
            { title: { contains: String(search), mode: "insensitive" } },
            { content: { contains: String(search), mode: "insensitive" } },
          ],
        },
      });
      return res.status(200).json({ status: "success", data: posts });
    }
    const posts = await prisma.post.findMany({ where: { subjectId: parseInt(subjectId) } });
    res.status(200).json({ status: "success", data: posts });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function getPostById(req: Request, res: Response) {
  const { subjectId, id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { subjectId: parseInt(subjectId), id: parseInt(id) },
    });
    if (!post) return res.status(404).json({ status: "fail", message: "Post not found" });
    res.status(200).json({ status: "success", data: post });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function createPost(req: Request, res: Response) {
  const { title, content } = req.body;
  const { subjectId } = req.params;
  try {
    const newPost = await prisma.post.create({
      data: { title, content, subjectId: parseInt(subjectId), uploadedBy: res.locals.user.id },
    });
    res.status(201).json({ status: "success", data: newPost });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function updatePost(req: Request, res: Response) {
  const { subjectId, id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { subjectId: parseInt(subjectId), id: parseInt(id) },
    });
    if (!post) return res.status(404).json({ status: "fail", message: "Post not found" });
    const { title, content } = req.body;
    const updatedData: any = {};
    if (title) updatedData.title = title;
    if (content) updatedData.title = content;
    const updatedPost = await prisma.post.update({
      where: { subjectId: parseInt(subjectId), id: parseInt(id) },
      data: updatedData,
    });
    res.status(200).json({ status: "success", data: updatedPost });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function deletePost(req: Request, res: Response) {
  const { subjectId, id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { subjectId: parseInt(subjectId), id: parseInt(id) },
    });
    if (!post) return res.status(404).json({ status: "fail", message: "Post not found" });
    await prisma.post.delete({ where: { subjectId: parseInt(subjectId), id: parseInt(id) } });
    res.status(200).json({ status: "success", message: "Post deleted successfully" });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

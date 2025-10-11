import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function checkSubjectExists(req: Request, res: Response, next: Function) {
  const { subjectId } = req.params;
  try {
    const room = await prisma.subjectRoom.findUnique({ where: { id: parseInt(subjectId) } });
    if (!room) return res.status(404).json({ status: "fail", message: "Room not found" });
    next();
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

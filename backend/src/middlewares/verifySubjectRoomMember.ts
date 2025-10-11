import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function verifySubjectRoomMember(req: Request, res: Response, next: Function) {
  const { subjectId } = req.params;
  try {
    const membership = await prisma.memberShip.findFirst({
      where: { subjectId: parseInt(subjectId), userId: parseInt(res.locals.user.id) },
    });
    if (!membership) res.status(403).json({ status: "fail", message: "You are not a member of this subject room" });
    next();
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

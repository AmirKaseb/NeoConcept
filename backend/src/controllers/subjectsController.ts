import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRooms(req: Request, res: Response) {
  const { search } = req.query;
  try {
    if (search) {
      const rooms = await prisma.subjectRoom.findMany({
        where: {
          OR: [
            { name: { contains: String(search), mode: "insensitive" } },
            { description: { contains: String(search), mode: "insensitive" } },
          ],
        },
      });
      return res.status(200).json({ status: "success", data: rooms });
    }
    const rooms = await prisma.subjectRoom.findMany();
    res.status(200).json({ status: "success", data: rooms });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function getRoomById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const room = await prisma.subjectRoom.findFirst({ where: { id: parseInt(id) } });
    if (!room) return res.status(404).json({ status: "fail", message: "Room not found" });
    res.status(200).json({ status: "success", data: room });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function createRoom(req: Request, res: Response) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ status: "fail", message: "Subject room name is required" });
  try {
    const userRooms = await prisma.subjectRoom.findMany({ where: { createdBy: res.locals.user.id } });
    if (userRooms.some((room) => room.name === name))
      return res.status(400).json({ status: "fail", message: "Duplicate subject room name. Please choose another." });
    let newRoom;
    await prisma.$transaction(async (tx) => {
      newRoom = await tx.subjectRoom.create({
        data: { name, description, createdBy: res.locals.user.id },
      });
      await tx.memberShip.create({
        data: { userId: res.locals.user.id, subjectId: newRoom.id, roleInSubject: Role.INSTRUCTOR },
      });
    });
    res.status(201).json({ status: "success", data: newRoom });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function updateRoom(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const room = await prisma.subjectRoom.findFirst({ where: { id: parseInt(id) } });
    if (!room) return res.status(404).json({ status: "fail", message: "Room not found" });
    const { name, description } = req.body;
    const updatedData: any = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;
    const userRooms = await prisma.subjectRoom.findMany({ where: { createdBy: res.locals.user.id } });
    if (userRooms.some((room) => room.name === name))
      return res.status(400).json({ status: "fail", message: "Duplicate subject room name. Please choose another." });
    const updatedRoom = await prisma.subjectRoom.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });
    res.status(200).json({ status: "success", data: updatedRoom });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const room = await prisma.subjectRoom.findFirst({ where: { id: parseInt(id) } });
    if (!room) return res.status(404).json({ status: "fail", message: "Room not found" });
    await prisma.subjectRoom.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ status: "success", message: "Room deleted successfully" });
  } catch (err) {
    console.log((err as Error).message);
    res.status(500).json({ status: "fail", message: "Something went wrong" });
  }
}

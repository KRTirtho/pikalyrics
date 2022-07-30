import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { prisma } from "configurations";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOpts } from "./auth/[...nextauth]";

export default async function publishLyric(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.status(404);
      return res.send(`Route ${req.method} ${req.url} not found`);
    }
    const session = await unstable_getServerSession(req, res, authOpts);

    if (!session) {
      res.status(401);
      return res.json({ error: "user is not authenticated" });
    }

    const user = await prisma.user.findFirst({
      where: { email: session!.user!.email },
    });

    if (!user) {
      res.status(404);
      return res.json({ error: "no user found" });
    }

    const lyrics = await prisma.lyrics.create({
      data: {
        syncedLyrics: req.body.syncedLyrics,
        owner: req.body.owner,
        title: req.body.title,
        youtubeId: req.body.youtubeId,
        authors: req.body.authors,
        uploader: { connect: { id: user!.id } },
      },
    });
    res.status(201);
    res.json(lyrics);
  } catch (e) {
    console.error(`[${new Date()}] ${req.url}:`, e);
    if (e instanceof PrismaClientKnownRequestError) {
      res.json({ error: e.message, code: e.code });
    }
  }
}

import { Router } from "express";
import { createChat, getChatMessages } from "./chat.controller";

const router = Router();

router.get("/", createChat);
router.get("/:chatid/messages", getChatMessages);

export default router;

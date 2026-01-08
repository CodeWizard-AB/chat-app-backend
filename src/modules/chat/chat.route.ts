import { Router } from "express";
import { getChatMessages } from "./chat.controller";

const router = Router();

router.get("/:chatid/messages", getChatMessages);

export default router;

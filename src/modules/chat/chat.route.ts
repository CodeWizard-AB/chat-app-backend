import { Router } from "express";
import chatController from "./chat.controller";

const router = Router();

router.post("/", chatController.createChat);
router.get("/:chatId/messages", chatController.getChatMessages);
router.delete("/:chatId/users", chatController.deleteUserFromChat);
router.post("/:chatId/users", chatController.addUserToChat);

export default router;

import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { createTodo, getMyTodos, updateTodo, deleteTodo } from "../controllers/todoController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTodo);
router.get("/", getMyTodos);
router.patch("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
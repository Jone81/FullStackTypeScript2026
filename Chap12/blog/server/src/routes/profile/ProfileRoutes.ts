import { Router } from "express";
import {
  createProfile,
  createProfileAvatar,
  getMe,
  getMostPopularAuthors,
  getProfile,
  getProfileAvatar,
  login,
  logout,
  refresh,
  updateProfile,
} from "../../controllers/ProfileController";
import multer from "multer";
import { authenticationHandler } from "../../middleware/AuthenticationHandler";
import { validate } from "../lib/Validation";
import { createProfileSchema } from "lib/dist/validation/ProfileSchema";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post(
  "/profile/avatar/new",
  authenticationHandler,
  upload.single("file"),
  createProfileAvatar
);
router.post("/profile/logout", logout);
router.post("/profile/refresh", refresh);
router.get("/profile/me", authenticationHandler, getMe);
router.post(
  "/profile/update",
  authenticationHandler,
  upload.single("file"),
  updateProfile
);

router.get("/profile/avatar/:avatarId", getProfileAvatar);
router.post("/profile/login", upload.none(), login);

router.post(
  "/profile/new",
  upload.single("file"),
  validate({ body: createProfileSchema }),
  createProfile
);
router.get("/profile/:profileId", getProfile);
router.get("/profile_popular", getMostPopularAuthors);

export default router;

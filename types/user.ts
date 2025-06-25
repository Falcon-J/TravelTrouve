import type { User as FirebaseUser } from "firebase/auth";

export interface User extends Omit<FirebaseUser, "delete" | "reload"> {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type AppUser = User & FirebaseUser;

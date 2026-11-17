import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function verifyPassword(
  password: string,
  storedPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(storedPassword, password);
  } catch {
    return false;
  }
}

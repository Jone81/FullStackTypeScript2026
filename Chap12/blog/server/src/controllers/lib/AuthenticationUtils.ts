import { SignJWT, jwtVerify, decodeJwt } from "jose";
import ms, { type StringValue } from "ms";
import type { Response } from "express";

export type JwtPayloadType = "access" | "refresh";
export type JwtPayload = {
  userId: string;
  type: JwtPayloadType;
  exp: number; // in unix seconds
};

function getCookieDomain() {
  if (!process.env.COOKIE_DOMAIN) {
    throw new Error("COOKIE_DOMAIN not set!");
  }

  return process.env.COOKIE_DOMAIN;
}
const COOKIE_DOMAIN = getCookieDomain();

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET not set! Cannot generate authentication token."
    );
  }

  return process.env.JWT_SECRET;
}
const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

function getJwtRefreshSecret() {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET not set! Cannot generate refresh token."
    );
  }

  return process.env.JWT_REFRESH_SECRET;
}
const JWT_REFRESH_SECRET = new TextEncoder().encode(getJwtRefreshSecret());

export async function getToken(userId: string, isRefresh = false): Promise<string> {
  const secret = !isRefresh ? JWT_SECRET : JWT_REFRESH_SECRET;
  const expiresIn = !isRefresh
    ? (process.env.JWT_EXPIRES_IN || "15m")
    : (process.env.JWT_REFRESH_EXPIRES_IN || "7d");

  return await new SignJWT({
    userId,
    type: !isRefresh ? "access" : "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(COOKIE_DOMAIN)
    .setAudience(COOKIE_DOMAIN)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJwtToken(
  token: string,
  isRefresh = false
): Promise<JwtPayload> {
  const secret = !isRefresh ? JWT_SECRET : JWT_REFRESH_SECRET;
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: COOKIE_DOMAIN,
      audience: COOKIE_DOMAIN,
    });

    return {
      userId: (payload.userId || payload.sub) as string,
      type: payload.type as JwtPayloadType,
      exp: payload.exp as number,
    };
  } catch (e: any) {
    if (e.code === "ERR_JWT_EXPIRED") {
      try {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp) {
          return {
            userId: (decoded.userId || decoded.sub) as string,
            type: decoded.type as JwtPayloadType,
            exp: decoded.exp as number,
          };
        }
      } catch {
        // ignore decode failure
      }
      throw new Error("Token expired");
    }
    if (
      e.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
      e.code === "ERR_JWS_INVALID"
    ) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

function getCookieOptions(name: JwtPayloadType) {
  const domain =
    process.env.NODE_ENV === "development" ? undefined : COOKIE_DOMAIN;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.SAME_SITE
      ? (process.env.SAME_SITE as "none" | "lax" | "strict")
      : "lax",
    domain,
    path: "/",
    maxAge:
      name === "access"
        ? ms((process.env.JWT_EXPIRES_IN || "15m") as StringValue)
        : ms((process.env.JWT_REFRESH_EXPIRES_IN || "7d") as StringValue),
  };
}

function setSecureCookie(
  res: Response,
  name: JwtPayloadType,
  tokenValue: string
) {
  res.cookie(name, tokenValue, getCookieOptions(name));
}

export async function setAuthCookies(res: Response, userId: string) {
  const [accessToken, refreshToken] = await Promise.all([
    getToken(userId),
    getToken(userId, true),
  ]);
  setSecureCookie(res, "access", accessToken);
  setSecureCookie(res, "refresh", refreshToken);
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("access", getCookieOptions("access"));
  res.clearCookie("refresh", getCookieOptions("refresh"));
}

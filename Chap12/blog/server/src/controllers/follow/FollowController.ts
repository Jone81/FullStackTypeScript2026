import type { NextFunction, Request, Response } from "express";
import { serializeBigInt } from "lib/src/JsonUtils";
import { type PagingParams } from "../PagingParams";

export async function createFollow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { followedId, followerId }: { followedId: string | bigint; followerId: string | bigint } = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          (await req.repo.Follow.insertFollow(BigInt(followedId), BigInt(followerId))).id
        )
      );
  } catch (e) {
    next(e);
  }
}

export async function getFollowers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, pageSize, lastCursor }: PagingParams = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          await req.repo.Follow.selectFollowers(
            BigInt(id),
            pageSize,
            lastCursor ? BigInt(lastCursor) : undefined
          )
        )
      );
  } catch (e) {
    next(e);
  }
}

export async function getFollowersCount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const followedId = req.params.followedId;
    res
      .status(200)
      .json(await req.repo.Follow.selectFollowersCount(BigInt(followedId as string)));
  } catch (e) {
    next(e);
  }
}

export async function getFollowed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, pageSize, lastCursor }: PagingParams = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          await req.repo.Follow.selectFollowed(
            BigInt(id),
            pageSize,
            lastCursor ? BigInt(lastCursor) : undefined
          )
        )
      );
  } catch (e) {
    next(e);
  }
}

export async function getFollowedCount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const followerId = req.params.followerId;
    res
      .status(200)
      .json(await req.repo.Follow.selectFollowedCount(BigInt(followerId as string)));
  } catch (e) {
    next(e);
  }
}

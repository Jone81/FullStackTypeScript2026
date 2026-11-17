import type { NextFunction, Request, Response } from "express";
import { serializeBigInt } from "lib";
import type { PagingParams } from "../PagingParams";

export const createWorkResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      workId,
      responderId,
      response,
    }: { workId: string | bigint; responderId: string | bigint; response: string } = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          (
            await req.repo.WorkResp.insertWorkResponse(
              BigInt(workId),
              BigInt(responderId),
              response
            )
          ).id
        )
      );
  } catch (e) {
    next(e);
  }
};

export const getWorkResponses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, pageSize, lastCursor }: PagingParams = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          await req.repo.WorkResp.selectWorkResponses(
            BigInt(id),
            pageSize,
            lastCursor ? BigInt(lastCursor) : undefined
          )
        )
      );
  } catch (e) {
    next(e);
  }
};

export const getWorkResponsesByAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, pageSize, lastCursor }: PagingParams = req.body;
    res
      .status(200)
      .json(
        serializeBigInt(
          await req.repo.WorkResp.selectWorkResponsesByAuthor(
            BigInt(id),
            pageSize,
            lastCursor ? BigInt(lastCursor) : undefined
          )
        )
      );
  } catch (e) {
    next(e);
  }
};

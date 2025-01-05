import { RequestHandler } from "msw";
import { getPostsList } from "./get-posts-list";
import { getPostsDetail } from "./get-posts-detail";

export const handlers: RequestHandler[] = [getPostsList, getPostsDetail];

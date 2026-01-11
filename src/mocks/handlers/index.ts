import { RequestHandler } from "msw";
import { getPostsList } from "./get-posts-list";
import { getPostsDetail } from "./get-posts-detail";
import { postGenerate } from "./post-generate";

export const handlers: RequestHandler[] = [
  getPostsList,
  getPostsDetail,
  postGenerate,
];

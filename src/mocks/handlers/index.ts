import { RequestHandler } from "msw";
import { getBlogList } from "./get-blog-list";

export const handlers: RequestHandler[] = [getBlogList];

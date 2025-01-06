import { BASE_URL } from "@/hooks/utils/fetcher";
import { http, HttpResponse } from "msw";

export const postBlogSave = http.post(
  `${BASE_URL}/blog/save`,
  async ({ request }) => {
    const newPost = await request.json();

    console.log("post request", newPost);

    return HttpResponse.json(1, { status: 201 });
  },
);

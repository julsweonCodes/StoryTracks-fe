import { BASE_URL } from "@/hooks/utils/fetcher";
import { http, HttpResponse } from "msw";

export const postBlogSave = http.post(
  `${BASE_URL}/blog/save`,
  async ({ request }) => {
    const formData = await request.formData();

    // FormData를 JSON으로 변환
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        // 같은 키에 여러 값이 있을 경우 배열로 처리
        data[key] = Array.isArray(data[key])
          ? [...data[key], value]
          : [data[key], value];
      } else {
        data[key] = value;
      }
    });

    // 파일 정보 디버깅
    if (data.files) {
      console.log("Files received:");
      (data.files as File[]).forEach((file, index) => {
        if (file instanceof File) {
          console.log(
            `File ${index + 1}:`,
            `Name: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB`,
          );
        }
      });
    }

    // 디버깅 출력
    console.log("Parsed FormData:", data);

    return HttpResponse.json(1, { status: 201 });
  },
);

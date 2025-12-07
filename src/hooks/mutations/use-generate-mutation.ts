import { useMutation, UseMutationOptions } from "react-query";
import { DefaultResponse } from "../utils/fetcher";
import { AiContentInfo } from "@/context/form-context";

interface GenerateResponse {
  genRes1: string;
  genRes2: string;
  genRes3: string;
}

export interface GenerateImageInfo {
  geoLat: string;
  geoLong: string;
  imgDtm: string;
}

interface GenerateMutation {
  imgInfo: GenerateImageInfo;
  ogText: string;
}

const useGenerateMutation = (
  options: UseMutationOptions<GenerateResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "generate",
    mutationFn: async (data: GenerateMutation) => {
      const response = await fetch(
        `/api/backend/blog/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      return response.json();
    },
    ...options,
  });
};

const transformToAiContentInfo = (
  data: { [key: string]: string }[],
): AiContentInfo[] => {
  return data.map((item) => {
    const [title, content] = Object.entries(item)[0]; // 첫 번째 key-value 추출
    return { title, content };
  });
};

export { useGenerateMutation, transformToAiContentInfo };

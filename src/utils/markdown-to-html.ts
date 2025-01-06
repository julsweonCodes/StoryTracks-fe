import { remark } from "remark";
import html from "remark-html";

/**
 * 마크다운 문자열을 HTML로 변환하는 함수
 * @param markdown - 마크다운 형식의 문자열
 * @returns HTML 형식의 문자열
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const processedContent = await remark().use(html).process(markdown);
  return processedContent.toString();
}

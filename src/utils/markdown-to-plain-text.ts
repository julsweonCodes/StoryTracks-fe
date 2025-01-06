import { remark } from "remark";
import html from "remark-html";
import striptags from "striptags";

export const markdownToPlainText = async (
  markdown: string,
): Promise<string> => {
  const processedContent = await remark().use(html).process(markdown);
  const htmlContent = processedContent.toString();
  return striptags(htmlContent);
};

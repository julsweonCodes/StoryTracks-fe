import { remark } from "remark";
import html from "remark-html";

/**
 * 마크다운 문자열을 HTML로 변환하는 함수
 * Preserves <img src="..."> tags by temporarily replacing them,
 * processing markdown, then restoring them
 * @param markdown - 마크다운 형식의 문자열
 * @returns HTML 형식의 문자열
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  // Step 1: Extract and temporarily replace <img> tags to preserve them
  // Use a placeholder that won't be interpreted by markdown (no underscores, asterisks, etc.)
  const imgTags: string[] = [];
  const imgPlaceholders = markdown.replace(/<img[^>]*>/g, (match) => {
    imgTags.push(match);
    const placeholder = `IMGPLACEHOLDER${imgTags.length - 1}ENDIMG`;
    console.log(`[markdownToHtml] Extracted img tag:`, match);
    console.log(`[markdownToHtml] Using placeholder:`, placeholder);
    return placeholder;
  });

  console.log(
    "[markdownToHtml] After placeholder replacement:",
    imgPlaceholders,
  );
  console.log("[markdownToHtml] Total img tags found:", imgTags.length);

  // Step 2: Process markdown (without img tags)
  const processedContent = await remark().use(html).process(imgPlaceholders);
  let htmlResult = processedContent.toString();

  console.log("[markdownToHtml] After markdown processing:", htmlResult);

  // Step 3: Restore <img> tags - simple string replacement (no regex needed)
  imgTags.forEach((imgTag, index) => {
    const placeholder = `IMGPLACEHOLDER${index}ENDIMG`;
    console.log(`[markdownToHtml] Looking for placeholder: ${placeholder}`);
    console.log(`[markdownToHtml] Will replace with: ${imgTag}`);

    // The placeholder might be wrapped in <p> tags by markdown
    // Replace it directly - won't need regex since we're not using special chars
    htmlResult = htmlResult.split(`<p>${placeholder}</p>`).join(imgTag);
    htmlResult = htmlResult.split(placeholder).join(imgTag);
  });

  console.log("[markdownToHtml] Final result:", htmlResult);
  return htmlResult;
}

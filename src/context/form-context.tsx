import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type FormComponentKey = "write" | "generator" | "preview" | "setting";

export interface ImageInfo {
  id?: string;
  lat?: number;
  lon?: number;
  createDate?: string;
  previewUrl?: string;
  fileName?: string; // Used during editing (local)
  active?: boolean;
  file?: File;
  // Backend response fields
  imgId?: number;
  postId?: number;
  geoLat?: string; // Backend uses string
  geoLong?: string; // Backend uses string
  imgPath?: string; // S3 path: "1698765432000_filename.png"
  imgFileName?: string; // From backend ImageResponse
  filePath?: string; // Full S3 URL (from backend)
  thumbYn?: boolean;
  imgDtm?: string;
  rgstDtm?: string;
}

// Backend response types
export interface ImageResponse {
  imgId: number;
  postId: number;
  geoLat: string;
  geoLong: string;
  imgPath: string;
  imgFileName: string;
  imgDtm: string;
  rgstDtm: string;
  thumbYn: boolean;
  filePath: string;
}

export interface PostDetailResponse {
  postId: number;
  title: string;
  ogText: string; // Blog description/content
  aiGenText: string; // AI generated content
  rgstDtm: string;
  chngDtm: string;
  blogImgList: ImageResponse[];
}

export interface StatusInfo {
  type?: "loading" | "success" | "error";
  title?: string;
  description?: string;
}

export interface ErrorInfo {
  title: string;
  description: string;
}

export interface AiContentInfo {
  title: string;
  content: string;
}

interface FormContextType {
  images: ImageInfo[];
  setImages: Dispatch<SetStateAction<ImageInfo[]>>;
  removeImage: (id: string) => void;
  description: string;
  updateDescription: (description: string) => void;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  activeComponentKey: FormComponentKey;
  setActiveComponentKey: (key: FormComponentKey) => void;
  statusInfo: StatusInfo;
  setStatusInfo: Dispatch<SetStateAction<StatusInfo>>;
  errorInfo: ErrorInfo | null;
  setErrorInfo: Dispatch<SetStateAction<ErrorInfo | null>>;
  aiContent: AiContentInfo[];
  setAiContent: Dispatch<SetStateAction<AiContentInfo[]>>;
  aiContentIndex?: number;
  setAiContentIndex: Dispatch<SetStateAction<number | undefined>>;
  resetWriteState: () => void;
  isEdit: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: React.ReactNode;
  initialData?: PostDetailResponse;
  isEdit?: boolean;
}

export const FormProvider = ({
  children,
  initialData,
  isEdit = false,
}: FormProviderProps) => {
  const [images, setImages] = useState<ImageInfo[]>(() => {
    if (isEdit && initialData?.blogImgList) {
      const S3_BASE_URL =
        "https://storytracks-ap-storage.s3.ap-southeast-2.amazonaws.com";
      console.log(
        "[FormContext] Initializing edit mode images. Total images:",
        initialData.blogImgList.length,
      );

      // Find the thumbnail image (where thumbYn === true)
      const thumbnailIndex = initialData.blogImgList.findIndex(
        (img) => img.thumbYn === true,
      );

      return initialData.blogImgList.map((img, idx) => {
        // Construct full S3 URL from imgPath
        let fullImgPath = img.imgPath;
        if (!fullImgPath.startsWith("posts/")) {
          fullImgPath = "posts/" + fullImgPath;
        }
        const fullS3Url = `${S3_BASE_URL}/${fullImgPath}`;

        // thumbYn is now a boolean from backend
        const isThumbnail = img.thumbYn === true;

        console.log(
          `[FormContext] Image ${idx}: ${img.imgFileName} - thumbYn=${img.thumbYn}, active=${isThumbnail}`,
        );

        return {
          id: img.imgPath,
          imgId: img.imgId,
          postId: img.postId,
          fileName: img.imgFileName,
          imgFileName: img.imgFileName,
          imgPath: img.imgPath,
          previewUrl: fullS3Url,
          geoLat: img.geoLat,
          geoLong: img.geoLong,
          imgDtm: img.imgDtm,
          thumbYn: img.thumbYn,
          lat: parseFloat(img.geoLat),
          lon: parseFloat(img.geoLong),
          createDate: img.imgDtm,
          active: isThumbnail,
        };
      });
    }
    return [];
  });

  const [description, setDescription] = useState<string>(
    isEdit ? initialData?.ogText || "" : "",
  );

  const [title, setTitle] = useState<string>(
    isEdit ? initialData?.title || "" : "",
  );

  const [activeComponentKey, setActiveComponentKey] =
    useState<FormComponentKey>("write");
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ type: undefined });
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [aiContent, setAiContent] = useState<AiContentInfo[]>(
    isEdit && initialData?.aiGenText
      ? [{ title: initialData.title, content: initialData.aiGenText }]
      : isEdit
        ? [
            {
              title: initialData?.title || "",
              content: initialData?.ogText || "",
            },
          ] // Use description as fallback in edit mode
        : [],
  );
  const [aiContentIndex, setAiContentIndex] = useState<number | undefined>(
    isEdit ? 0 : undefined,
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const updateDescription = (description: string) => {
    setDescription(description);
  };

  const resetWriteState = () => {
    setImages([]);
    setDescription("");
    setTitle("");
    setAiContent([]);
    setAiContentIndex(undefined);
  };

  return (
    <FormContext.Provider
      value={{
        images,
        description,
        title,
        setImages,
        setTitle,
        removeImage,
        updateDescription,
        activeComponentKey,
        setActiveComponentKey,
        statusInfo,
        setStatusInfo,
        errorInfo,
        setErrorInfo,
        aiContent,
        setAiContent,
        aiContentIndex,
        setAiContentIndex,
        resetWriteState,
        isEdit,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within an FormProvider");
  }
  return context;
};

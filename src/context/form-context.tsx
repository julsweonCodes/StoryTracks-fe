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
  lat: number;
  lon: number;
  createDate: string;
  previewUrl: string;
  fileName: string;
  active: boolean;
  file: File;
}

export interface StatusInfo {
  type?: "loading" | "success" | "error";
  title?: string;
  description?: string;
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
  activeComponentKey: FormComponentKey;
  setActiveComponentKey: (key: FormComponentKey) => void;
  statusInfo: StatusInfo;
  setStatusInfo: Dispatch<SetStateAction<StatusInfo>>;
  aiContent: AiContentInfo[];
  setAiContent: Dispatch<SetStateAction<AiContentInfo[]>>;
  aiContentIndex?: number;
  setAiContentIndex: Dispatch<SetStateAction<number | undefined>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [description, setDescription] = useState<string>("");
  const [activeComponentKey, setActiveComponentKey] =
    useState<FormComponentKey>("write");
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ type: undefined });
  const [aiContent, setAiContent] = useState<AiContentInfo[]>([]);
  const [aiContentIndex, setAiContentIndex] = useState<number>();

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const updateDescription = (description: string) => {
    setDescription(description);
  };

  return (
    <FormContext.Provider
      value={{
        images,
        description,
        setImages,
        removeImage,
        updateDescription,
        activeComponentKey,
        setActiveComponentKey,
        statusInfo,
        setStatusInfo,
        aiContent,
        setAiContent,
        aiContentIndex,
        setAiContentIndex,
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

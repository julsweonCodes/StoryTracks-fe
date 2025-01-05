import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type FormComponentKey =
  | "write"
  | "generator"
  | "description"
  | "preview";

interface Image {
  id: string;
  url: string;
}

export interface StatusInfo {
  type?: "loading" | "success";
  title?: string;
  description?: string;
}

interface FormContextType {
  images: Image[];
  description: string;
  addImage: (image: Image) => void;
  removeImage: (id: string) => void;
  updateDescription: (description: string) => void;
  activeComponentKey: FormComponentKey;
  setActiveComponentKey: (key: FormComponentKey) => void;
  statusInfo: StatusInfo;
  setStatusInfo: Dispatch<SetStateAction<StatusInfo>>;
  aiContent: { content: string }[];
  setAiContent: Dispatch<SetStateAction<{ content: string }[]>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [description, setDescription] = useState<string>("");
  const [activeComponentKey, setActiveComponentKey] =
    useState<FormComponentKey>("write");
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ type: undefined });
  const [aiContent, setAiContent] = useState<{ content: string }[]>([]);

  const addImage = (image: Image) => {
    setImages((prev) => [...prev, image]);
  };

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
        addImage,
        removeImage,
        updateDescription,
        activeComponentKey,
        setActiveComponentKey,
        statusInfo,
        setStatusInfo,
        aiContent,
        setAiContent,
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

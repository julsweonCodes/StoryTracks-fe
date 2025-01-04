import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type FormComponentKey = "upload-image" | "description" | "preview";

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
  descriptions: { [id: string]: string };
  addImage: (image: Image) => void;
  removeImage: (id: string) => void;
  updateDescription: (id: string, description: string) => void;
  activeComponentKey: FormComponentKey;
  setActiveComponentKey: (key: FormComponentKey) => void;
  statusInfo: StatusInfo;
  setStatusInfo: Dispatch<SetStateAction<StatusInfo>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [descriptions, setDescriptions] = useState<{ [id: string]: string }>(
    {},
  );
  const [activeComponentKey, setActiveComponentKey] =
    useState<FormComponentKey>("upload-image");
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({ type: undefined });

  const addImage = (image: Image) => {
    setImages((prev) => [...prev, image]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
    setDescriptions((prev) => {
      const newDescriptions = { ...prev };
      delete newDescriptions[id];
      return newDescriptions;
    });
  };

  const updateDescription = (id: string, description: string) => {
    setDescriptions((prev) => ({ ...prev, [id]: description }));
  };

  return (
    <FormContext.Provider
      value={{
        images,
        descriptions,
        addImage,
        removeImage,
        updateDescription,
        activeComponentKey,
        setActiveComponentKey,
        statusInfo,
        setStatusInfo,
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

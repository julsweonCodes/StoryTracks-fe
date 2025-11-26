import Form from "@/components/blog/new-post";
import SEOHeader from "@/components/common/seo-header";
import { FormProvider } from "@/context/form-context";

export default function New() {
  return (
    <FormProvider>
      <SEOHeader
        title="Write a Blog - Share Your Story on Story Track"
        description="Unleash your creativity and share your stories with the world. Start writing your blog today on Story Track, where every story matters."
      />
      <Form />
    </FormProvider>
  );
}

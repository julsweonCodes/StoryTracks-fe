import Form from "@/components/blog/new-post";
import SEOHeader from "@/components/common/seo-header";
import { FormProvider } from "@/context/form-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function New() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, show alert and redirect to login
    if (status === "unauthenticated") {
      alert("Only logged in users can create a new post. Please log in.");
      router.push("/login");
    }
  }, [status, router]);

  // If loading, show nothing
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!session?.user) {
    return null;
  }

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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Model } from "@workspace/api-client-react";

// Re-export generated hooks for convenience
export { useListModels, useGetModel } from "@workspace/api-client-react";

/**
 * Custom hook for uploading a 3D model.
 * Since multipart/form-data uploads might not be perfectly mapped in some codegen,
 * we handle it explicitly here using standard fetch to match the backend expectation.
 */
export function useUploadModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("model", file);

      const res = await fetch("/api/models/upload", {
        method: "POST",
        body: formData,
        // Let the browser set the Content-Type to multipart/form-data with the boundary
      });

      if (!res.ok) {
        let errorMessage = "Failed to upload model";
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      return data as Model;
    },
    onSuccess: () => {
      // Invalidate the models list so it refetches
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
  });
}

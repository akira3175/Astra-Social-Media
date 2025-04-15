export const uploadToCloudinary = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];

  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "astra_cloudinary");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dhdq1ntst/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Image upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw error;
  }
};
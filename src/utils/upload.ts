const CLOUD_NAME = "dwrlmfghv";
const UPLOAD_PRESET = "portfolio_uploads";

export type UploadResult = { url: string; publicId: string };

export const uploadFile = async (
  file: File,
  folder: "resumes" | "projects"
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `portfoliogen/${folder}`);

  const resourceType = folder === "resumes" ? "raw" : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const data = await res.json();
  // Return URL as-is — no fl_attachment, browser opens PDF inline
  // User can then choose to save from the browser's PDF viewer
  return { url: data.secure_url, publicId: data.public_id };
};

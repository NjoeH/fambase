import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", quality);
    };
    img.src = url;
  });
}

export async function uploadInvoice(
  familyId: string,
  path: string,   // e.g. "vehicles/{vehicleId}/fuel/{recordId}"
  file: File,
): Promise<string> {
  const isPdf = file.type === "application/pdf";
  const uploadFile = isPdf ? file : await compressImage(file);
  const ext = isPdf ? "pdf" : "jpg";
  const storageRef = ref(storage, `families/${familyId}/${path}/invoice.${ext}`);
  await uploadBytes(storageRef, uploadFile);
  return getDownloadURL(storageRef);
}

export async function deleteInvoice(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // ignore if already deleted
  }
}

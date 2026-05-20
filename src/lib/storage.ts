import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadInvoice(
  familyId: string,
  path: string,   // e.g. "vehicles/{vehicleId}/fuel/{recordId}"
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `families/${familyId}/${path}/invoice.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteInvoice(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // ignore if already deleted
  }
}

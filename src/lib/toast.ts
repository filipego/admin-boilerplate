import { toast } from "sonner";

// Centralized toast helpers. Update texts here to change everywhere.

export const showSaved = (message: string = "Saved") => toast.success(message);
export const showError = (message: string = "Something went wrong") => toast.error(message);

// Image upload specific
export const showAvatarUpdated = () => toast.success("Avatar updated");
export const showUploadFailed = () => toast.error("Failed to upload image");
export const showBucketMissing = () => toast.error("Storage bucket missing. Creating it now...");
export const showBucketCreated = () => toast.success("Bucket created. Please retry upload.");

// Expose the base API if custom usage is ever needed in a component
export { toast };



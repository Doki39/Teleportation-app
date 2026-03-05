export async function buildFormData({ uri, file }) {
    const formData = new FormData();
    if (uri) {
      formData.append("image", { uri, name: "image.jpg", type: "image/jpeg" });
    } else if (file) {
      formData.append("image", file);
    } else {
      throw new Error("No file or uri provided");
    }
    return formData; 
}
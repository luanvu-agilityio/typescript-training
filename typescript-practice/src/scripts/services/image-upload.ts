export class CloudinaryUploadService {
  // Cloudinary configuration
  private static CLOUD_NAME = 'ds82onf5q';
  private static UPLOAD_PRESET = 'sample';
  private static UPLOAD_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

  /**
   * Upload avatar to Cloudinary
   * @param file - File object to upload
   * @returns Promise resolving to the uploaded image URL
   */
  static async uploadAvatar(file: File): Promise<string> {
    // Validate file size and type
    this.validateFile(file);

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    try {
      // Make request to Cloudinary API
      const response = await fetch(this.UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Return the secure URL of the uploaded image
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Validate file before upload
   * @param file - File to validate
   * @throws Error if file is invalid
   */
  private static validateFile(file: File): void {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Max file size (5MB)
    const maxSizeBytes = 5 * 1024 * 1024;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.');
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      throw new Error('File is too large. Maximum size is 5MB.');
    }
  }
}

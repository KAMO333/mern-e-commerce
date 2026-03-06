const cloudinary = {
  uploader: {
    upload: async () => ({
      secure_url: "https://res.cloudinary.com/test/image.png",
      public_id: "test_id",
    }),
    destroy: async () => ({ result: "ok" }),
  },
};

export const v2 = cloudinary;
export default cloudinary;

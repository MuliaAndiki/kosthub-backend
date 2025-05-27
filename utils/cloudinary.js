import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config(process.env.CLOUDINARY_URL);

export const uploadToCloudinary = (buffer, folder, alias = null) => {
  return new Promise((resolve, reject) => {
    const options = { folder };
    if (alias) options.public_id = alias;

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

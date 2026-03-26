import z from "zod";

export const userSchema = z.object(
  {
    name: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Name is required!"
            : "Provide a valid name!";
        },
      })
      .min(3, "Name must be at least 3 characters long!")
      .max(50, "Name cannot exceed 50 characters!"),
    email: z
      .email({
        error: (iss) => {
          return iss.input === undefined
            ? "Email is required!"
            : "Please provide a valid email address";
        },
      })
      .transform((email) => email.toLowerCase()),
    photoURL: z
      .url({
        error: (iss) => {
          return iss.input === undefined
            ? "Photo URL is required!"
            : "Please provide a valid photo URL!";
        },
      })
      .transform((url) => url.toLowerCase()),
    role: z
      .enum(["user", "librarian", "admin"], {
        error: (iss) => {
          return iss.input === undefined
            ? "Role is required!"
            : "Role must be either 'user', 'librarian', or 'admin'.";
        },
      })
      .transform((role) => role.toLowerCase())
      .default("user"),
  },
  "User data is required in the request body!",
);

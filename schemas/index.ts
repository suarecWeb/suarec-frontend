import * as z from "zod";

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Ingresa un correo electronico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  name: z.string().min(2, {
    message: "El nombre es requerido",
  }),
  genre: z.string(),
  cellphone: z.string().min(3, {
    message: "Escribe un número de teléfono válido",
  }),
  born_at: z.date(),
  role: z.string(),
  cv_url: z.string(),
  profile_image: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electronico valido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

export const CommentSchema = z.object({
  description: z.string().min(1, {
    message: "Comment is required",
  }),
  user_id: z.string(),
  product_id: z.string(),
});

export const UserSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  role: z.string(),
  name: z.string().min(2, {
    message: "Name is required",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  photo_url: z.string(),
  status: z.string(),
  profile_image: z.string().optional(),
});

/* export const OrderSchema = z.object({
    status: z.string(),
    date: z.date(),
    customer_id: z.string(),
    payment_method_id: z.string(),
}) */

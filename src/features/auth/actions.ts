"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from "./schemas";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      // redirectTo: "/search",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah!" };
        default:
          return { error: "Terjadi kesalahan pada sistem." };
      }
    }
    throw error; 
  }
}

export async function registerAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const validatedFields = registerSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Data tidak valid. Silakan periksa kembali form Anda." };
  }

  const { nama, email, password } = validatedFields.data;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: "Email sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        { 
          nama, 
          email, 
          password: hashedPassword, 
          role: 'user', 
          is_verified: false,
          verification_token: verificationToken,
          token_expires_at: tokenExpiresAt.toISOString()
        }
      ]);

    if (insertError) {
      console.error("Register Insert Error:", insertError);
      return { error: "Gagal membuat akun. Silakan coba lagi nanti." };
    }

    const verificationLink = `${process.env.AUTH_URL}/verify?token=${verificationToken}`;

    await resend.emails.send({
        from: 'Ngekoz <onboarding@resend.dev>', 
        to: email,
        subject: 'Verifikasi Akun Ngekoz Anda',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6b21a8;">Selamat datang di Ngekoz, ${nama}!</h2>
            <p>Terima kasih telah mendaftar. Untuk mulai mencari kos idamanmu, silakan verifikasi email kamu dengan mengklik tombol di bawah ini:</p>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #6b21a8; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">Verifikasi Email Saya</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">Link ini akan kedaluwarsa dalam 24 jam.</p>
          </div>
        `
    });

    return { success: true };

  } catch (error) {
    console.error("Register Exception:", error);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const validatedFields = forgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return { error: "Email tidak valid." };
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, nama')
      .eq('email', email)
      .single();

    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // Kedaluwarsa dalam 1 Jam

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires_at: tokenExpiresAt.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Gagal update reset token:", updateError);
      return { error: "Terjadi kesalahan sistem." };
    }

    const resetLink = `${process.env.AUTH_URL}/reset-password?token=${resetToken}`;
    
    await resend.emails.send({
      from: 'Ngekoz <onboarding@resend.dev>', 
      to: email,
      subject: 'Reset Password Akun Ngekoz Anda',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6b21a8;">Halo, ${user.nama}</h2>
          <p>Kami menerima permintaan untuk mereset password akun Ngekoz Anda.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #6b21a8; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini. Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error("Forgot Password Exception:", error);
    return { error: "Terjadi kesalahan sistem." };
  }
}

export async function resetPasswordAction(formData: FormData, token: string) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validatedFields = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!validatedFields.success) {
    return { error: "Data tidak valid. Periksa kembali input Anda." };
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, reset_token_expires_at')
      .eq('reset_token', token)
      .single();

    if (userError || !user) {
      return { error: "Tautan tidak valid atau sudah kedaluwarsa." };
    }

    const now = new Date();
    const expiresAt = new Date(user.reset_token_expires_at);
    if (now > expiresAt) {
      return { error: "Tautan reset password sudah kedaluwarsa." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires_at: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Reset Password Update Error:", updateError);
      return { error: "Gagal memperbarui password Anda." };
    }

    return { success: true };
  } catch (error) {
    console.error("Reset Password Exception:", error);
    return { error: "Terjadi kesalahan sistem." };
  }
}
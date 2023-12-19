"use server";

import { AppError } from "@/domains/error/class/AppError";
import {
  MemberRegisterPostSchema,
  TMemberRegisterFormSchema,
} from "@/domains/member/schema";
import MemberService from "@/domains/member/service";
import "server-only";

const memberService = new MemberService();

export async function getRegistrationToken(token: string) {
  try {
    const tokenData = await memberService.getValidRegistrationToken(token);
    return tokenData;
  } catch (error) {
    throw error;
  }
}

export async function registerMember(formData: TMemberRegisterFormSchema) {
  try {
    const validatedData = await MemberRegisterPostSchema.parse(formData);
    // メールアドレスが既に登録済みでないか;
    if (await memberService.isExisting(validatedData.email)) {
      throw new AppError(
        "CONFLICT",
        "既に登録済みです。ログインしてご利用いただけます。",
        "/login",
      );
    }

    const registerData = await memberService.register(validatedData);
    return registerData;
  } catch (error) {
    throw error;
  }
}

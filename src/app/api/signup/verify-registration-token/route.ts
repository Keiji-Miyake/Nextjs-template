import { NextRequest } from "next/server";

import { AppError } from "@/domains/error/class/AppError";
import MemberService from "@/domains/member/service";
import { errorResponse, successResponse } from "@/libs/responseHandler";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-auth-token");
  const memberService = new MemberService();

  try {
    if (!token) {
      throw new AppError("BAD_REQUEST", "Tokenがありません。", "/signup");
    }
    const registrationToken =
      await memberService.getValidRegistrationToken(token);

    // 登録済みのメールアドレスかどうかを確認する
    if (await memberService.isExisting(registrationToken.email)) {
      console.error("登録済みのメールアドレス:", registrationToken.email);
      throw new AppError(
        "CONFLICT",
        "既に登録済みです。ログインしてご利用いただけます。",
        "/login",
      );
    }

    return successResponse(200, registrationToken);
  } catch (error) {
    console.error("会員登録Token検証エラー:", error);
    return errorResponse(error);
  }
}

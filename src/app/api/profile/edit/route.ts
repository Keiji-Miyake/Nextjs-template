import { NextRequest } from "next/server";

import { UserProfilePutSchema } from "@/domains/user/schema";
import { getAuthSession } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { errorResponse, successResponse } from "@/libs/responseHandler";
import { uploadImageToS3 } from "@/libs/s3";

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  // ログイン中でなければエラーを返す
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ログイン中のユーザーデータを取得する
  const user = "user" in session ? session.user : null;
  const formData = await req.formData();
  // const profileIcon = formData.getAll("profileIcon");
  // フォームデータをオブジェクトに変換する。Zodでバリデーションするために必要
  const data = Object.fromEntries(formData);

  try {
    // バリデーション
    const validatedData = UserProfilePutSchema.parse(data);

    // profileIconがあれば、画像をアップロードして、そのURLを返す。データベースにはファイル名を保存する。
    if (validatedData.profileIcon) {
      const s3Response = await uploadImageToS3(validatedData.profileIcon);
      console.debug("S3アップロード結果:", s3Response);
    }
    // アップロードに成功したら、データベースに保存する
    await prisma.user.update({
      where: { id: Number(user.id) },
      data: {
        ...validatedData,
        profileIcon: validatedData.profileIcon
          ? validatedData.profileIcon.name
          : null,
      },
    });

    return successResponse(200, user);
  } catch (error) {
    console.error("会員情報編集エラー:", error);
    // もし画像アップロードに成功していたら、画像を削除する

    return errorResponse(error);
  }
}

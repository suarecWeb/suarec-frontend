"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, User as UserIcon, Send, Loader2 } from "lucide-react";
import { Comment } from "@/interfaces/comment.interface";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";

interface CommentsProps {
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  currentUserId: number | null;
  isSubmittingComment: boolean;
  onSubmitComment: () => void;
  formatDate: (dateString: Date | string) => string;
  formatTime: (dateString: Date | string) => string;
}

export const Comments = ({
  comments,
  commentText,
  setCommentText,
  currentUserId,
  isSubmittingComment,
  onSubmitComment,
  formatDate,
  formatTime,
}: CommentsProps) => {
  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
        <MessageSquare className="h-5 w-5 text-[#097EEC]" />
        Comentarios
      </h3>

      {/* Comment form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <textarea
          placeholder="Deja un comentario..."
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!currentUserId || isSubmittingComment}
        ></textarea>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            {!currentUserId && (
              <span>
                <Link
                  href="/auth/login"
                  className="text-[#097EEC] hover:underline font-medium"
                >
                  Inicia sesión
                </Link>{" "}
                para comentar
              </span>
            )}
          </p>
          <button
            className="px-6 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={
              !commentText.trim() || !currentUserId || isSubmittingComment
            }
            onClick={onSubmitComment}
          >
            {isSubmittingComment ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {comment.user?.id &&
                  comment.user.id !== "" &&
                  comment.user.id !== "undefined" ? (
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <UserAvatarDisplay
                        user={{
                          id:
                            typeof comment.user?.id === "string"
                              ? parseInt(comment.user.id)
                              : (comment.user?.id as number) || 0,
                          name: comment.user?.name || "Usuario",
                          profile_image: comment.user?.profile_image,
                        }}
                        size="md"
                      />
                    </Link>
                  ) : (
                    <UserAvatarDisplay
                      user={{
                        id:
                          typeof comment.user?.id === "string"
                            ? parseInt(comment.user.id)
                            : (comment.user?.id as number) || 0,
                        name: comment.user?.name || "Usuario",
                        profile_image: comment.user?.profile_image,
                      }}
                      size="md"
                    />
                  )}
                  <div className="flex-1">
                    {comment.user?.id &&
                    comment.user.id !== "" &&
                    comment.user.id !== "undefined" ? (
                      <Link
                        href={`/profile/${comment.user.id}`}
                        className="hover:text-[#097EEC] transition-colors cursor-pointer"
                      >
                        <p className="font-semibold text-gray-800">
                          {comment.user?.name || "Usuario"}
                        </p>
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-800">
                        {comment.user?.name || "Usuario"}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(comment.created_at)} a las{" "}
                      {formatTime(comment.created_at)}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

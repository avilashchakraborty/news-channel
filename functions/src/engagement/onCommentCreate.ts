import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { REGION } from "../config";
import { db } from "../lib/firestore";
import { incrementShard } from "../lib/shards";
import { checkCommentSpam } from "../lib/spam";
import { sendToUser } from "../lib/notify";
import { Comment, Video } from "../types";

/**
 * New comment (spec §5): run the spam check (hide on a hit rather than delete),
 * bump commentCount via a shard, and notify the video's creator.
 */
export const onCommentCreate = onDocumentCreated(
  { region: REGION, document: "videos/{videoId}/comments/{commentId}" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const comment = snap.data() as Comment;
    const videoId = event.params.videoId;

    const verdict = checkCommentSpam(comment.body);
    if (verdict.spam) {
      await snap.ref.update({ status: "hidden", spamReason: verdict.reason });
      return; // hidden comments don't count or notify
    }

    await incrementShard(videoId, "commentShards", 1);

    const videoSnap = await db.doc(`videos/${videoId}`).get();
    const video = videoSnap.data() as Video | undefined;
    if (video && video.creatorId !== comment.uid) {
      await sendToUser(
        video.creatorId,
        `${comment.displayName} commented`,
        comment.body.slice(0, 80),
        { videoId, kind: "comment" },
      );
    }
  },
);

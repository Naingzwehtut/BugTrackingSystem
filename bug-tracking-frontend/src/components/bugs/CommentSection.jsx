import { MessageSquare, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { COMMENT_MAX, ROLE_LABELS } from '@/config/constants'
import { formatDateTime, formatRelative, initials } from '@/utils/format'

const AVATAR_TONES = {
  admin: 'bg-purple-100 text-purple-700',
  tester: 'bg-teal-100 text-teal-700',
  developer: 'bg-primary-100 text-primary-700',
}

function Comment({ comment, isOwn }) {
  return (
    <li className="flex gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TONES[comment.user_role] ?? 'bg-gray-100 text-gray-600'}`}
        aria-hidden="true"
      >
        {initials(comment.user_name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-gray-800">
            {comment.user_name}
            {isOwn && <span className="font-normal text-gray-400"> (you)</span>}
          </span>
          {comment.user_role && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              {ROLE_LABELS[comment.user_role] ?? comment.user_role}
            </span>
          )}
          <time dateTime={comment.created_at} title={formatDateTime(comment.created_at)} className="text-xs text-gray-400">
            {formatRelative(comment.created_at)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words rounded-lg rounded-tl-none bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {comment.comment}
        </p>
      </div>
    </li>
  )
}

export default function CommentSection({ comments, currentUserId, onAddComment, submitting }) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const listEndRef = useRef(null)
  const previousCount = useRef(comments.length)

  // Bring a just-posted comment into view.
  useEffect(() => {
    if (comments.length > previousCount.current) listEndRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    previousCount.current = comments.length
  }, [comments.length])

  async function submit() {
    if (!trimmed || submitting) return
    // Keep the draft if posting fails so nothing the user typed is lost.
    if (await onAddComment(trimmed)) setText('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <section className="card p-5" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <MessageSquare size={16} aria-hidden="true" /> Comments
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{comments.length}</span>
      </h2>

      {comments.length === 0 ? (
        <p className="mb-4 text-sm text-gray-500">No comments yet. Start the discussion below.</p>
      ) : (
        <ul className="mb-5 flex flex-col gap-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} isOwn={comment.user_id === currentUserId} />
          ))}
          <li ref={listEndRef} aria-hidden="true" />
        </ul>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="flex flex-col gap-2"
      >
        <textarea
          aria-label="Add a comment"
          className="input resize-y"
          rows={3}
          maxLength={COMMENT_MAX}
          placeholder="Add a comment..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            <span className="hidden sm:inline">Ctrl/⌘ + Enter to post · </span>
            <span className={`tabular-nums ${text.length > COMMENT_MAX * 0.9 ? 'text-orange-600' : ''}`}>
              {text.length}/{COMMENT_MAX}
            </span>
          </p>
          <Button type="submit" icon={Send} loading={submitting} loadingText="Posting..." disabled={!trimmed}>
            Comment
          </Button>
        </div>
      </form>
    </section>
  )
}

import { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import EmptyState from '../common/EmptyState.jsx'
import { formatDateTime } from '../../utils/formatDate'

export default function CommentSection({ comments, onAddComment, submitting }) {
  const [text, setText] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await onAddComment(text.trim())
    setText('')
  }

  return (
    <div className="card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <MessageSquare size={16} /> Comments
      </h3>

      {comments.length === 0 ? (
        <EmptyState message="No comments yet." />
      ) : (
        <div className="mb-4 flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {c.user_name || c.user?.name || 'Unknown'}{' '}
                  <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
                    {c.user_role || c.user?.role}
                  </span>
                </span>
                <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700">{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          className="input flex-1 resize-none"
          rows={2}
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={submitting || !text.trim()} className="btn-primary">
          <Send size={14} /> {submitting ? 'Posting...' : 'Add'}
        </button>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as bugService from '../../services/bugService'
import { getErrorMessage } from '../../services/api'
import { useToast } from '../../components/common/Toast.jsx'
import { PRIORITY_LIST, SEVERITY_LIST } from '../../utils/constants'

export default function CreateBug() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: SEVERITY_LIST[0],
    priority: PRIORITY_LIST[0],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await bugService.createBug(form)
      showToast('Bug created successfully.', 'success')
      const newId = res.data?.bug?.id || res.data?.id
      navigate(newId ? `/bugs/${newId}` : '/bugs')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Create Bug</h1>
      <p className="mb-6 text-sm text-gray-500">Report a new issue for the team to triage.</p>

      <div className="card p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={update('title')} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              required
              rows={5}
              className="input resize-none"
              value={form.description}
              onChange={update('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={update('priority')}>
                {PRIORITY_LIST.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={form.severity} onChange={update('severity')}>
                {SEVERITY_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

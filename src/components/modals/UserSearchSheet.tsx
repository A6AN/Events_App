import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, UserPlus, UserCheck, MessageCircle, Loader2, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { searchUsers, SearchedUser } from '../../lib/services/profileService'
import { sendFriendRequest } from '../../lib/services/socialService'
import { getOrCreateDMConversation } from '../../lib/services/chatService'
import { DirectMessageScreen } from './DirectMessageScreen'

interface Props {
  open: boolean
  onClose: () => void
}

export function UserSearchSheet({ open, onClose }: Props) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [reqLoading, setReqLoading] = useState<Set<string>>(new Set())
  const [msgLoading, setMsgLoading] = useState<string | null>(null)
  const [dmTarget, setDmTarget] = useState<{ conversationId: string; otherUser: SearchedUser } | null>(null)

  useEffect(() => {
    if (!query.trim() || !user?.id) { setResults([]); return }
    setLoading(true)
    const timer = setTimeout(async () => {
      const data = await searchUsers(query, user.id)
      setResults(data)
      setLoading(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [query, user?.id])

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setDmTarget(null) }
  }, [open])

  const handleRequest = useCallback(async (targetId: string) => {
    if (!user?.id) return
    setReqLoading(prev => new Set(prev).add(targetId))
    try {
      await sendFriendRequest(user.id, targetId)
      setResults(prev => prev.map(u => u.id === targetId ? { ...u, friendshipStatus: 'pending' as const } : u))
    } finally {
      setReqLoading(prev => { const s = new Set(prev); s.delete(targetId); return s })
    }
  }, [user?.id])

  const handleMessage = useCallback(async (u: SearchedUser) => {
    if (!user?.id) return
    setMsgLoading(u.id)
    const convId = await getOrCreateDMConversation(user.id, u.id)
    setMsgLoading(null)
    if (convId) setDmTarget({ conversationId: convId, otherUser: u })
  }, [user?.id])

  const getAvatar = (u: SearchedUser) => {
    if (u.avatar_url) return u.avatar_url
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name || u.username || 'U')}&background=1a1a1a&color=fff&bold=true`
  }

  const FF = "'Inter Tight','Inter',sans-serif"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 40 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              maxWidth: 400, margin: '0 auto',
              background: '#000', border: '0.5px solid rgba(255,255,255,.08)',
              borderRadius: '24px 24px 0 0', zIndex: 50,
              fontFamily: FF, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)' }} />
            </div>

            {/* Header */}
            <div style={{ padding: '16px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>Find People</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Search by name or username</div>
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <X size={16} color="rgba(255,255,255,.5)" />
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: '0 16px 12px', position: 'relative' }}>
              <Search size={16} color="rgba(255,255,255,.25)" style={{ position: 'absolute', left: 30, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search people..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,.05)',
                  border: '0.5px solid rgba(255,255,255,.08)',
                  borderRadius: 99, padding: '12px 16px 12px 40px',
                  color: '#fff', fontSize: 14, outline: 'none',
                  fontFamily: FF, boxSizing: 'border-box',
                }}
              />
              {loading && <Loader2 size={14} color="rgba(255,255,255,.3)" style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)' }} />}
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 40px' }}>
              {!query.trim() ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 12 }}>
                  <Users size={36} color="rgba(255,255,255,.1)" />
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 13 }}>Search for people to connect with</p>
                </div>
              ) : !loading && results.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
                  <Search size={36} color="rgba(255,255,255,.1)" />
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 13 }}>No users found for "{query}"</p>
                </div>
              ) : (
                results.map((u, i) => {
                  const status = u.friendshipStatus
                  const isPending = status === 'pending'
                  const isFriend = status === 'accepted'
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 4px',
                        borderBottom: '0.5px solid rgba(255,255,255,.05)',
                      }}
                    >
                      <img src={getAvatar(u)} alt={u.display_name || 'User'} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{u.display_name || u.username || 'Unknown'}</div>
                        {u.username && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>@{u.username}</div>}
                      </div>

                      <button onClick={() => handleMessage(u)} disabled={msgLoading === u.id} style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(255,255,255,.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        flexShrink: 0,
                      }}>
                        {msgLoading === u.id ? <Loader2 size={14} color="rgba(255,255,255,.3)" /> : <MessageCircle size={14} color="rgba(255,255,255,.5)" />}
                      </button>

                      <button
                        onClick={() => !isPending && !isFriend && handleRequest(u.id)}
                        disabled={reqLoading.has(u.id) || isPending || isFriend}
                        style={{
                          padding: '7px 14px', borderRadius: 99, flexShrink: 0,
                          background: isFriend || isPending ? 'transparent' : 'rgba(255,255,255,.97)',
                          border: isFriend || isPending ? '0.5px solid rgba(255,255,255,.12)' : 'none',
                          color: isFriend ? 'rgba(60,230,180,.8)' : isPending ? 'rgba(255,255,255,.3)' : '#000',
                          fontSize: 12, fontWeight: 700, cursor: isFriend || isPending ? 'default' : 'pointer',
                          fontFamily: FF, display: 'flex', alignItems: 'center', gap: 4,
                        } as React.CSSProperties}
                      >
                        {reqLoading.has(u.id) ? <Loader2 size={12} /> :
                          isFriend ? <><UserCheck size={12} /> Friends</> :
                          isPending ? 'Requested' :
                          <><UserPlus size={12} /> Add</>}
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>

            <AnimatePresence>
              {dmTarget && (
                <DirectMessageScreen
                  key={dmTarget.conversationId}
                  conversationId={dmTarget.conversationId}
                  otherUser={{
                    id: dmTarget.otherUser.id,
                    display_name: dmTarget.otherUser.display_name,
                    username: dmTarget.otherUser.username,
                    avatar_url: dmTarget.otherUser.avatar_url,
                  }}
                  onClose={() => setDmTarget(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

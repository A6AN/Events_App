import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getChatMessages, sendMessage, getChatMembers, subscribeToChatMessages, markChatAsRead } from '../../lib/services/chatService'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  message_type: 'text' | 'image' | 'system'
  user?: { display_name: string | null; avatar_url: string | null; username: string | null }
}

interface Member {
  user_id: string
  user?: { display_name: string | null; avatar_url: string | null; username: string | null }
}

interface ChatScreenProps {
  chatId: string
  eventTitle: string
  eventImage?: string
  onClose: () => void
}

export function ChatScreen({ chatId, eventTitle, eventImage, onClose }: ChatScreenProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!chatId || !user?.id) return
    getChatMessages(chatId).then(setMessages)
    getChatMembers(chatId).then(setMembers)
    markChatAsRead(chatId, user.id)
  }, [chatId, user?.id])

  useEffect(() => {
    if (!chatId) return
    const channel = subscribeToChatMessages(chatId, (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })
    return () => { channel.unsubscribe() }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || isSending) return
    setIsSending(true)
    try {
      await sendMessage(chatId, user.id, newMessage.trim())
      setNewMessage('')
      inputRef.current?.focus()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  const formatDate = (d: string) => {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const grouped: { date: string; msgs: Message[] }[] = []
  messages.forEach(msg => {
    const date = formatDate(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.date === date) last.msgs.push(msg)
    else grouped.push({ date, msgs: [msg] })
  })

  const FF = "'Inter Tight','Inter',sans-serif"

  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000', display: 'flex', flexDirection: 'column', fontFamily: FF }}
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '52px 16px 14px',
        background: 'rgba(255,255,255,.04)',
        borderBottom: '0.5px solid rgba(255,255,255,.07)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        {eventImage && (
          <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <img src={eventImage} alt={eventTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eventTitle}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{members.length} members</div>
        </div>
        <button onClick={() => setShowMembers(v => !v)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', display: 'flex' }}>
          <Users size={20} />
        </button>
      </div>

      {/* Members panel */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: 'rgba(255,255,255,.03)', borderBottom: '0.5px solid rgba(255,255,255,.07)', overflow: 'hidden' }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {members.map(m => {
                const name = m.user?.display_name || m.user?.username || 'User'
                return (
                  <div key={m.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 99,
                    background: 'rgba(255,255,255,.05)',
                    border: '0.5px solid rgba(255,255,255,.07)',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: m.user?.avatar_url ? 'transparent' : 'rgba(255,255,255,.1)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'rgba(255,255,255,.5)',
                    }}>
                      {m.user?.avatar_url
                        ? <img src={m.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : name[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{name}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {grouped.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Send size={20} color="rgba(255,255,255,.2)" />
            </div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>No messages yet</p>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>Be the first to say hi! 👋</p>
          </div>
        ) : grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: 99, background: 'rgba(255,255,255,.05)', fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{date}</span>
            </div>
            {msgs.map((msg, idx) => {
              const isOwn = msg.user_id === user?.id
              const showAvatar = idx === 0 || msgs[idx - 1].user_id !== msg.user_id
              const name = msg.user?.display_name || msg.user?.username || 'User'
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 8, marginBottom: 4, justifyContent: isOwn ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
                  {!isOwn && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,.5)', visibility: showAvatar ? 'visible' : 'hidden', marginBottom: 16 }}>
                      {msg.user?.avatar_url ? <img src={msg.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    {!isOwn && showAvatar && <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 3, paddingLeft: 4 }}>{name}</p>}
                    <div style={{
                      padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word',
                      ...(isOwn
                        ? { background: 'rgba(255,255,255,.97)', color: '#000', borderBottomRightRadius: 4, fontWeight: 500 }
                        : { background: 'rgba(255,255,255,.09)', color: '#fff', border: '0.5px solid rgba(255,255,255,.06)', borderBottomLeftRadius: 4 }
                      )
                    }}>
                      {msg.content}
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', marginTop: 3, padding: '0 4px' }}>{formatTime(msg.created_at)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px 40px',
        background: 'rgba(255,255,255,.04)',
        borderTop: '0.5px solid rgba(255,255,255,.07)',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, background: 'rgba(255,255,255,.06)',
            border: '0.5px solid rgba(255,255,255,.08)',
            borderRadius: 99, padding: '12px 18px',
            color: '#fff', fontSize: 14, outline: 'none',
            fontFamily: FF,
          }}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !newMessage.trim()}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: !newMessage.trim() || isSending ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.97)',
            color: !newMessage.trim() || isSending ? 'rgba(255,255,255,.2)' : '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: !newMessage.trim() || isSending ? 'not-allowed' : 'pointer',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDMMessages, sendDMMessage, markDMsAsRead, subscribeToDMMessages, DMMessage } from '../../lib/services/chatService'

interface Props {
  conversationId: string
  otherUser: { id: string; display_name: string | null; username: string | null; avatar_url: string | null }
  onClose: () => void
}

export function DirectMessageScreen({ conversationId, otherUser, onClose }: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<DMMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const name = otherUser.display_name || otherUser.username || 'User'
  const avatar = otherUser.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff&bold=true`

  useEffect(() => {
    if (!conversationId) return
    getDMMessages(conversationId).then(data => { setMessages(data); setLoading(false) })
    if (user?.id) markDMsAsRead(conversationId, user.id)
  }, [conversationId, user?.id])

  useEffect(() => {
    if (!conversationId) return
    const channel = subscribeToDMMessages(conversationId, msg => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
      if (user?.id) markDMsAsRead(conversationId, user.id)
    })
    return () => { channel.unsubscribe() }
  }, [conversationId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user?.id || sending) return
    setSending(true)
    const optimistic: DMMessage = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content: text.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    }
    setMessages(prev => [...prev, optimistic])
    setText('')
    const sent = await sendDMMessage(conversationId, user.id, optimistic.content)
    if (sent) setMessages(prev => prev.map(m => m.id === optimistic.id ? sent : m))
    setSending(false)
    inputRef.current?.focus()
  }

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  const grouped: { date: string; msgs: DMMessage[] }[] = []
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
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
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
        padding: '52px 16px 14px',
        background: 'rgba(255,255,255,.04)',
        borderBottom: '0.5px solid rgba(255,255,255,.07)',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <img src={avatar} alt={name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,.12)' }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{name}</div>
          {otherUser.username && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>@{otherUser.username}</div>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={24} color="rgba(255,255,255,.3)" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
            <img src={avatar} alt={name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.1)' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{name}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', margin: 0 }}>Say hi and start the conversation!</p>
          </div>
        ) : grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: 99, background: 'rgba(255,255,255,.05)', fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{date}</span>
            </div>
            {msgs.map((msg, idx) => {
              const isOwn = msg.sender_id === user?.id
              const prevSame = idx > 0 && msgs[idx - 1].sender_id === msg.sender_id
              return (
                <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                  {!isOwn && (
                    <img src={avatar} alt={name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginBottom: 16, visibility: prevSame ? 'hidden' : 'visible' }} />
                  )}
                  <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word',
                      ...(isOwn
                        ? { background: 'rgba(255,255,255,.97)', color: '#000', borderBottomRightRadius: 4, fontWeight: 500 }
                        : { background: 'rgba(255,255,255,.09)', color: '#fff', border: '0.5px solid rgba(255,255,255,.06)', borderBottomLeftRadius: 4 }
                      )
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', marginTop: 3, padding: '0 4px' }}>
                      {formatTime(msg.created_at)}
                      {isOwn && msg.read_at && <span style={{ color: 'rgba(255,200,60,.7)' }}> ✓✓</span>}
                    </div>
                  </div>
                </div>
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
          placeholder={`Message ${name}...`}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
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
          disabled={!text.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: !text.trim() || sending ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.97)',
            color: !text.trim() || sending ? 'rgba(255,255,255,.2)' : '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          {sending ? <Loader2 size={18} /> : <Send size={18} />}
        </button>
      </div>
    </motion.div>
  )
}

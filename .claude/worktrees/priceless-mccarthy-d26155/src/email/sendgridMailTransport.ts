import sgMail from '@sendgrid/mail'

type MailCallback = (err: Error | null, info?: unknown) => void

/**
 * Nodemailer transport plugin using SendGrid Web API (@sendgrid/mail v8, fetch-based).
 * Same behavior as legacy `nodemailer-sendgrid` + `@sendgrid/mail@6`, without deprecated `request`.
 */
export function createSendGridMailTransport(options: { apiKey?: string }) {
  if (options.apiKey) {
    sgMail.setApiKey(options.apiKey)
  }

  return {
    name: 'sendgrid-mail',
    send(mail: { normalize: (cb: (err: Error | null, source?: Record<string, unknown>) => void) => void }, callback: MailCallback) {
      mail.normalize((err, source) => {
        if (err) {
          return callback(err)
        }

        const msg: Record<string, unknown> = {}

        Object.keys(source || {}).forEach((key) => {
          switch (key) {
            case 'alternatives': {
              const alternatives = (source!.alternatives as object[]).map((entry: Record<string, unknown>) => ({
                type: entry.contentType,
                content: entry.content,
              }))

              msg.content = ([] as object[]).concat((msg.content as object[]) || []).concat(alternatives)
              break
            }
            case 'attachments': {
              const attachments = (source!.attachments as object[]).map((entry: Record<string, unknown>) => {
                const attachment: Record<string, unknown> = {
                  type: entry.contentType,
                  content: entry.content,
                  disposition: 'attachment',
                  filename: entry.filename,
                }
                if (entry.cid) {
                  attachment.content_id = entry.cid
                  attachment.disposition = 'inline'
                }
                return attachment
              })

              msg.attachments = ([] as object[]).concat((msg.attachments as object[]) || []).concat(attachments)
              break
            }
            case 'bcc':
            case 'cc':
            case 'to':
              msg[key] = ([] as object[]).concat((source![key] as object[]) || []).map(
                (entry: { address?: string; name?: string }) => ({
                  name: entry.name,
                  email: entry.address,
                }),
              )
              break
            case 'from':
            case 'replyTo':
              msg[key] = ([] as { email?: string; name?: string }[])
                .concat((source![key] as object[]) || [])
                .map((entry: { address?: string; name?: string }) => ({
                  name: entry.name,
                  email: entry.address,
                }))
                .shift()
              break
            case 'html':
            case 'subject':
            case 'text':
              msg[key] = source![key]
              break
            case 'icalEvent': {
              const ical = source!.icalEvent as { content?: string; filename?: string }
              const attachment = {
                type: 'application/ics',
                content: ical.content,
                disposition: 'attachment',
                filename: ical.filename || 'invite.ics',
              }
              msg.attachments = ([] as object[]).concat((msg.attachments as object[]) || []).concat([attachment])
              break
            }
            case 'messageId':
              msg.headers = msg.headers || {}
              ;(msg.headers as Record<string, string>)['message-id'] = source!.messageId as string
              break
            case 'normalizedHeaders':
              msg.headers = msg.headers || {}
              Object.keys((source!.normalizedHeaders as object) || {}).forEach((header) => {
                ;(msg.headers as Record<string, string>)[header] = (source!.normalizedHeaders as Record<string, string>)[header]
              })
              break
            case 'watchHtml': {
              const alternative = {
                type: 'text/watch-html',
                content: source!.watchHtml,
              }
              msg.content = ([] as object[]).concat((msg.content as object[]) || []).concat([alternative])
              break
            }
            default:
              msg[key] = source![key]
          }
        })

        if (msg.content && (msg.content as object[]).length) {
          if (msg.text) {
            ;(msg.content as object[]).unshift({ type: 'text/plain', content: msg.text })
            delete msg.text
          }
          if (msg.html) {
            ;(msg.content as object[]).unshift({ type: 'text/html', content: msg.html })
            delete msg.html
          }
        }

        void sgMail
          .send(msg as unknown as Parameters<typeof sgMail.send>[0])
          .then(() => callback(null, { messageId: '' }))
          .catch((e: Error) => callback(e))
      })
    },
    version: '8.0.0',
  }
}

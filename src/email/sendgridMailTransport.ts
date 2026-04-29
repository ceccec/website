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
    version: '8.0.0',
    send(mail: { normalize: (cb: (err: Error | null, source?: Record<string, unknown>) => void) => void }, callback: MailCallback) {
      mail.normalize((err, source) => {
        if (err) {
          return callback(err)
        }

        const msg: Record<string, unknown> = {}

        Object.keys(source || {}).forEach((key) => {
          switch (key) {
            case 'subject':
            case 'text':
            case 'html':
              msg[key] = source![key]
              break
            case 'from':
            case 'replyTo':
              msg[key] = ([] as { name?: string; email?: string }[])
                .concat((source![key] as unknown as object[]) || [])
                .map((entry: { name?: string; address?: string }) => ({
                  name: entry.name,
                  email: entry.address,
                }))
                .shift()
              break
            case 'to':
            case 'cc':
            case 'bcc':
              msg[key] = ([] as object[]).concat((source![key] as object[]) || []).map(
                (entry: { name?: string; address?: string }) => ({
                  name: entry.name,
                  email: entry.address,
                }),
              )
              break
            case 'attachments': {
              const attachments = (source!.attachments as object[]).map((entry: Record<string, unknown>) => {
                const attachment: Record<string, unknown> = {
                  content: entry.content,
                  filename: entry.filename,
                  type: entry.contentType,
                  disposition: 'attachment',
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
            case 'alternatives': {
              const alternatives = (source!.alternatives as object[]).map((entry: Record<string, unknown>) => ({
                content: entry.content,
                type: entry.contentType,
              }))

              msg.content = ([] as object[]).concat((msg.content as object[]) || []).concat(alternatives)
              break
            }
            case 'icalEvent': {
              const ical = source!.icalEvent as { content?: string; filename?: string }
              const attachment = {
                content: ical.content,
                filename: ical.filename || 'invite.ics',
                type: 'application/ics',
                disposition: 'attachment',
              }
              msg.attachments = ([] as object[]).concat((msg.attachments as object[]) || []).concat([attachment])
              break
            }
            case 'watchHtml': {
              const alternative = {
                content: source!.watchHtml,
                type: 'text/watch-html',
              }
              msg.content = ([] as object[]).concat((msg.content as object[]) || []).concat([alternative])
              break
            }
            case 'normalizedHeaders':
              msg.headers = msg.headers || {}
              Object.keys((source!.normalizedHeaders as object) || {}).forEach((header) => {
                ;(msg.headers as Record<string, string>)[header] = (source!.normalizedHeaders as Record<string, string>)[header]
              })
              break
            case 'messageId':
              msg.headers = msg.headers || {}
              ;(msg.headers as Record<string, string>)['message-id'] = source!.messageId as string
              break
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
  }
}

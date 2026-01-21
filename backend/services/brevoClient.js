import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

const emailApi = new TransactionalEmailsApi();
emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export async function sendEmail({ to, subject, htmlContent, textContent, senderName = 'MindFlow', senderEmail = 'kind@alertforyou.me' }) {
  const sendSmtpEmail = new SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;

  return emailApi.sendTransacEmail(sendSmtpEmail);
}

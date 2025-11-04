using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Task_Management.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _config["EmailSettings:SenderName"] ?? "Task Management System",
                _config["EmailSettings:SenderEmail"] ?? ""
            ));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart("plain") { Text = body };

            using var smtp = new MailKit.Net.Smtp.SmtpClient();
            await smtp.ConnectAsync(
                _config["EmailSettings:SmtpServer"] ?? "smtp.gmail.com",
                int.Parse(_config["EmailSettings:Port"] ?? "587"),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _config["EmailSettings:SenderEmail"] ?? "",
                _config["EmailSettings:Password"] ?? ""
            );

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}

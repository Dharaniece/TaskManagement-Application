using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Task_Management.Data;
using Task_Management.Services;
using System;

namespace Task_Management.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public NotificationsController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("send-due-reminders")]
        public async Task<IActionResult> SendDueReminders()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var dueTasks = await _context.Tasks
                .Where(t => t.DueDate.HasValue &&
                            (t.DueDate.Value.Date == today || t.DueDate.Value.Date == tomorrow))
                .ToListAsync();

            int sentCount = 0;

            foreach (var task in dueTasks)
            {
                if (task.AssignedTo == null || !task.AssignedTo.Any())
                    continue;

                foreach (var email in task.AssignedTo)
                {
                    string subject = "Reminder — Your task is nearing its due date";
                    string body = $@"
Hi {email},

Task: {task.Title}
Due Date: {task.DueDate:yyyy-MM-dd}
Priority: {task.Priority}

Please complete or update the status in the Task Management app.
";

                    await _emailService.SendEmailAsync(email, subject, body);
                    sentCount++;
                }
            }

            return Ok($"✅ Sent {sentCount} reminder emails successfully!");
        }
    }
}

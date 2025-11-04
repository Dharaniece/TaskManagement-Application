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

            foreach (var task in dueTasks)
            {
                string subject = "Reminder — Your task is nearing its due date";
                string body = $@"
Hi {task.AssignedTo},

Task: {task.Title}
is due on {task.DueDate:yyyy-MM-dd}.
Priority: {task.Priority}

Please complete or update the status in the Task Management app.
";

                if (!string.IsNullOrEmpty(task.AssignedTo))
                {
                    await _emailService.SendEmailAsync(task.AssignedTo, subject, body);
                }
            }

            return Ok($"Sent {dueTasks.Count} reminder emails successfully!");
        }
    }
}

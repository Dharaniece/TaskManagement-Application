using Microsoft.EntityFrameworkCore;
using Task_Management.Data;

namespace Task_Management.Services
{
    public class DueTaskReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DueTaskReminderService> _logger;

        public DueTaskReminderService(IServiceScopeFactory scopeFactory, ILogger<DueTaskReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("✅ DueTaskReminderService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

                        var today = DateTime.UtcNow.Date;
                        var tomorrow = today.AddDays(1);

                        var dueTasks = await db.Tasks
                            .Where(t => t.DueDate.HasValue &&
                                (t.DueDate.Value.Date == today || t.DueDate.Value.Date == tomorrow))
                            .Include(t => t.AssignedTo)
                            .ToListAsync(stoppingToken);

                        foreach (var task in dueTasks)
                        {
                            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == task.AssignedTo);
                            if (user != null && !string.IsNullOrEmpty(user.Email))
                            {
                                string subject = $"⏰ Task Reminder: '{task.Title}' is due soon!";
                                string body = $@"
Hi {user.Email},
Your task '{task.Title}' is due on {task.DueDate:yyyy-MM-dd}.
Priority: {task.Priority}
Please complete or update the status.

Regards,
Task Management System";

                                await emailService.SendEmailAsync(user.Email, subject, body);
                            }
                        }

                        _logger.LogInformation($"📬 Sent reminders for {dueTasks.Count} tasks.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending due task reminders.");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}

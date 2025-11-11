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

                        // 🔹 Fetch tasks due today or tomorrow
                        var dueTasks = await db.Tasks
                            .Where(t => t.DueDate.HasValue &&
                                        (t.DueDate.Value.Date == today || t.DueDate.Value.Date == tomorrow))
                            .ToListAsync(stoppingToken);

                        foreach (var task in dueTasks)
                        {
                            // 🔹 Skip if no assigned members
                            if (task.AssignedTo == null || !task.AssignedTo.Any())
                                continue;

                            // 🔹 Send reminder to each assigned email
                            foreach (var email in task.AssignedTo)
                            {
                                if (string.IsNullOrWhiteSpace(email)) continue;

                                string subject = $"⏰ Task Reminder: '{task.Title}' is due soon!";
                                string body = $@"
Hi {email},

Your assigned task '{task.Title}' is due on {task.DueDate:yyyy-MM-dd}.
Priority: {task.Priority}
Status: {task.Status}

Please complete or update the task in the Task Management System.

Regards,
Task Management Team";

                                await emailService.SendEmailAsync(email, subject, body);
                            }
                        }

                        _logger.LogInformation($"📬 Sent reminders for {dueTasks.Count} due tasks.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error sending due task reminders.");
                }

                // Wait for 24 hours before next check
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}

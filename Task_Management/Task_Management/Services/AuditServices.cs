using Task_Management.Data;
using Task_Management.Models;

namespace Task_Management.Services
{
    public class AuditService
    {
        private readonly AppDbContext _context;

        public AuditService(AppDbContext context)
        {
            _context = context;
        }

        public void Log(string userEmail, string action, string entity, string details)
        {
            var log = new AuditLog
            {
                UserEmail = userEmail,
                Action = action,
                Entity = entity,
                Details = details,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLog.Add(log);
            _context.SaveChanges();
        }
    }
}

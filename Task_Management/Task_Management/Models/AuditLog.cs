using System;

namespace Task_Management.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string? UserEmail { get; set; }  
        public string? Action { get; set; }      
        public string? Entity { get; set; }      
        public string? Details { get; set; }     
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}

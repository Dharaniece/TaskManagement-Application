using Microsoft.AspNetCore.Mvc;
using Task_Management.Data;

namespace Task_Management.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuditController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAuditLogs()
        {
            var logs = _context.AuditLog
                .OrderByDescending(l => l.Timestamp)
                .ToList();
            return Ok(logs);
        }
    }
}
